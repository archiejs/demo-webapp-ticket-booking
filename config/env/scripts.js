'use strict';

module.exports = {

  db: {
    uri: process.env.MONGO_URI,
    options: {
      user: process.env.MONGO_USERNAME,
      pass: process.env.MONGO_PASSWORD,
      /* removed replica set
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
      */
      server: {
          w: 1,
          keepAlive: 30000,
          autoReconnect: true
      },
    },
  },

};
