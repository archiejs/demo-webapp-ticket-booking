'use strict';

// command line arguments

var optionDefs = [
  { name: 'app', alias: 'a', type: String, defaultOption: true, defaultValue: 'app' }
];
var clArgs = require('command-line-args');
var theArgs = clArgs(optionDefs);
var theApp = theArgs.app;

// setup the app

require('./config/common/mongoose');

var Archie = require('./config/common/archie.js'); // Archiejs setup
var hasApis = (theApp === 'app');

// Load the app's dependency tree

var deptree = require('./deptree');
var theAppTree = deptree[theApp];

if(!Array.isArray(theAppTree)) {
  throw new Error(theApp + ' config does not export an ARRAY.')
}

// Setup the app

var tree = Archie.resolveConfig(theAppTree, process.cwd());

module.exports = Archie.createApp(tree, function(err, archie) {
    if(err){
        throw err;
    }

    require('./config/common/welcome');
})
.on('error', (err) => {throw err;});
