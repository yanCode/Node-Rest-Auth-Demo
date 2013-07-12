"use strict";

var demoController = function (app) {

    app.get('/api/time', function (req, res) {
        res.json(200, {'message': 'This is time page API!'});
    });

    app.get('/api/admin/time', function (req, res) {
        res.json(200, {'message': 'This is Admin time API!'});
    });


};

module.exports = demoController;