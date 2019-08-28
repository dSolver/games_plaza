'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Comment Schema
 */
var CommentSchema = new Schema({
    content: {
        type: String,
        default: '',
        required: 'Comment cannot be empty',
        trim: true
    },
    contentHTML: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    liked: {
        type: Number,
        default: 0
    },
    disliked: {
        type: Number,
        default: 0
    },
    score: {
        type: Number,
        default: 0
    },
    edited: {
        type: Date,
        default: Date.now
    },
    reports: [{
        type: String,
        enum: [
            'Spam',
            'Vote Manipulation',
            'Personal Information',
            'Troll',
            'Harrassment'
        ]
    }]
});

mongoose.model('Comment', CommentSchema);