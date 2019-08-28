'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Achievement = mongoose.model('Achievement'),
    _ = require('lodash');

/**
 * Create a Achievement
 */
exports.create = function(req, res) {
    var achievement = new Achievement(req.body);
    achievement.user = req.user;

    achievement.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(achievement);
        }
    });
};

/**
 * Show the current Achievement
 */
exports.read = function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.jsonp(req.achievement);
};

/**
 * Update a Achievement
 */
exports.update = function(req, res) {
    var achievement = req.achievement;

    achievement = _.extend(achievement, req.body);

    achievement.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(achievement);
        }
    });
};

/**
 * Delete an Achievement
 */
exports.delete = function(req, res) {
    var achievement = req.achievement;

    achievement.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(achievement);
        }
    });
};

/**
 * List of Achievements
 */
exports.list = function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    Achievement.find().sort('-created').populate('user', 'displayName').exec(function(err, achievements) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(achievements);
        }
    });
};

/**
 * Achievement middleware
 */
exports.achievementByID = function(req, res, next, id) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    Achievement.findById(id).populate('user', 'displayName').exec(function(err, achievement) {
        if (err) return next(err);
        if (!achievement) return next(new Error('Failed to load Achievement ' + id));
        req.achievement = achievement;
        next();
    });
};

/**
 * Achievement authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.achievement.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};