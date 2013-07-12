"use strict";

/**
 * This is the mongoDB config file, also loads all model definition of the whole project.
 * @author: ShengYan, Zhang
 * @since: 2013/07/11
 *
 * @type {*}
 */
var mongoose = require('mongoose')
    , dbUrl = 'mongodb://localhost/test'; //in real project, this should put on a config file.

/**
 * This may use a loop to automatically load all models.
 */
require('./../models/userModel');

//connect to db.
mongoose.connect(dbUrl, function (err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + dbUrl + '. ' + err);
    } else {
        console.log('Successfully connected to: ' + dbUrl);
    }
});