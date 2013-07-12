"use strict";

/**
 * Define  userSchema & authSchema, which are used for the authentication.
 */

var mongoose = require('mongoose')
    , uuid = require('node-uuid')
    , Schema = mongoose.Schema
    , ObjectId = Schema.ObjectId
    , userSchema
    , authSchema
    , USER_ROLES = 'user,admin'.split(',');

/**
 * userSchema.
 * @type {Schema}
 */
userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: { type: String,
        required: true,
        enum: USER_ROLES
    }
});

userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified) {
        return next();
    }
    //todo encrypt password here.
    return next();
});

userSchema.methods = {
    comparePassword: function (candidatePassword) {
        var user = this;
        //todo should compare encrypted password only
        return  user.password === candidatePassword
    }
};

/**
 * User static method.
 * @type {{login: Function}}
 */
userSchema.statics = {

    /**
     * Login function, upon succeeded, the id logged user will be returned for future process.
     *
     * @param user {Object}, containing username & password.
     * @param done {Function(err,userId,message)}, callback function, if login succeeded, userId will be returned,
     *        otherwise userId will be none,with a message provided as the error message. Any system err, will be
     *        passed in first parameter err.
     * @returns {*}
     */
    login: function (user, done) {
        if (!(user && user.username && user.password)) {
            return done(null, null, 'username & password are required');
        }
        this.findOne({username: user.username}, function (err, doc) {
            //system error.
            if (err) {
                return   done(err);
            }
            //user doesn't exit.
            if (!doc) {
                return  done(null, null, "user doesn't exit!");
            }
            //password correct.
            if (doc.comparePassword(user.password)) {
                done(null, doc.id);
            } else {
                done(null, null, "password incorrect!");
            }
        });
    }
};

/**
 * authSchema.
 *
 * @type {Schema}
 */
authSchema = new Schema({
    user: {
        type: ObjectId,
        refer: 'User'
    },
    authKey: {
        type: String,
        required: true,
        unique: true
    },
    effectiveDate: {type: Date,
        default: Date.now,
        expires: '60' //expiresAfterSeconds, creating a TTL index to ensure when expiry, this record will be removed by monogoDB
    }
});
authSchema.methods = {
    /**
     * each time when a logged user accesses any api, the effective date of this authKey should be update to renew the
     * effective date to accessing time.
     */
    updateEffectiveDate: function () {
        var auth = this,
            now = new Date();
        //update the effectiveDate according to newer access time.
        if (now.getTime() - auth.effectiveDate.getTime() >= 1000 * 6) {
            auth.effectiveDate = now;
            auth.save();
        }
    }
};

authSchema.statics = {

    /**
     * add a authKey to database, this authkey is a time-based UUID.
     * @param userId
     * @param done
     */
    addAuthKey: function (userId, done) {
        var Auth = this,
        //using time-based uuid as authKey.
            authKey = uuid.v1(),
            auth = new Auth({user: userId, authKey: authKey});
        auth.save(function (err) {
            done(err, authKey);
        });
    }
};


//create and set two models into mongoose instance, they can be fetched anywhere mongoose object is presented.
mongoose.model('User', userSchema);
mongoose.model('Auth', authSchema);