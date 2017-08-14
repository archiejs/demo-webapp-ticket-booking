'use strict';

//const memcacheUrl = `${process.env.MEMCACHE_PORT_11211_TCP_ADDR}:${process.env.MEMCACHE_PORT_11211_TCP_PORT}`;
const FB = JSON.parse(process.env.FB_CONFIG);
const serviceAccountConfig = JSON.parse(process.env.FIREBASE_CONFIG);

module.exports = {

  sessionCookie: {
    secure: true
  },

  secure: {
    ssl: true
  },

  sessionStore: { // use mongo
    //memcached: {
    //  hosts: [ memcacheUrl ]
    //},
    //redis: {
    //  host: process.env.REDIS_URI,
    //  port: 6379,
    //},
  },

  db: {
    uri: process.env.MONGO_URI,
    options: {
      user: process.env.MONGO_USERNAME,
      pass: process.env.MONGO_PASSWORD,
      db: {
          readPreference: 'secondaryPreferred',
          slaveOk: true,
      },
      replset: {
          replicaSet: 'rs0',
          socketOptions: {
              connectionTimeout: 50000,
              socketTimeoutMS: 50000,
          }
      },
      server: {
          w: 1,
          keepAlive: 30000,
          autoReconnect: true
      },
    },
  },

  facebook: {
    clientID: FB.clientId,
    clientSecret: FB.clientSecret,
  },

};
