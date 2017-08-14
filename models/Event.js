'use strict';
var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
    name: String,
    description: String,

    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    startTime: Date,
    endTime: Date,
    seats: {
        rows: Number,
        cols: Number,
        ticketCategories: [{
           price: Number, // INR
           row: Number
        }],
        available: [Boolean] // Available seats
    },
    
    maximumTickets: Number,
    ticketsSoldCount: {type: Number, default: 0},
    ticketsSold: [{
        name: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }
    }],
    isSoldOut: { type: Boolean, default: false },
    
    isActive: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedOn: { type: Date, default: Date.now },
    createdOn: { type: Date, default: Date.now }
});

eventSchema.methods.isSeatAvailable = function(row, col){
    var maxRows = this.seats.rows;
    var maxCols = this.seats.cols;
    
    if (maxRows < row || maxCols < col) {
        return false; // no such seat
    }

    var index = row * maxCols + col;
    if( this.seats.available[index] == false ) {
        return false; // is not available
    }
    return true;
};

eventSchema.methods.getPrice = function(row, col){
    for(var i=0; i < this.seats.ticketCategories; i++) {
        var tickCat = this.seats.ticketCategories[i];
        if(tickCat.row == row) {
            return tickCat.price;
        }
    }
    return 0;
};

//Schema.index({ });

module.exports = mongoose.model('Event', eventSchema);
