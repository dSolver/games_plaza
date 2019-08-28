'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Wiki Schema
 */
var WikiSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Wiki name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Wiki', WikiSchema);