'use strict';

var config = require('./config/env');

// individual modules

exports.booking = {
  server: {
    packagePath: 'modules/bookings',
    packageRole: 'server',
    server: config.redis,
    keyStore: config.keyStore,
    DEBUG: false
  },
  client: {
    packagePath: 'modules/bookings',
    packageRole: 'client',
    server: config.redis
  },
  module: {
    packagePath: 'modules/bookings',
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
    'server': config.db
  }
];

// interfaces

exports.expressApp = {
    'packagePath': 'interfaces/express-app',
    'config': config,
}

// main app

exports.mainapp = [ exports.expressApp, exports.booking.client ]
  .concat(exports.common);

// a command line version

exports.bookingservice = [ exports.booking.server ]
  .concat(exports.common);

// one monolith

exports.monolith = [ exports.expressApp, exports.booking.module ]
  .concat(exports.common);

// microservers - empty

module.exports = exports;
