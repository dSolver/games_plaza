'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Mail = mongoose.model('Mail'),
    User = mongoose.model('User'),

    errorHandler = require('./errors.server.controller'),
    _ = require('lodash');

/**
 * Create a Mail
 */
exports.create = function(req, res) {
    var mail = new Mail(req.body);
    var user = req.user;
    mail.from = user;

    User.findOne({
        username: req.body.to
    }).exec(function(err, user) {
        if (!err) {
            mail.to = user;

            mail.save(function(err, mail) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {

                    return res.send(200);
                }
            });
        } else {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
    });

};

/**
 * Show the current Mail
 */
exports.read = function(req, res) {

};

/**
 * Update a Mail
 */
exports.update = function(req, res) {

};

/**
 * Delete an Mail
 */
exports.delete = function(req, res) {

};

/**
 * List of Mails
 */
exports.list = function(req, res) {
    Mail.find({
        to: req.user._id
    }).sort('-created').populate('from', 'username').exec(function(err, mails) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp(mails);
        }
    });
};

exports.mailByID = function(req, res, next, id) {
    Mail.findById(id).populate('from', 'username').exec(function(err, mail) {
        if (err) return next(err);
        if (!mail) return next(new Error('Failed to load Mail ' + id));
        req.mail = mail;
        next();
    });
};

exports.hasAuthorization = function(req, res, next) {

    if (req.mail.to.id === req.user.id || req.user.roles.indexOf('admin') >= 0) {
        next();
    } else {
        return res.status(403).send('User is not authorized');
    }

};