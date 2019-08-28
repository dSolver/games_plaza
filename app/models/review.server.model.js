'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Review Schema
 */
var ReviewSchema = new Schema({
    content: {
        type: String,
        default: '',
        trim: true
    },
    contentHTML: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: '',
        trim: true
    },
    score: {
        type: Number,
        default: 5,
        required: 'Must rate the game out of 5',
        min: [0, 'Score must be at least 0'],
        max: [5, 'Score cannot be higher than 5']
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    gameId: {
        type: String,
        required: 'Game for review required'
    },
    game: {
        type: Schema.ObjectId,
        ref: 'Game'
    },
    triaged: {
        type: Boolean,
        default: false
    },
    liked: {
        type: Number,
        default: 0
    },
    disliked: {
        type: Number,
        default: 0
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

mongoose.model('Review', ReviewSchema);