'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        default: '',
        trim: true
    },
    slug: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    contentHTML: {
        type: String,
        default: '',
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    thumbnail: {
        type: String
    },
    published: {
        type: Boolean,
        default: false
    },
    publishDate: {
        type: Date
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
    tags: [{
        type: String
    }],
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

/**
 * Find possible not used username
 */
ArticleSchema.statics.findUniqueSlug = function(slug, suffix, callback) {
    var _this = this;
    var possibleSlug = slug + (suffix || '');
    _this.findOne({
        slug: possibleSlug
    }, function(err, article) {
        if (!err) {
            if (!article) {
                callback(slug);
            } else {
                return _this.findUniqueSlug(possibleSlug, (suffix || 0) + 1, callback);
            }
        } else {
            callback(null);
        }
    });
};

mongoose.model('Article', ArticleSchema);
