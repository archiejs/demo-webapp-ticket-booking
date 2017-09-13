var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

module.exports.init = function (db, config) {
    var User = db.User;
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
}
