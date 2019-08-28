'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * RedditPost Schema
 */
var RedditPostSchema = new Schema({
    permalink: String,
    domain: String,
    thumbnail: String,
    created_utc: Date,
    author: String,
    score: Number,
    link_flair_text: String,
    over_18: Boolean,
    url: String,
    postId: String,
    game: {
        type: Schema.ObjectId,
        ref: 'Game'
    }
});

RedditPostSchema.index({
    '_id': 1,
    'postId': 1
}, {
    unique: true
});

mongoose.model('RedditPost', RedditPostSchema);