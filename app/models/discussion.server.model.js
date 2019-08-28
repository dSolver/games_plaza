'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Discussion Schema
 */
var DiscussionSchema = new Schema({
    attached: {
        type: String,
        trim: true /*The attached is an ObjectId of *some* sort, not too important, because discussions can be attached to game, review, file*/
    },
    attachType: {
        type: String,
        enum: [
            'discussions',
            'games',
            'reviews',
            'wikis',
            'general'
        ]
    },
    name: {
        type: String,
        default: '',
        required: 'Discussion must have a title',
        trim: true
    },
    attachedName:{
      type: String  
    },
    created: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
    },
    contentHTML: {
        type: String,
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
    comments: [{
        type: Schema.ObjectId,
        ref: 'Comment'
    }],
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

mongoose.model('Discussion', DiscussionSchema);