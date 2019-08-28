'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller.js'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    User = mongoose.model('User'),
    marked = require('marked'),
    Game = mongoose.model('Game'),
    Discussion = mongoose.model('Discussion'),
    Playlist = mongoose.model('Playlist');

var badges = [
    {
        label: 'Awesome Member',
        icon: 'awesome'
    },{
        label: 'Silver Member',
        icon: 'silver'
    },{
        label: 'Gold Member',
        icon: 'gold'
    }

]

/**
 * Update user details
 */
exports.update = function(req, res) {
    // Init Variables
    var user = req.user;
    var message = null;

    // For security measurement we remove the roles from the req.body object
    delete req.body.roles;
    delete req.body.notification;

    if (req.body.intro) {
        req.body.introHTML = marked(req.body.intro);
    }
    if (user) {
        // Merge existing user
        user = _.extend(user, req.body);
        user.updated = Date.now();
        user.displayName = user.firstName + ' ' + user.lastName;

        user.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.login(user, function(err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json(user);
                    }
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};

exports.changeRoles = function(req, res) {
    var user = req.profile;
    user.roles = req.body.roles;

    user.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            return res.jsonp(user);
        }
    });
};

/**
 * Send User
 */
exports.me = function(req, res) {
    res.json(req.user || null);
};

exports.myId = function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.user) {
        res.jsonp(req.user._id);
    } else {
        res.jsonp(null);
    }

};

exports.getProfile = function(req, res) {
    var profile = req.profile;
    //calc user points
    var now = new Date();
    var calcPointsFrequency = 1000 * 60 * 30; //30 minutes
    var points = req.profile.points;
    var playlistPoints = req.profile.playlistPoints,
        gamePoints = req.profile.gamePoints,
        discussionPoints = req.profile.discussionPoints;
    var gamesAdded;

    if (!req.profile.pointsUpdated || now - req.profile.pointsUpdated > calcPointsFrequency) {
        //calculated the points and save it

        var calcPlaylistPt = false,
            calcGamePt = false,
            calcDiscussionPt = false;


        Playlist.find({
            user: req.profile._id,
            published: true
        }).exec(function(err, list) {
            if (!err) {
                if (list) {
                    playlistPoints = list.reduce(function(tot, p) {
                        return tot + (p.score || 0);
                    }, 0);
                }
            }
            calcPlaylistPt = true;
            allReady();
        });

        Game.find({
            user: req.profile._id
        }).exec(function(err, list) {
            if (!err) {
                if (list) {
                    gamesAdded = list;
                    gamePoints = list.reduce(function(tot, p) {
                        return tot + (p.score || 0);
                    }, 0)
                }
            }
            calcGamePt = true;
            allReady();
        });

        Discussion.find({
            user: req.profile._id
        }).exec(function(err, list) {
            if (!err) {
                if (list) {
                    discussionPoints = list.reduce(function(tot, p) {
                        return tot + (p.score || 0);
                    }, 0)
                }
            }
            calcDiscussionPt = true;
            allReady();
        });

        function allReady() {
            if (calcPlaylistPt && calcGamePt && calcDiscussionPt) {
                points = playlistPoints + gamePoints + discussionPoints;

                req.profile.points = points;
                req.profile.discussionPoints = discussionPoints;
                req.profile.gamePoints = gamePoints;
                req.profile.playlistPoints = playlistPoints;
                req.profile.pointsUpdated = now;
                req.profile.save();
            }

        }
    }


    var ret = {
        _id: profile._id,
        username: profile.username,
        created: profile.created,
        intro: profile.intro,
        introHTML: profile.introHTML,
        tagline: profile.tagline,
        achievements: profile.achievements,
        twitter: profile.twitter,
        facebook: profile.facebook,
        github: profile.github,
        reviewed: profile.reviewed,
        points: points,
        discussionPoints: discussionPoints,
        playlistPoints: playlistPoints,
        gamePoints: gamePoints,
        gamesAdded: gamesAdded,
        badges: profile.badges
    };
    
    res.jsonp(ret);

};

/**
 * List users (only available to admin)
 */
exports.list = function(req, res) {
    User.find({}, {
        _id: 1,
        name: 1,
        username: 1,
        email: 1,
        provider: 1,
        roles: 1
    }).exec(function(err, users) {
        if (!err) {
            res.jsonp(users);
        } else {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
    });
};

exports.count = function(req, res){
    User.find({},{_id:1}).exec(function(err, users){
        if(!err){
            res.status(200).send({
                count: users.length
            })
        } else {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
    });
};