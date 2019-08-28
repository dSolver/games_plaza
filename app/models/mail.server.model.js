'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Mail Schema
 */
var MailSchema = new Schema({
    // Mail model fields   
    // ...
    fromSystem: {
        type: Boolean
    },
    from: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    subject: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        required: 'Mail cannot be empty',
        trim: true
    },
    to: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'Mail to whom?'
    },
    created: {
        type: Date,
        default: Date.now
    },
    mailType: {
        type: String,
        enum: ['commentReply', 'postReply', 'message', 'usernameMention']
    },
    read: {
        type: Boolean,
        default: false
    }

});

mongoose.model('Mail', MailSchema);