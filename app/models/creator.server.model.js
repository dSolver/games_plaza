'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Creator Schema
 */
var CreatorSchema = new Schema({
    _id: String,
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    games: [{
        type: Schema.ObjectId,
        ref: 'Game'
    }],
    website: {
        type: String
    },
    tagline: {
        type: String
    },
    intro: {
        type: String
    },
    introHTML: {
        type: String
    },
    articles: {
        type: Schema.ObjectId,
        ref: 'Article'
    },
    twitter: String,
    reddit: String,
    facebook: String,
    googleplus: String,
    logo: String,
    profilePicture: String
});

mongoose.model('Creator', CreatorSchema);

/*The reasoning behind having a list of files for an Creator is to help the author(s) 
of the Creator find the images that have been uploaded for the purpose of this Creator*/