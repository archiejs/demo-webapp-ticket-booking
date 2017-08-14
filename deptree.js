'use strict';

var config = require('./config/env');

// individual modules

exports.booking = {
  server: {
    packagePath: 'modules/bookings',
    packageEnhancer: 'kue',
    packageRole: 'server',
    server: config.redis,
    keyStore: config.keyStore,
    DEBUG: false
  },
  client: {
    packagePath: 'modules/bookings',
    packageEnhancer: 'kue',
    packageRole: 'client',
    server: config.redis
  },
  module: {
    packagePath: 'modules/bookings',
    packageEnhancer: 'kue',
    packageRole: 'default',
    keyStore: config.keyStore
  }
};

/*
 * Common modules are common across sub-projects.
 * Ex: db module, analytics module are contendors.
 */

exports.common = [
  {
    'packagePath': 'models',
    'packageEnhancer': 'mongodb',
    'server': config.db
  }
];

// interfaces

exports.expressApp = {
    'packagePath': 'interfaces/express-app',
    'config': config,
}

// main app

exports.webapp = [ exports.expressApp, exports.booking.client ]
  .concat(exports.common);

// a command line version

exports.bookingapp = [ exports.booking.server ]
  .concat(exports.common);

// one monolith

exports.monolith = [ exports.expressApp, exports.booking.module ]
  .concat(exports.common);

// microservers - empty

module.exports = exports;
