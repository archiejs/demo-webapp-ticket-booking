# AchieJS web application boilerplate code


# How to use


## Installation

Install all dependencies npm modules (`npm install`), mongodb and redis.


## Running the monolith app

1. Run mongodb server `mongod` and redis server `redis-server`

2. Run main app, `node app.js monolith`

Next run the testcases (see below).

Check two log messages in the monolith logs - `checkAndBlockSeats` and `confirmSeats`.


## Running the microservice app

1. Run mongodb server `mongod` and redis server `redis-server`

2. Run booking service, `node app.js bookingservice`

3. Run the main app, `node app.js mainapp`

Next run the testcases (see below).

Check two log messages in the booking service logs - `checkAndBlockSeats` and `confirmSeats`.

You have a very simple microservice called over redis-kue.


## Running testcases

Run the authentication testcase (if running the first time), `mocha interfaces/express-app/test/auth.js --no-timeouts`

Run the booking testcases, `mocha interfaces/express-app/test/bookOneTicket.js --no-timeouts`


NOTE: run the app before running testcases in a separate terminal.


