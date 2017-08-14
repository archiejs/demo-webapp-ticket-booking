'use strict';

var redis = require('redis');
var kue = require('kue');
var async = require('async');

var BookingService = function( options, imports ) {
    this.DEBUG = options.DEBUG;
    this.EventSchema = imports['db.Event']; // access to db
    this.TicketSchema = imports['db.Ticket'];
    this.UserSchema = imports['db.User'];

    // key-value storage for blocked items

    this.keyStore = redis.createClient({
        host: options.keyStore.host,
        port: options.keyStore.port,
        user: options.keyStore.username,
        pass: options.keyStore.password
    });
    this.kvTTL = options.keyStore.ttl;

    // start

    this.keyStore.on('connect',
        function(){
            console.log('Redis key-value store for blocked seats is functional');
        }
    );
};

(function() {
    
    /*
     * This function blocks seats if they are not already blocked.
     *
     * Format: callback(error, ticketid)
     *
     */

    this.checkAndBlockSeats = function(data, done){
        console.log("checkAndBlockSeats");

        var me = this;
        var eventid = data.event;
        var ticketid;
        var seats = data.seats;
        var userid = data.user;
        var price = 0;
        
        async.waterfall([
            function(cb){
                me.EventSchema.findById(eventid, cb);
            },
            function(event, cb){
                if(!event){
                    return cb(new Error("Eventid " + eventid + " not found."));
                }
                var maxRows = event.seats.rows;
                var maxCols = event.seats.cols;

                // check if seats are available

                for(var i=0; i<seats.length; i++){
                    var seat = seats[i];
                    var row = seat.row;
                    var col = seat.col;

                    // check if the seat is available

                    if (! event.isSeatAvailable(row, col) ){
                        return cb(new Error("Seat " + row + ", " + col + " is not available"));
                    }

                    price += event.getPrice(row, col);
                }
            
                // check if seats are blocked

                async.map(
                    seats,
                    function(seat, cb){
                        var row = seat.row;
                        var col = seat.col;
                        var blockkey = eventid + "-" + row + "-" + col;
                        me.keyStore.get(blockkey, function (er, data) {
                            if (er) return cb(er); // redis error
                            if (!data || data == userid) return cb(); // not blocked or blocked by self
                            return cb(new Error("Unable to block " + row + ", " + col));
                        });
                    },
                    function(e){
                        return cb(e, event);
                    }
                );
            },
            function(event, cb){ // block them seats
                //console.log('block seats');
                async.map(
                    seats,
                    function(seat, cb){
                        var row = seat.row;
                        var col = seat.col;
                        var blockkey = eventid + "-" + row + "-" + col;
                        me.keyStore.setex(blockkey, me.kvTTL, userid, function (er, data) {
                            if (er) return cb(er); // redis error
                            return cb();
                        });
                    },
                    function(e){
                        return cb(e);
                    }
                );
            },
            function(cb){ // get a temp ticket
                //console.log('get temp ticket');
                var ticketJ = {
                    event: eventid,
                    seats: seats,
                    price: price,
                    status: 'pending',
                    createdBy: userid
                };
            
                var ticketO = new me.TicketSchema(ticketJ);
                ticketO.save(function(e, ticket){
                    if(e) {
                        e.printStackTrace();
                        return res.json(500, { errors: [ e.toString() ] });
                    }
                    ticketid = ticket._id.toString();
                    cb();
                });
            }
        ], function(e){
            //console.log('blocked a ticket');
            if(e){
                if(ticketid){ // cleanup on error
                    me.TicketSchema.removeById( ticketid );
                }
                return done(e);
            }
            done(null, ticketid);
        });
    };

    /* 
     * This function syncs various tickets into db. This keeps the
     * db updated, as a booked ticket needs to be updated at several
     * locations.
     *
     * Callback format:
     *
     * callback(error);
     *
     * Input :-
     * Accepts an array of ticket ids.
     */

    this.confirmSeats = function(data, done) {
        console.log("configmSeats");

        var me = this;
        var ticketid = data.ticket;
        var userid = data.user;
        var fullname = data.fullname;
        var ticketDoc;
        var eventid;

        async.waterfall([
            // find ticket in db
            function(cb){
                var exTime = new Date( new Date() - me.kvTTL );
                var query = {
                    _id : ticketid,
                    status: 'pending',
                    createdOn: { $gt: exTime }
                };
                me.TicketSchema.findOne(query, cb);
            },
            // check if the blocks have not expired
            function(ticket, cb){
                if(!ticket) {
                    var e = new Error("Your blocks on the seats have expired");
                    return cb(e);
                }

                ticketDoc = ticket;
                eventid = ticket.event;
                me.EventSchema.findById(eventid, cb);
            },
            // update the event
            function(event, cb){
                if(me.DEBUG) console.log('update event');
                if(!event){
                    return cb(new Error('event not found'));
                }
                var seats = ticketDoc.seats;
                var countTickets = seats.length;
                var maxRows = event.seats.rows;
                var maxCols = event.seats.cols;

                // mark seats an unavailable

                for(var i=0; i<countTickets; i++){
                    var row = seats[i].row;
                    var col = seats[i].col;
                    var idx = row * maxCols + col;
                    event.seats.available[idx] = false;
                }

                // ticketsSold

                event.ticketsSold.push({
                    name: fullname,
                    user: userid,
                    ticket: ticketid
                });

                // count
                
                event.ticketsSoldCount += countTickets;

                // isSoldOut

                event.isSoldOut = ( event.maximumTickets <= event.ticketsSoldCount);

                event.save(function(e) { cb(e); });
            },
            // update ticket
            function(cb){
                if(me.DEBUG) console.log('update ticket');
                ticketDoc.status = 'paid';
                ticketDoc.updatedOn = new Date();
                ticketDoc.save(function(e) { cb(e); });
            },
            function(cb){
                if(me.DEBUG) console.log('update ticket in user schema');
                // update ticket in user schema
                var eventid = ticketDoc.event;
                var update = {
                    $push: {
                        tickets: {
                            ticket: ticketid,
                            event: eventid 
                        }
                    }
                };
                me.UserSchema.findByIdAndUpdate(
                    userid,
                    update,
                    cb
                );
            }
        ], done );
    };

}).call(BookingService.prototype);

module.exports = BookingService;
