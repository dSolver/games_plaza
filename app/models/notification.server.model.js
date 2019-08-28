'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Notification Schema
 */
var NotificationSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    creator: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    notifType: {
        type: String,
        enum: ['New Comment', 'New Discussion', 'New Review']
    },
    objid:{
        type: String
    },
    title: String,
    read: {
        type: Boolean,
        default: false
    },
    count: {
        type: Number,
        default: 1
    }

});

mongoose.model('Notification', NotificationSchema);

/*The reasoning behind having a list of files for an Notification is to help the author(s) 
of the Notification find the images that have been uploaded for the purpose of this Notification*/