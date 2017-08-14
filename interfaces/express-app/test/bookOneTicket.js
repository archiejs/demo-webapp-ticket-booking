var assert = require('assert');
var supertest = require('supertest');

require('should');
require('should-http');

var url = 'http://127.0.0.1:3000/v1';

var user = {
    username: 'naval',
    password: 'naval'
};

var venueid;
var eventid;
var ticketid;

describe('Booking Testcase:', function(){
    var request = supertest.agent(url);

    before(function(done) {
        request
        .post('/login')
        .send(user)
        .end(function(err, res){
            if(err){
                throw err;
            }
            done();
        });
    });

    describe('Book 1 ticket:', function(){
        it('should create a venue', function(done){
            var body = {
                name: 'Test Venue',
                address: 'Some address',
                phone: '8129323',
                rows: 3,
                cols: 10
            };
            request
            .post('/venue')
            .send(body)
            .end(function(err, res){
                if(err){
                    throw err;
                }
                res.should.have.status(200);
                res.body.should.have.property('venue');
                venueid = res.body.venue;
                done();
            });
        });
    
        it('should create an event', function(done){
            var body = {
                name: 'Test Event',
                description: 'No description',
                venue: venueid,
                startTime: new Date(2015, 11, 27, 12, 0, 0, 0),
                endTime: new Date(2015, 11, 28, 12, 0, 0, 0)
            };
            request
            .post('/event')
            .send(body)
            .end(function(err, res){
                if(err){
                    throw err;
                }
                res.should.have.status(200);
                res.body.should.have.property('event');
                eventid = res.body.event;
                done();
            });
        });
    
        it('should block a ticket', function(done){
            var body = {
                event: eventid,
                seats: [
                    { row: 0, col: 0 },
                    { row: 0, col: 1 },
                    { row: 0, col: 2 }
                ]
            };
            request
            .post('/ticket')
            .send(body)
            .end(function(err, res){
                if(err){
                    throw err;
                }
                res.should.have.status(200);
                res.body.should.have.property('ticket');
                ticketid = res.body.ticket;
                done();
            });
        });

        it('should book a ticket', function(done){
            request
            .patch('/ticket/'+ticketid)
            .end(function(err, res){
                if(err){
                    throw err;
                }
                res.should.have.status(200);
                done();
            });
        });
    });
});
