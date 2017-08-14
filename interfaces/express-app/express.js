'use strict';

/**
 * Module dependencies.
 */
var config = require('./../../config/env'),
  routeFiles = require('./routes'),
  express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  compress = require('compression'),
  methodOverride = require('method-override'),
  cookieParser = require('cookie-parser'),
  helmet = require('helmet'),
  path = require('path'),
  passport = require('passport'),
  subdomain = require('subdomain'),
  _ = require('lodash');

if (config.sessionStore.storeTo === 'redis') {
  var RedisStore = require('connect-redis')(session);
} else if (config.sessionStore.storeTo === 'memcached') {
  var MemcachedStore = require('connect-memcached')(session);
} else if (config.sessionStore.storeTo === 'mongo') {
  var MongoStore = require('connect-mongo')(session),
    mongoose = require('mongoose');
} else {
  throw new Error('no session store specified in config');
}

/**
 * Initialize local variables
 */
module.exports.initLocalVariables = function (app) {
  // Setting application local variables
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  if (config.secure && config.secure.ssl === true) {
    app.locals.secure = config.secure.ssl;
  }
  app.locals.googleAnalyticsTrackingID = config.app.googleAnalyticsTrackingID;
  app.locals.facebookAppId = config.facebook.clientID;

  // Passing the request url to environment locals
  app.use(function (req, res, next) {
    res.locals.host = req.protocol + '://' + req.hostname;
    res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
    next();
  });
};

/**
 * Initialize application middleware
 */
module.exports.initMiddleware = function (app) {
  // Showing stack errors
  app.set('showStackError', true);

  // Enable jsonp
  app.enable('jsonp callback');

  // Should be placed before express.static
  app.use(compress({
    filter: function (req, res) {
      return (/json|text/).test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  // Environment dependent middleware
  if (config.isDevelopment || config.isLocal) {
    // Enable logger (morgan)
    app.use(morgan('dev'));
  }

  if (config.isLocal) {
    // Disable views cache
    app.set('view cache', false);
  }

  if (config.isProduction) {
    app.locals.cache = 'memory';
  }

  app.set('view engine', 'pug');
  app.set('views', 'interfaces/webapp/views');

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  // Add the cookie parser
  app.use(cookieParser());

  // remove www
  const base = `${config.host}:${config.port}`
  app.use(subdomain({ base, removeWWW : true }));
};

/**
 * Configure Express session
 */
module.exports.initSession = function (app) {
  if (config.sessionStore.storeTo === 'redis') {
    var sessionStorage = new RedisStore(config.sessionStore.redis);
  } else if (config.sessionStore.storeTo === 'memcached') {
    var sessionStorage = new MemcachedStore(config.sessionStore.memcached);
  } else {
    var sessionStorage = new MongoStore({ mongooseConnection: mongoose.connection });
  }

  sessionStorage.on('disconnect', () => {
      console.info('session store is not connected');
  });

  sessionStorage.on('error', (e) => {
      console.error('session store error');
      console.error(e);
  });

  // Express MongoDB session storage
  app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: config.sessionSecret,
    cookie: {
      maxAge: config.sessionCookie.maxAge,
      httpOnly: config.sessionCookie.httpOnly,
      domain: config.sessionCookie.domain,
      secure: config.sessionCookie.secure && config.secure.ssl
    },
    key: config.sessionKey,
    store: sessionStorage
  }));

  if (config.isDevelopment || config.isProduction) {
    app.disable('etag');
    app.set('trust proxy', true);
  }

  app.use(passport.initialize());
  app.use(passport.session());
};

/**
 * Configure Helmet headers configuration
 */
module.exports.initHelmetHeaders = function (app) {
  // Use helmet to secure Express headers
  var SIX_MONTHS = 15778476000;
  app.use(helmet.frameguard());
  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.use(helmet.hsts({
    maxAge: SIX_MONTHS,
    includeSubdomains: true,
    force: true
  }));
  app.disable('x-powered-by');
};

/**
 * Configure the modules static routes
 */

module.exports.initModulesClientRoutes = function (app) {
  // Setting the app router and static folder
  app.use('/', express.static(path.resolve('interfaces/webapp/public')));
};

/**
 * Configure the routes
 */
module.exports.initRoutes = function (app) {
    routeFiles.forEach( function(jsfile){
        require( path.join( __dirname, 'routes', jsfile) ) (app); // setup routes
    });
};

/**
 * Configure error handling
 */
module.exports.initErrorRoutes = function (app) {
  app.use(function (err, req, res, next) {
    // If the error object doesn't exists
    if (!err) {
      return next();
    }

    // Log it
    console.error(err.stack);
    res.status(500).send({error: err.toString()}); // internal error
  });
};

/**
 * Initialize the Express application
 */
module.exports.init = function () {
  // Initialize express app
  var app = express();

  // Initialize Express middleware
  this.initMiddleware(app);

  // Initialize Express session
  this.initSession(app);

  // Initialize Helmet security headers
  this.initHelmetHeaders(app);

  // Initialize client routes
  this.initModulesClientRoutes(app);

  // Initialize routes
  this.initRoutes(app);

  // Initialize error routes
  this.initErrorRoutes(app);

  return app;
};
