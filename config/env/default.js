'use strict';

module.exports = {

  app: {
    title: 'Ticket booking demo',
    description: 'Books tickets concurrently and uses a microserver architecture'
  },

  port: process.env.PORT || 8080,

  sessionCookie: {
    maxAge: 24 * (60 * 60 * 1000),
    httpOnly: true,
    secure: false
  },

  sessionSecret: process.env.SESSION_SECRET || 'youshouldchangethistosomethingsecret',

  sessionStore: {
    storeTo: 'mongo',
  },

};
