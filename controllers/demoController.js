"use strict";

/**
 * This controller is to demo the common APIs a project provides.
 * In spite of there are various level authorizations, the auth-controlled logic is not mixed with any auth code.
 * This is AOP.
 * @param app
 */

var demoController = function (app) {
    /**
     * This is to demo an API requires a user logged before accessing.
     */
    app.get('/api/time', function (req, res) {
        res.json(200, {'message': 'This is time page API!', 'user': req.user});
    });
    /**
     * mimic a admin level api.
     */
    app.get('/api/admin/time', function (req, res) {
        res.json(200, {'message': 'This is Admin time API!'});
    });


};

module.exports = demoController;