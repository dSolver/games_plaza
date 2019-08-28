'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Game Schema
 */
var GameDimensionSchema = new Schema({
    
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    game: {
        type: Schema.ObjectId,
        ref: 'Game'
    },
    time: Number,
    depth: Number,
    idle: Number,
    grind: Number,
    compelling: Number
});

GameDimensionSchema.index({
    '_id': 1,
    'link': 1
}, {
    unique: true
});
mongoose.model('GameDimension', GameDimensionSchema);