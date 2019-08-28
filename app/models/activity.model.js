'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Activity Schema
 */
var ActivitySchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,
        enum: ['create', 'update', 'delete']
    },
    itemType: {
        type: String,
        enum: ['review', 'game', 'discussion', 'wiki', 'comment', 'image', 'report', 'article', 'playlist']
    },
    itemId: {
        type: String
    },
    itemName: {
        type: String
    },
    itemDetails: {
        type: String
    }
});

mongoose.model('Activity', ActivitySchema);

/*The reasoning behind having a list of files for an Activity is to help the author(s) 
of the Activity find the images that have been uploaded for the purpose of this Activity*/