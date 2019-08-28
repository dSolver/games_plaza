'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Article = mongoose.model('Article'),
    _ = require('lodash'),
    slug = require('slug'),
    marked = require('marked');

/**
 * Create a article
 */
exports.create = function(req, res) {
    var article = new Article({
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags
    });

    article.user = req.user;
    article.contentHTML = marked(article.content);
    
    Article.findUniqueSlug(slug(article.title), null, function(proposedSlug){
        if(proposedSlug){
            article.slug = proposedSlug;
            article.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
        } else {
            return res.status(400).send({
                message: 'Unknown error occurred, article not created'
            });
        }
    });
};

/**
 * Show the current article
 */
exports.read = function(req, res) {
    res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function(req, res) {
    var article = req.article;
    var obj = {
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags
    };

    article = _.extend(article, obj);
    if(obj.content){
        article.contentHTML = marked(obj.content);
    }

    article.lastModified = Date.now;

    article.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

/**
 * Delete an article
 */
exports.delete = function(req, res) {
    var article = req.article;

    article.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

/**
 * List of Articles
 */
exports.list = function(req, res) {
    Article.find().sort('-created').populate('user', 'username').exec(function(err, articles) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(articles);
        }
    });
};

/**
 * Article middleware
 */
exports.articleByID = function(req, res, next, id) {
    Article.findById(id).populate('comments', 'user created contentHTML reports liked disliked').exec(function(err, article) {
        if (err) return next(err);
        if (!article) return next(new Error('Failed to load article ' + id));



        Article.populate(article, {
            path: 'comments.user',
            model: 'User',
            select: 'username'
        }, function(err, article) {
            req.article = article;
            next();
        });

    });
};

/**
 * Article authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.article.user.id !== req.user.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};