'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Fileupload Schema
 */
var FileuploadSchema = new Schema({
    name: {
        type: String,
        default: '',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    filename: {
        type: String,
        required: 'File name is required'
    },
    liked: {
        type: Number,
        default: 0
    },
    disliked: {
        type: Number,
        default: 0
    },
    children: [{
        type: Schema.ObjectId,
        ref: 'Comment'
    }]
});

mongoose.model('Fileupload', FileuploadSchema);