var express = require('./express');

module.exports = function(options, imports){
    var config = options.config;

    var app = express.init();
    app.services = imports

    // add shortcuts to app
    var userService = imports['userLocation']

    // listen to port
    app.listen(config.port, function(err){
        if(err) throw err;
        console.log('listing at ' + config.port);
    });
}
