'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Achievement Schema
 */
var AchievementSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Achievement name',
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
    game: {
        type: Schema.ObjectId,
        ref: 'Game'
    },
    tier: {
        type: Number,
        default: 0, // no tier
    },
    icon: String
});

mongoose.model('Achievement', AchievementSchema);