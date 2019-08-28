'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Idea = mongoose.model('Idea'),
	_ = require('lodash');

/**
 * Create a Idea
 */
exports.create = function(req, res) {
	var idea = new Idea(req.body);
	idea.user = req.user;

	idea.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(idea);
		}
	});
};

/**
 * Show the current Idea
 */
exports.read = function(req, res) {
	res.jsonp(req.idea);
};

/**
 * Update a Idea
 */
exports.update = function(req, res) {
	var idea = req.idea ;

	idea = _.extend(idea , req.body);

	idea.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(idea);
		}
	});
};

/**
 * Delete an Idea
 */
exports.delete = function(req, res) {
	var idea = req.idea ;

	idea.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(idea);
		}
	});
};

/**
 * List of Ideas
 */
exports.list = function(req, res) { 
	Idea.find().sort('-created').populate('user', 'displayName').exec(function(err, ideas) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(ideas);
		}
	});
};

/**
 * Idea middleware
 */
exports.ideaByID = function(req, res, next, id) { 
	Idea.findById(id).populate('user', 'displayName').exec(function(err, idea) {
		if (err) return next(err);
		if (! idea) return next(new Error('Failed to load Idea ' + id));
		req.idea = idea ;
		next();
	});
};

/**
 * Idea authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.idea.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
