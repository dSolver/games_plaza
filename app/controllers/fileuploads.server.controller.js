'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Fileupload = mongoose.model('Fileupload'),
	_ = require('lodash');

/**
 * Create a Fileupload
 */
exports.create = function(req, res) {
	var fileupload = new Fileupload(req.body);
	fileupload.user = req.user;

	fileupload.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(fileupload);
		}
	});
};

/**
 * Show the current Fileupload
 */
exports.read = function(req, res) {
	res.jsonp(req.fileupload);
};

/**
 * Update a Fileupload
 */
exports.update = function(req, res) {
	var fileupload = req.fileupload ;

	fileupload = _.extend(fileupload , req.body);

	fileupload.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(fileupload);
		}
	});
};

/**
 * Delete an Fileupload
 */
exports.delete = function(req, res) {
	var fileupload = req.fileupload ;

	fileupload.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(fileupload);
		}
	});
};

/**
 * List of Fileuploads
 */
exports.list = function(req, res) { 
	Fileupload.find().sort('-created').populate('user', 'displayName').exec(function(err, fileuploads) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(fileuploads);
		}
	});
};

/**
 * Fileupload middleware
 */
exports.fileuploadByID = function(req, res, next, id) { 
	Fileupload.findById(id).populate('user', 'displayName').exec(function(err, fileupload) {
		if (err) return next(err);
		if (! fileupload) return next(new Error('Failed to load Fileupload ' + id));
		req.fileupload = fileupload ;
		next();
	});
};

/**
 * Fileupload authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.fileupload.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
