'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Playlist Schema
 */
var PlaylistSchema = new Schema({
    description: {
        type: String,
        default: '',
        trim: true
    },
    descriptionHTML: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: '',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    lastModified: {
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
        type: Number
    },
    games: [{
        type: Schema.ObjectId,
        ref: 'Game'
    }],
    published: {
        type: Boolean,
        default: false
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

mongoose.model('Playlist', PlaylistSchema);