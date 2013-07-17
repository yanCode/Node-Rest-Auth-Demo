"use strict";

var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Auth = mongoose.model('Auth');

var authController = function (app) {

    /**
     * validate the authKey when an API is requested, by default only '/api/login' doesn't require authorized access.
     */
    app.all('/api/*', function (req, res, next) {

        //if it's login/logout API, let it go.
        if (req.method === 'POST' && req.url.indexOf('/api/log') === 0) {
            return next();
        }
        var authKey = req.header('authKey');

        //if request without authKey
        if (!authKey) {
            res.json(403, {message: 'please provide your authKey.'});
        }
        //get this user by autKey.
        Auth.getLoggedUser(authKey, function (err, user) {
            if (err) {
                return res.json(500, err);
            }
            if (!user) {
                res.json(403, {message: 'Your authKey is invalid.'});
            }
            req.user = user;
            return next();
        })
    });

    /**
     * this function is aim to valid the api starts with '/api/admin/' should be accessed by the user whose role is admin.
     */
    app.all('/api/admin/*', function (req, res, next) {
        if (req.user && req.user.role === 'admin') {
            return next();
        }
        //remind the role is incorrect.
        return  res.json(403, {message: 'only admin role can access this api.'});
    });

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
                return res.json(200, {authKey: authKey});

            });
        };

        /**
         * try to find if the authKey for this user exits.
         */
        Auth.find({user: userId})
            .exec(function (err, auths) {
                if (err) return res.json(500, err);
                //if the authkey for this user already exists, remove it.
                if (auths.length > 0) {
                    auths.forEach(function (auth) {
                        auth.remove();
                    })
                }
                addAuthKey(res, userId);
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

    /**
     * logoff function.
     */
    app.post('/api/logout', function (req, res) {
        var authKey = req.header('authKey');
        Auth.remove({authKey: authKey}, function (err) {
            if (err) {
                res.json(500, err);
            } else {
                return res.json(200, {status: 'successfully logout'});
            }
        }); //end Auth.remove()
    });


};

module.exports = authController;