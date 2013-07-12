"use strict";

var express = require('express')
    , app = express()
    , mongoose = require('mongoose');

//Initial mongoDB related settings.
require('./config/db');

//express config.
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(app.router);

require('./config/authController')(app);
require('./controllers/demoController')(app);

app.listen(8080, function () {
    console.log('App server listening on port 8080');
});