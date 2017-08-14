'use strict';

exports.create = function(req, res)
{
    var Venue = req.app.services.db.Venue,
        rows = req.body.rows,
        cols = req.body.cols,
        max = rows * cols;

    var venueJ = {
        name: req.body.name,
        address: req.body.address,
        phone: req.body.phone,
        seats: {
            rows: req.body.rows,
            cols: req.body.cols,
            total: max
        },
        isActive: true,
        createdBy: req.user._id
    };

    var venueO = new Venue(venueJ);
    venueO.save(
        function(e, venueDoc){
            if(e) {
                return res.sendStatus(500);
            }
            var result = {
                venue: venueDoc._id.toString()
            };
            res.status(200).send(result);
        }
    );
}

exports.update = function(req, res)
{
}

exports.getAll = function(req, res)
{
}

exports.getWithId = function(req, res)
{
}
