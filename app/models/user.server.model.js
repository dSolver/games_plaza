'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
    return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
    return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        default: ''
    },
    lastName: {
        type: String,
        trim: true,
        default: ''
    },
    displayName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        default: ''
    },
    username: {
        type: String,
        unique: 'testing error message',
        required: 'Please fill in a username',
        trim: true
    },
    password: {
        type: String,
        default: ''
    },
    salt: {
        type: String
    },
    provider: {
        type: String,
        required: 'Provider is required'
    },
    providerData: {},
    additionalProvidersData: {},
    roles: {
        type: [{
            type: String,
            enum: ['user', 'developer', 'admin']
        }],
        default: ['user']
    },
    gamesLiked: [{
        type: Schema.ObjectId,
        ref: 'Game'
    }],
    /*list of things the user has liked or disliked*/
    liked: [{
        type: String,
    }],
    disliked: [{
        type: String,
    }],
    reviewed: [{
        type: Schema.ObjectId,
        ref: 'Game'
    }],
    followed: [{
        type: Schema.ObjectId,
        ref: 'Discussion'
    }],
    updated: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    },
    /* For reset password */
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    achievements: [{
        ach: {
            type: Schema.ObjectId,
            ref: 'Achievement'
        },
        unlocked: Date
    }],
    gp: {
        type: Number,
        default: 0
    },
    /* api key for services, generated with  */
    apikey: String,
    intro: String,
    introHTML: String,
    tagline: {
        type: String,
        trim: true,
        default: ''
    },
    twitter: String,
    facebook: String,
    github: String,
    picture: String,
    logo: String,
    recentLoungeGames: [{
        type: Schema.ObjectId,
        ref: 'Game'
    }],
    points: {
        type: Number,
        default: 0
    },
    discussionPoints: {
        type: Number,
        default: 0
    },
    gamePoints: {
        type: Number,
        default: 0
    },
    playlistPoints: {
        type: Number,
        default: 0
    },
    pointsUpdated:{
        type: Date
    },
    badges: [{
        label: String,
        icon: String,
        dateEarned: Date
    }]
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
    if (this.password && this.password.length > 6) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
    if (this.salt && password) {
        return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
    } else {
        return password;
    }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
    var _this = this;
    var possibleUsername = username + (suffix || '');

    _this.findOne({
        username: possibleUsername
    }, function(err, user) {
        if (!err) {
            if (!user) {
                callback(possibleUsername);
            } else {
                return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
            }
        } else {
            callback(null);
        }
    });
};

mongoose.model('User', UserSchema);