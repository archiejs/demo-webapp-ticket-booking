'use strict';
var mongoose = require('mongoose');

var ticketSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    status: String, // paid, pending, cancelled
    seats: [{
        row: Number,
        col: Number
    }],
    price: Number, // INR
    
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedOn: { type: Date, default: Date.now },
    createdOn: { type: Date, default: Date.now }
});

//Schema.index({ });

module.exports = mongoose.model('Ticket', ticketSchema);
