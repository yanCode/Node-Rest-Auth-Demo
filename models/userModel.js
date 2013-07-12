"use strict";

/**
 * Define  userSchema & authSchema, which are used for the authentication.
 */

var mongoose = require('mongoose')
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
//create and set two models into mongoose instance, they can be fetched anywhere mongoose object is presented.
mongoose.model('User', userSchema);
mongoose.model('Auth', authSchema);