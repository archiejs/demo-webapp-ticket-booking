'use strict';

/**
 * POST request blocks the seats
 *
 * @{params} event - eventid
 * @{params} seats - seats being booked
 * @{params}   [ {
 * @{params}      row: Number,
 * @{params}      col: Number
 * @{params}   } ]
 */

exports.create = function(req, res)
{
    var blockJ = {
        event: req.body.event,
        seats: req.body.seats,
        user: req.user._id.toString()
    };

    req.app.services.booking.checkAndBlockSeats(
        blockJ,
        function(e, ticketid){
            if(e){
                return res.status(500).send({ errors: [ e.toString() ] });
            }
            if(!ticketid){
                var errors = [ "No reply from booking microservice" ];
                return res.status(500).send({ errors: errors });
            }
            var result = {
                ticket: ticketid
            };
            res.status(200).send(result);
        }
    );
}

/**
 * PATCH request confirms the blocked seats.
 *
 * @{params} Todo -
 * @{params}  Payment website related integration
 */
 
exports.update = function(req, res)
{
    var ticketInfo = {
        ticket: req.params.id,
        user: req.user._id.toString(),
        name: req.user.fullname
    };

    req.app.services.booking.confirmSeats(ticketInfo,
        function(e) {
            if(e){
                e.printStackTrace();
                return res.status(500).send({ errors: [ e.toString() ] });
            }
            res.sendStatus(200);
        }
    );
}

// GET request gets tickets

exports.getAll = function(req, res)
{
    res.sendStatus(404);
}

// GET a particular ticket id
exports.getWithId = function(req, res)
{
    var tickid = req.params.id;

    res.sendStatus(404);
}
