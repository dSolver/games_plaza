'use strict';

var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    games = require('./games.server.controller');
    
/**
 * Module dependencies.
 */
exports.index = function(req, res) {
    res.render('index', {
        user: req.user || null,
        games: games.getGamesList(),
        request: req
    });
};

exports.games = function(req, res){
    console.log(games.getGamesList());
    res.render('games', {
        request: req,
        games: games.getGamesList()
    });
};

exports.sitemap = function(req, res){
    res.render('sitemap', {
        requrest: req,
        games: games.getGamesList()
    });
};

/*
function checkComments(err, comment) {
    if (err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    } else {
        return res.jsonp(comment);
    }
}

function checkAchievements(err, achievement) {
    if (err) {
        commentsHandler.commentsByID(req, res, checkComments, id);
    } else {
        return res.jsonp(achievement);
    }
}

function checkArticle(err, article) {
    if (err) {
        achievementsHandler.achievementsByID(req, res, checkAchievements, id);
    } else {
        return res.jsonp(article);
    }
}

function checkCreator(err, creator) {
    if (err) {
        articlesHandler.articleByID(req, res, checkArticle, id);
    } else {
        return res.jsonp(creator);
    }
}

function checkUser(err, user) {
    if (err) {
        creatorsHandler.creatorByID(req, res, checkCreator, id);
    } else {
        return res.jsonp(user);
    }
}

function checkReview(err, review) {
    if (err) {
        usersHandler.creatorByID(req, res, checkUser, id);
    } else {
        return res.jsonp(review);
    }
}

function checkDiscussion(err, discussion) {
    if (err) {
        reviewHandler.reviewByID(req, res, checkReview, id);
    } else {
        return res.jsonp(discussion);
    }
}

function checkGame(err, game) {
    if (err) {
        discussionHandler.discussionByID(req, res, checkDiscussion, id);
    } else {
        return res.jsonp(game);
    }
}

exports.ObjectByID = function(req, res, next, id) {
    //check in Game, Discussion, Review, User
    gameHandler.gameByID(req, res, checkGame, id);

};*/