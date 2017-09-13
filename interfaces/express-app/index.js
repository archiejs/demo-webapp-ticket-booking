var express = require('./express'),
    passport = require('./passport');

module.exports = function(options, imports){
    var config = options.config;

    var app = express.init();
    passport.init(imports.db, options);

    app.services = imports

    // add shortcuts to app

    // listen to port
    app.listen(config.port, function(err){
        if(err) throw err;
        console.log('listing at ' + config.port);
    });
}
