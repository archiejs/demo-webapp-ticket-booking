var _ = require('lodash'),
    path = require('path');

// Get the current config
var envFilename = process.env.NODE_ENV || 'local'; // default
var envConfig = require('./' + envFilename) || {};

// Get the default config
var defaultConfig = require('./default');

// convenience
var convenience = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isLocal: process.env.NODE_ENV === 'local',
  isTest: process.env.NODE_ENV === 'test',
}

// Merge config files
var appConfig = _.merge(defaultConfig, envConfig, convenience);


module.exports = appConfig;
