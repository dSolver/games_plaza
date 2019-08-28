'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Creator = mongoose.model('Creator'),
    _ = require('lodash');

function makeIdFromName(text) {
    return text.trim().replace(/\W+/g, '_');
}

/**
 * Create a Creator
 */
exports.create = function(req, res) {
    var creator = new Creator(req.body);
    creator._id = makeIdFromName(req.body.name);
    creator.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(creator);
        }
    });
};

/**
 * Show the current Creator
 */
exports.read = function(req, res) {
    res.jsonp(req.creator);
};

/**
 * Update a Creator
 */
exports.update = function(req, res) {
    var creator = req.creator;

    creator = _.extend(creator, req.body);

    creator.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(creator);
        }
    });
};

/**
 * Delete an Creator
 */
exports.delete = function(req, res) {
    var creator = req.creator;

    creator.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(creator);
        }
    });
};

/**
 * List of Creators
 */
exports.list = function(req, res) {
    Creator.find().sort('-created').populate('user', 'displayName').exec(function(err, creators) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(creators);
        }
    });
};

/**
 * Creator middleware
 */
exports.creatorByID = function(req, res, next, id) {
    Creator.findById(id).populate('user', 'displayName').exec(function(err, creator) {
        if (err) return next(err);
        if (!creator) return next(new Error('Failed to load Creator ' + id));
        req.creator = creator;
        next();
    });
};

/**
 * Creator authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.creator.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};