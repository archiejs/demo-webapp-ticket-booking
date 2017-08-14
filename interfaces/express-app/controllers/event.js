'use strict';

/**
 * POST request creates an event
 *
 * @{params} name
 * @{params} description
 * @{params} venue - venue id
 * @{params} startTime
 * @{params} endTime
 * @{params} ticketCategories
 */

exports.create = function(req, res)
{
    var db = req.app.services.db;
    var eventJ = {
        name: req.body.name,
        description: req.body.description,
        venue: req.body.venue,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        createdBy: req.user._id
    };

    // validate

    var errors = [];
    if(eventJ.name == null || eventJ.name == ''){
        errors.push('Event should have a name');
    }
    if(eventJ.venue == null || eventJ.venue == ''){
        errors.push('Event should have a venue');
    }
    if(eventJ.startTime.getTime() >= eventJ.endTime.getTime()){
        errors.push('Start time should be less than end time.');
    }
    if (errors.length > 1) {
        return res.status(400).send({ errors: errors });
    }

    // check if venue exists
    db.Venue.findById(eventJ.venue, function(e, venue){
        if(e) {
            return res.sendStatus(500);
        }
        if(!venue){
            errors.push("Incorrect Venue ID in request.");
            res.status(400).send({ errors: errors });
        }

        var totalSeats = venue.seats.total;
        var available = new Array(totalSeats);
        for(var i = 0; i < totalSeats; i++) {
            available[i] = true;
        }

        eventJ.seats = {
            rows: venue.seats.rows,
            cols: venue.seats.cols,
            ticketCategories: req.body.ticketCategories,
            available: available
        };

        // create event
        var eventO = new db.Event(eventJ);
        eventO.save(function(e, eventD){
            if(e){
                return res.sendStatus(500);
            }
            var result = {
                event: eventD._id.toString()
            };
            res.status(200).send(result);
        });
    });
}


/**
 * PATCH request books one/more tickets
 *
 * @{params} for action = book,
 * @{params} tickets = Number
 * @{params} preference = adjecent only
 */

exports.update = function(req, res)
{
    res.sendStatus(404);
}

/**
* GET request for event details. Additionally user can request
* for avilable seating suggestions.
*
* @{params} event: {
* @{params} ...
* @{params}   seats: {
* @{params}      ...
* @{params}   }
* @{params} }
*/

exports.getWithId = function(req, res)
{
    var db = req.app.services.db;
    var eventid = req.params.id;
    var result = {};

    db.Event.findById(eventid, function(e, event){
        if(e) {
            e.printStackTrace();
            return res.status(500).send({ error: e.toString() });
        }
        result.event = {
            name: event.name,
            description: event.description,
            venue: event.venue,
            startTime: event.startTime,
            endTime: event.endTime,
            rows: event.seats.rows,
            cols: event.seats.cols,
            ticketCategories: event.seats.ticketCategories,
            available: event.seats.available
        };
        res.status(200).send(result);
    });
}

exports.getAll = function(req, res)
{
    res.sendStatus(404);
}
