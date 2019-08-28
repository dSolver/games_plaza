'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    errorHandler = require('./errors.server.controller'),
    Playlist = mongoose.model('Playlist'),
    _ = require('lodash'),
    marked = require('marked'),
    Game = mongoose.model('Game'),
    recalcTime = 1000 * 60 * 10; //10 minutes

function updateGamePlaylists(req, next) {
    Game.findById(req.playlist.gameId).populate('playlists').exec(function(err, game) {
        if (!err) {
            req.game = game;
            next();
        }
    });
}

function getScore(rating, count) {
    var total = count * 5;
    var up = rating * count;
    // http://amix.dk/blog/post/19588
    // 95% = 1.644853
    // 99% = 2.326348
    var z = z || 1.644853;
    if (total <= 0 || total < up) return 0

    var phat = up / total,
        z2 = z * z;
    return Math.round(((phat + z2 / (2 * total) - z * Math.sqrt((phat * (1 - phat) + z2 / (4 * total)) / total)) / (1 + z2 / total)) * 1000);
}

function findMine(req, res) {
    Playlist.find({
        user: req.user._id
    }).exec(function(err, playlists) {
        if (!err) {
            next(req, res, playlists);
        }
    });
}

/**
 * Create a Playlist
 */
exports.create = function(req, res) {

    var obj = {
        name: req.body.name,
        description: req.body.description,
        games: req.body.games
    };

    var playlist = new Playlist(obj);

    playlist.user = req.user;

    if (playlist.description && playlist.description.length > 0) {
        playlist.descriptionHTML = marked(playlist.description);
    } else {
        playlist.descriptionHTML = '';
    }

    playlist.save(function(err, playlist) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(playlist);
        }
    });
};

exports.vote = function(req, res) {
    var v = req.body.vote;
    var indL = req.user.liked.indexOf(req.playlist._id),
        indD = req.user.disliked.indexOf(req.playlist._id);
    if (v > 0) {
        if (indL < 0) {
            req.user.liked.push(req.playlist._id);
            req.playlist.liked++;
        }

        if (indD >= 0) {
            req.user.disliked.splice(indD, 1);
            req.playlist.disliked--;
        }
    } else if (v < 0) {

        if (indD < 0) {
            req.user.disliked.push(req.playlist._id);
            req.playlist.disliked++;
        }

        if (indL >= 0) {
            req.user.liked.splice(indL, 1);
            req.playlist.liked--;
        }

    } else {
        if (indD >= 0) {
            req.user.disliked.splice(indD, 1);
            req.playlist.disliked--;
        }
        if (indL >= 0) {
            req.user.liked.splice(indL, 1);
            req.playlist.liked--;
        }
    }

    req.playlist.score = getScore(req.playlist.liked, req.playlist.liked + req.playlist.disliked);


    req.user.save(function(err, playlist) {
        if (err) {
            console.error(err);
        } else {
            req.playlist.save(function(err, playlist) {
                if (!err) {
                    res.jsonp({
                        liked: playlist.liked,
                        disliked: playlist.disliked,
                        score: playlist.score
                    });
                } else {
                    console.error(err);
                }
            });
        }
    });
};



/**
 * Show the current Playlist
 */
exports.read = function(req, res) {
    res.jsonp(req.playlist);
};

/**
 * Update a Playlist
 */
exports.update = function(req, res) {
    var playlist = req.playlist;
    var obj = {};

    ['name', 'description', 'games'].forEach(function(key) {
        if (req.body[key]) {
            obj[key] = req.body[key];
        }
    });

    playlist = _.extend(playlist, obj);
    playlist.lastModified = new Date();

    if (playlist.description && playlist.description.length > 0) {
        playlist.descriptionHTML = marked(playlist.description);
    } else {
        playlist.descriptionHTML = '';
    }

    playlist.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(playlist);
        }
    });
};


/**
 * Publish
 */

exports.publish = function(req, res) {
    var playlist = req.playlist;
    playlist.published = true;
    playlist.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(playlist);
        }
    });
};

/**
 * Report a playlist
 */
exports.addReport = function(req, res) {
    var playlist = req.playlist;
    if (playlist.reports.indexOf(req.body.report) < 0) {
        playlist.reports.push(req.body.report);
        playlist.save(function(err) {
            //do nothing... yet
        });
    }
};

/**
 * List of Playlists
 */
exports.list = function(req, res) {
    var filter = {
            published: true
        },
        limit = 250,
        offset = req.query.offset || 0,
        by = req.param('by');
    if (by) {

        filter.user = by;
        if (req.user && req.user._id.toString() === by) {
            delete filter.published;
        }
    }
    Playlist.find(filter).sort('-created').populate('user', 'username').populate('games', 'game.name').limit(limit + offset).exec(function(err, playlists) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var ret = playlists.slice(offset, limit);

            res.jsonp(ret);
        }
    });
};

exports.readMine = function(req, res) {
    var filter = {
        user: req.user._id
    };

    Playlist.find(filter).exec(function(err, playlists) {

        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(playlists);
        }
    });
};

exports.playlistsByUser = function(req, res) {
    var filter = {
        user: req.params.profileId,
        published: true
    };

    if(req.user && req.user._id.toString() == req.params.profileId){
        delete filter.published
    }
    Playlist.find(filter).exec(function(err, playlists) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(playlists);
        }
    });
};

exports.delete = function(req, res) {
    var playlist = req.playlist;

    playlist.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            activityHandler.create(req.user, 'delete', 'playlist', playlist.name, playlist._id, '');

            res.jsonp(playlist);
        }
    });
}

/**
 * Playlist middleware
 */
exports.playlistByID = function(req, res, next, id) {
    Playlist.findById(id).populate('user', 'displayName username').populate('games', 'name logo rating liked shortDescription tags slug playable score').exec(function(err, playlist) {
        if (err) return next(err);
        if (!playlist) return next(new Error('Failed to load Playlist ' + id));
        req.playlist = playlist;
        next();
    });
};

/**
 * Playlist authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.playlist.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};
