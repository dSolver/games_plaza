'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    errorHandler = require('./errors.server.controller'),
    GameDimension = mongoose.model('GameDimension'),
    _ = require('lodash'),
    marked = require('marked'),
    Game = mongoose.model('Game'),
    dimensions = ['time', 'depth','idle','grind','compelling'],
    maxRating = 10;


function findMineForGame(req, res, userId, gameId, next) {
    GameDimension.findOne({
        user: userId,
        game: gameId
    }).exec(function(err, gameDimension) {
        if (!err) {
            next(req, res, gameDimension);
        }
    });
}

function normalize(gameDimension){
    dimensions.forEach(function(d){
        gameDimension[d] = Math.min(gameDimension[d], maxRating);
        gameDimension[d] = Math.max(gameDimension[d], 0);
    });
}

/**
 * Create a GameDimension
 */
exports.create = function(req, res) {
    var gameDimension = new GameDimension(req.body);
    
    gameDimension.user = req.user;
    
    normalize(gameDimension);

    gameDimension.save(function(err, gameDimension) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            req.gameDimension = gameDimension;
            if (!req.user.gameDimensioned) {
                req.user.gameDimensioned = [];
            }
            //something is wrong here - it should realize that the user has gameDimensioned this game before
            res.jsonp(gameDimension);
        }
    });
};



/**
 * Show the current GameDimension
 */
exports.read = function(req, res) {
    res.jsonp(req.gameDimension);
};

/**
 * Update a GameDimension
 */
exports.update = function(req, res) {
    var gameDimension = req.gameDimension;

    gameDimension = _.extend(gameDimension, req.body);

    if (gameDimension.content.length > 0) {
        gameDimension.contentHTML = marked(gameDimension.content);
    }
    else {
        gameDimension.contentHTML = '';
    }

    gameDimension.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        res.jsonp(gameDimension);
    });
};
