'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Wiki = mongoose.model('Wiki'),
	_ = require('lodash');

/**
 * Create a Wiki
 */
exports.create = function(req, res) {
	var wiki = new Wiki(req.body);
	wiki.user = req.user;

	wiki.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(wiki);
		}
	});
};

/**
 * Show the current Wiki
 */
exports.read = function(req, res) {
	res.jsonp(req.wiki);
};

/**
 * Update a Wiki
 */
exports.update = function(req, res) {
	var wiki = req.wiki ;

	wiki = _.extend(wiki , req.body);

	wiki.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(wiki);
		}
	});
};

/**
 * Delete an Wiki
 */
exports.delete = function(req, res) {
	var wiki = req.wiki ;

	wiki.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(wiki);
		}
	});
};

/**
 * List of Wikis
 */
exports.list = function(req, res) { 
	Wiki.find().sort('-created').populate('user', 'displayName').exec(function(err, wikis) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(wikis);
		}
	});
};

/**
 * Wiki middleware
 */
exports.wikiByID = function(req, res, next, id) { 
	Wiki.findById(id).populate('user', 'displayName').exec(function(err, wiki) {
		if (err) return next(err);
		if (! wiki) return next(new Error('Failed to load Wiki ' + id));
		req.wiki = wiki ;
		next();
	});
};

/**
 * Wiki authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.wiki.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
