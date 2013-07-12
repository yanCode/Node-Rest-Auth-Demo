"use strict";

var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Auth = mongoose.model('Auth');

var authController = function (app) {

    /**
     * if authKey for this user has been in the database, delete it first.
     *
     * @param res {object} Express Http response.
     * @param userId {ObjectId} the id of logging user.
     */
    var getAuthKey = function (res, userId) {

        //only if there is no authKey, add one.
        var addAuthKey = function (res, userId) {
            Auth.addAuthKey(userId, function (err, authKey) {
                if (err) {
                    return res.json(500, err);
                }
                return res.json(200, authKey);

            });
        };

        /**
         * try to find if the authKey for this user exits.
         */
        Auth.findOne({user: userId}, function (err, authKey) {
            if (err) return res.json(500, err);
            //if authkey for this user already exists, remove it.
            if (authKey) {
                authKey.remove(function () {
                    addAuthKey(res, userId);
                });
            } else {
                addAuthKey(res, userId);
            }
        });

    };

    /**
     * login
     * @curl -i -H "Accept: application/json" -X POST -d "username=yan&password=secret"
     *      http://localhost:8080/api/login
     * @return authKey, each time when this user accesses other APIs of the site, this authKey should be provided.
     */
    app.post('/api/login', function (req, res) {
        var user = {
            username: req.body.username,
            password: req.body.password
        };

        User.login(user, function (err, userId, msg) {
            if (err) {
                res.json(500, err);
            }
            if (!userId) {
                res.json(400, {message: msg});
            } else {
                getAuthKey(res, userId);
            }
        });
    });

    app.use("/*", function (req, res) {

    })


};

module.exports = authController;