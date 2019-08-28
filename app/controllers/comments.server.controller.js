'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    activityHandler = require('./activity.server.controller'),
    Comment = mongoose.model('Comment'),
    marked = require('marked'),
    _ = require('lodash');

/**
 * Create a Comment
 */
exports.create = function(req, res, next) {
    var comment = new Comment(req.body);
    comment.user = req.user;
    comment.contentHTML = marked(comment.content);
    comment.save(function(err, comment) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            next(comment);
        }
    });
};

/**
 * Show the current Comment
 */
exports.read = function(req, res) {
    res.jsonp(req.comment);
};

/**
 * Update a Comment
 */
exports.update = function(req, res) {
    var comment = req.comment;

    comment = _.extend(comment, req.body);

    delete comment.liked;
    delete comment.disliked;
    delete comment.score;

    comment.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(comment);
        }
    });
};

/**
 * Delete an Comment
 */
exports.delete = function(req, res) {
    var comment = req.comment;

    comment.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(comment);
        }
    });
};

/**
 * Report a comment
 */
exports.addReport = function(req, res) {
    var comment = req.comment;
    if (comment.reports.indexOf(req.body.report) < 0) {
        comment.reports.push(req.body.report);
        comment.save(function(err) {
            //do nothing... yet
        });
    }
};

/**
 * List of Comments
 */
exports.list = function(req, res) {
    Comment.find().sort('-created').populate('user', 'displayName username').exec(function(err, comments) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(comments);
        }
    });
};


function updateVote(item, user, direction) {
    var id = item._id;
    var indLiked = user.liked.indexOf(id);
    var indDisliked = user.disliked.indexOf(id);

    if (direction === 1) {
        if (indLiked >= 0) {
            //no change
            item.myVote = 1;
        } else if (indDisliked >= 0) {
            item.disliked--;
            item.myVote = 0;
            user.disliked.splice(indDisliked, 1);
        } else {
            item.liked++;
            item.myVote = 1;
            user.liked.push(id);
        }
    } else if (direction === -1) {
        if (indLiked >= 0) {
            item.liked--;
            item.myVote = 0;
            user.liked.splice(indLiked, 1);
        } else if (indDisliked >= 0) {
            //no change
            item.myVote = -1;
        } else {
            item.disliked++;
            item.myVote = -1;
            user.disliked.push(id);
        }
    }

    item.score = item.liked - item.disliked;
}

exports.vote = function(req, res) {
    var comment = req.comment;
    var user = req.user;

    var vote = req.body.vote;

    updateVote(comment, user, vote);

    comment.save(function(err) {
        if (!err) {
            user.save(function(err) {
                if (!err) {
                    return res.status(200).send();
                } else {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
            });
        } else {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
    });
};

/**
 * Comment middleware
 */
exports.commentByID = function(req, res, next, id) {
    Comment.findById(id).populate('user', 'displayName username').exec(function(err, comment) {
        if (err) return next(err);
        if (!comment) return next(new Error('Failed to load Comment ' + id));
        req.comment = comment;
        next();
    });
};

/**
 * Comment authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.comment.user.id !== req.user.id && req.user.roles.indexOf('admin') < 0) {
        return res.status(403).send('User is not authorized');
    }
    next();
};