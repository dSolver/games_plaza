'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    http = require('http'),
    https = require('https'),
    errorHandler = require('./errors.server.controller'),
    Game = mongoose.model('Game'),
    User = mongoose.model('User'),
    im = require('imagemagick'),
    cheerio = require('cheerio'),
    slug = require('slug'),
    activityHandler = require('./activity.server.controller'),
    _ = require('lodash'),
    Fileupload = mongoose.model('Fileupload'),
    RedditApi = require('reddit-oauth'),
    marked = require('marked'),
    hoursBetweenNewFeatures = 12, //hours
    featuredGames,
    games,
    gamesList,
    gamesListTimeout = 1000 * 60 * 1, //minutes
    gamesListGenerated,
    recentGameViews = {},
    similars = {},
    redditPosts = [],
    curPosts = [];

var redditPostFields = ['num_comments', 'is_self', 'postId', 'permalink', 'title', 'domain', 'thumbnail', 'created_utc', 'author', 'score', 'link_flair_text', 'over_18', 'url'];

var minGameFields = ['_id', 'name', 'slug', 'tags', 'link'];

var standardGameFields = ['_id', 'name', 'slug', 'user', 'logo', 'viewed', 'liked', 'rating', 'tags', 'status', 'created', 'score', 'playable', 'link', 'dimensionScores', 'thirdPartyData'];

var interests = ['name', 'author', 'price', 'ratingValue', 'ratingCount', 'reviewCount', 'datePublished', 'numDownloads', 'softwareVersion', 'operatingSystem', 'operatingSystems'];

var reddit = new RedditApi({
    app_id: '0dzUFwdlEtzQHQ',
    app_secret: 'dMo4vsS8OpWrld8iZLu6S1mi6Qw'
});

var looped = 0;

function loop() {

    if (looped % (60 * hoursBetweenNewFeatures) === 0 && looped > 0) {
        pickFeaturedGames();
    }

    if (looped % 10 === 0 && featuredGames) {
        listGames();
    }

    if (looped % 10 === 0) {
        //getAndProcess();
    }

    if (looped % (60 * 24) === 0) {
        scrape();
    }

    looped++;
    setTimeout(function () {
        loop();
    }, 1000 * 60);
}

//give a 500ms delay before starting the loop
pickFeaturedGames();

setTimeout(function () {
    loop();
}, 500);

function getAndProcess() {
    reddit.get('/r/incremental_games/hot.json?limit=100', {},
        function (error, response, body) {
            if (!error) {
                redditPosts = JSON.parse(body);
                process(redditPosts);
            }
        });
}


function pickFeaturedGames() {
    //pick 10 games! or as many as there are available

    featuredGames = [];

    Game.find().populate('user', 'displayName username').exec(function (err, games) {
        if (!err) {
            var shuffled = _.shuffle(games).filter(function (g) {
                return g.logo && g.rating >= 3 && g.tags && !g.tags.some(function (tag) { return tag === 'NSFW' });
            });

            featuredGames = shuffled.slice(0, 10).map(function (f) {
                return f._id.toString();
            });

        }
    });

}


function listGames(next, fix) {
    Game.find().populate('user', 'username').exec(function (err, games) {
        if (!err) {
            gamesList = [];
            _.each(games, function (game, index) {
                var g = {};
                _.each(standardGameFields, function (f) {
                    g[f] = game[f];
                });
                if (featuredGames.indexOf(g._id.toString()) >= 0) {
                    g.featured = true;
                }
                gamesList.push(g);
                if (!game.slug || fix) {
                    game.slug = slug(game.name).toLowerCase();
                    game.save();
                }
            });

            gamesList = _.sortBy(gamesList, 'name');
            gamesListGenerated = new Date();
            if (next) {
                next();
            }
        }
    });
}

function scrape() {
    Game.find().exec(function (err, games) {
        if (!err) {
            _.each(games, function (game, index) {
                if (game.googlePlay) {
                    scrapeData(game.googlePlay, function (data) {
                        game.thirdPartyData.google = data;
                        game.save();
                    });
                }

                if (game.appStore) {
                    scrapeData(game.appStore, function (data) {
                        game.thirdPartyData.apple = data;
                        game.save();
                    });
                }
            });
        }
    });
}

function scrapeData(url, callback) {
    url = url.replace('http://', 'https://');
    url = url.replace('itmss:', 'https:');
    https.get(url, (res) => {
        var str = '';
        res.on('data', (d) => {
            str += d;
        });
        res.on('end', function () {

            var $ = cheerio.load(str);
            var obj = {};
            var numbered = ['ratingValue', 'ratingCount', 'reviewCount'];
            interests.forEach(function (i) {
                var ele = $('[itemprop=' + i + ']').get(0);
                var sele = $('[itemprop=' + i + ']').first();
                if (!ele) {
                    //console.log('not found: '+ i);
                    return;
                }
                //console.log(ele.attribs.itemprop, ele.text());
                obj[i] = (ele.attribs && ele.attribs.content) ? ele.attribs.content : sele.text();
                if (numbered.indexOf(i) >= 0) {
                    obj[i] = Number.parseFloat(obj[i]);
                }
            });
            obj.lastScraped = new Date();
            callback(obj);
        })
    }).on('error', (e) => {
        console.error(e);
    })
}

listGames(function () {
    games = gamesList;
    var url = 'https://www.reddit.com/r/incremental_games.json?limit=100';

    var searchURL = 'https://www.reddit.com/r/incremental_games/search.json?q=flair%3A%27update%27&restrict_sr=on&sort=new&t=all#up';

    var newURL = 'https://www.reddit.com/r/incremental_games/new.json?limit=100';

    //getRedditPosts(url);
}, true);

function getGames() {
    var url = 'http://plaza.dsolver.ca/api/games';

    http.get(url, (res) => {
        var str = '';
        res.on('data', (d) => {
            str += d;
        });
        res.on('end', function () {
            games = JSON.parse(str);
            /*
                //not needed anymore; not until a new db needs to be populated
                games.forEach(function(json){
                createGame(json);
            });*/
        })
    }).on('error', (e) => {
        console.error(e);
    })
}

function simplify(str) {
    var acceptedChars = (' abcdefghijklmnopqrstuvwxyz0123456789-_').split('');

    str = str.replace(/[àáâãäå]/g, 'a');
    str = str.replace(/[èéêë]/g, 'e');
    str = str.replace(/[ìíîï]/g, 'i');
    str = str.replace(/[òóôõö]/g, 'o');
    str = str.replace(/[ùúûü]/g, 'u');
    str = str.replace(/[ñ]/g, 'u');
    str = str.replace(/[ýÿ]/g, 'y');

    return str.split('').filter(function (s) {
        return acceptedChars.indexOf(s) >= 0;
    }).join('');
}

function process(resp) {
    var excludedThumbnails = ['default', 'self'];
    var posts = resp.data.children;
    var games = gamesList;
    curPosts = posts.filter(function (post) {
        return includedFlairs.indexOf(post.data.link_flair_text) >= 0;
    }).map(function (post) {
        let redditpost = {};

        let data = post.data;
        data.postId = data.id;

        redditPostFields.forEach(function (f) {
            redditpost[f] = data[f];
        });


        let flair = data.link_flair_text;
        let title = data.title.toLowerCase();
        let titleBase = simplify(title);
        let bestGame = null;
        let bestScore = Infinity;
        let secondBestScore = Infinity;
        let titlearr = titleBase.split(' ');
        let titleVariations = {};
        games.forEach(function (game) {
            let g = simplify(game.name.toLowerCase());
            let score;
            if (titleBase.indexOf(g) >= 0) {
                score = 0;
            } else {
                let x = g.split(' ').length;
                if (!titleVariations[x]) {
                    titleVariations[x] = [];
                    for (var i = 0; i <= titlearr.length - x; i++) {
                        titleVariations[x].push(titlearr.slice(i, i + x).join(' '));
                    }
                }
                score = Math.min.apply(null, titleVariations[x].map(function (t) {
                    return lev(g, t);
                }));
            }

            if (bestGame && score === bestScore) {
                if (g.length > simplify(bestGame.name.toLowerCase()).length) {
                    secondBestScore = bestScore;
                    bestGame = game;
                    bestScore = score;
                }
            } else if (score < bestScore) {
                secondBestScore = bestScore;
                bestGame = game;
                bestScore = score;
            } else if (score < secondBestScore) {
                secondBestScore = score;
            }
        });

        let dif = secondBestScore - bestScore;
        if (bestGame && bestScore / bestGame.name.length < 0.33) {
            //console.log(title, 'is most likely about ', bestGame, bestScore);//, bestGame.length, bestScore/bestGame.length, titleVariations);

            redditpost.game = {};
            minGameFields.forEach(function (f) {
                redditpost.game[f] = bestGame[f];
            });
        }

        redditpost.bestGame = bestGame.name;
        redditpost.bestScore = bestScore;


        if (excludedThumbnails.indexOf(redditpost.thumbnail) >= 0) {
            delete redditpost.thumbnail;
        }

        return redditpost;
    });
}

function lev(a, b) {
    if (a.length == 0) return b.length;
    if (b.length == 0) return a.length;

    var matrix = [];

    // increment along the first column of each row
    var i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1)); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
}

var semver = /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?\b/ig;

var includedFlairs = ['Game', 'Mobile', 'Update', 'Prototype', 'Android', 'iOS', 'Mobile Friendly', 'Unity', 'Unity Webplayer', 'WebGL', 'HTML', 'Flash', 'Cross-platform', 'Downloadable'];

function createGame(gamejson) {

    delete gamejson.user;
    delete gamejson.achievements;
    delete gamejson.creators;
    delete gamejson.screenshots;
    delete gamejson.reviews;
    delete gamejson._id;

    var game = new Game(gamejson);

    game.slug = slug(game.name).toLowerCase();
    game.save(function (err) {
        if (err) {
            console.log('Error Adding ' + game.name);
        }
    });
}

/**
 * Create a Game
 */
exports.create = function (req, res) {
    delete req.body.rating;
    delete req.body.viewed;
    delete req.body.liked;
    delete req.body.created;
    delete req.body.playable;
    console.log('Creating a game');
    var game = new Game(req.body);
    game.user = req.user;

    if (game.description && game.description.length > 0) {
        game.descriptionHTML = marked(game.description);
    }

    if (gamesList.length > 0 && gamesList.some((g) => {
        //console.log(g, game);

        return g.name.toString().toLowerCase() === game.name.toString().toLowerCase();
    })) {
        return res.status(400).send({
            message: 'Game with this name already exists'
        });
    }


    game.slug = slug(game.name).toLowerCase();

    game.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            activityHandler.create(req.user, 'create', 'game', game.name, game._id, '');

            listGames();
            res.jsonp(game);
        }
    });

};

exports.sessionViews = function (req, res) {
    res.jsonp(recentGameViews);
};

/**
 * Show the current Game
 */
exports.read = function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    //console.log(req.sessionID);
    if (!recentGameViews[req.game._id]) {
        recentGameViews[req.game._id] = [];
    }

    if (recentGameViews[req.game._id].indexOf(req.sessionID) < 0) {
        req.game.viewed++;
        recentGameViews[req.game._id].push(req.sessionID);
        req.game.save();
    }


    res.jsonp(req.game);
};

exports.gameACL = function (req, res) {
    var game = req.game;
    var isLocked = game.locked;
    if (req.user) {
        var user = req.user;
        var isAuthor = (game.user._id.toString() == user._id.toString());
        var isAdmin = (user.roles.indexOf('admin') >= 0);
        var isContrib = (user.roles.indexOf('contrib') >= 0);
        var acl = {};
        acl.canEdit = isLocked ? (isAuthor || isAdmin || isContrib) : true;
        acl.canChangeLogo = isLocked ? (isAuthor || isContrib || isAdmin) : true;
        acl.canAddScreenshots = true;
        acl.canDeleteScreenshots = (isAuthor || isContrib || isAdmin);
        acl.canRemoveTags = isLocked ? (isAuthor || isContrib || isAdmin) : true;
        acl.canAddTags = isLocked ? (isAuthor || isContrib || isAdmin) : true;
        acl.canReview = true;
        acl.canAdmin = (isAdmin);
        acl.canDeleteGame = (isAdmin);
        acl.canPassOwnership = (isAdmin);
        acl.canViewHistory = (isAdmin);

        res.jsonp(acl);
    } else {
        res.status(400).send({
            message: 'User is not logged in'
        });
    }
};

/**
 * Update a Game
 */
exports.update = function (req, res) {
    var game = req.game;

    if (!isLocked(req, res, game)) {
        delete req.body.rating;
        delete req.body.viewed;
        delete req.body.liked;
        delete req.body.created;
        delete req.body.slug;

        if (req.user.roles.indexOf('admin') < 0) {
            delete req.body.logo;
            delete req.body.creatorNames;
            delete req.body.playable;
        }

        game = _.extend(game, req.body);

        if (req.user.roles.indexOf('admin') >= 0) {
            game.creatorNames = req.body.creatorNames;
        }
        if (game.description && game.description.length > 0) {
            game.descriptionHTML = marked(game.description);
        }


        game.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                activityHandler.create(req.user, 'update', 'game', game.name, game._id, '');
                res.jsonp(game);
                listGames();
            }
        });
    }

};

/**
 * Delete an Game
 */
exports.delete = function (req, res) {
    var game = req.game;

    game.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            activityHandler.create(req.user, 'delete', 'game', game.name, game._id, '');

            listGames();
            res.jsonp(game);
        }
    });
};

exports.similar = function (req, res) {
    var game = req.game;
    var ret;
    var factors = [
        countSimilarTags
    ];

    var sims = similars[game.name];
    var now = new Date();
    if (sims && (now - sims.created < gamesListTimeout)) {
        ret = sims.games;
    } else {
        ret = gamesList.filter(function (g) {
            return g._id.toString() != game._id.toString();
        }).map(function (g) {
            return {
                game: g,
                similarity: calcSimilarity(g)
            };
        }).sort(function (a, b) {
            return b.similarity - a.similarity;
        }).slice(0, 6).map(function (gm) {
            return gm.game;
        });

        similars[game.name] = {
            games: ret,
            created: now
        };
    }

    function countSimilarTags(g) {
        return g.tags.reduce(function (tot, tag) {
            if (game.tags.indexOf(tag) >= 0) {
                return tot + 1;
            } else {
                return tot;
            }
        }, 0);
    }

    function calcSimilarity(g) {
        return factors.reduce(function (tot, fn) {
            return tot + fn(g);
        }, 0);
    }



    res.jsonp(ret);
};


/**
 * List of Games
 */
exports.list = function (req, res) {

    var now = new Date();

    function ret() {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


        if (req.query.featured) {

            return res.jsonp(featuredGames);
        } else {

            let list = gamesList.slice();
            if (req.query.playable) {
                list = list.filter((g) => g.playable);
            }

            if (req.query.tag) {
                const tag = req.query.tag.toLowerCase();

                list = list.filter((g) => {
                    if (g.tags) {
                        return g.tags.find((t) => { return t.toLowerCase() === tag });
                    }
                    return false;
                })
            }

            if (req.query.tags) {
                const tags = req.query.tags.split(',').map(t => t.toLowerCase());

                list = list.filter((g) => {
                    if (g.tags) {
                        return tags.every((t) => {
                            return g.tags.find((t) => { return _.indexOf(tags, t.toLowerCase())});
                        });
                    }
                    return false;
                });
            }

            if (req.query.random) {
                let n = Number.parseInt(req.query.random, 10);
                if (isNaN(n) || !n) {
                    n = 1;
                }
                list = _.sample(list, n);
            }

            if (req.query.sort) {
                switch (req.query.sort) {
                    case 'score':
                        list.sort((a, b) => {
                            return b.score - a.score;
                        })
                        break;

                    case 'alphabet':
                    default:
                        list = _.sortBy(list, 'name')
                        break;

                }
            } else {
                list.sort((a, b) => {
                    return b.score - a.score;
                });
            }

            return res.jsonp(list);

        }
    }

    if (gamesListGenerated && now - gamesListGenerated > gamesListTimeout) {
        listGames(ret);
    } else {
        ret();
    }

};

exports.shortList = function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var fields = ['name', 'score', 'link', 'tags', 'rating'];
    res.jsonp(gamesList.map(function (game) {
        var g = {};
        fields.forEach(function (f) {
            g[f] = game[f];
        });
        return g;
    }));
};

/**
 * Game middleware
 */
exports.gameByID = function (req, res, next, id) {
    function gameSelect(f, callback) {
        f.populate('user', 'username displayName').populate('screenshots').populate('discussions.user.username discussions.created discussions.name');
        if (!req.user || req.user.roles.indexOf('admin') < 0) {
            f.select({ 'history': 0, 'logoHistory': 0 });
        }
        f.exec(function (err, game) {
            callback(err, game);
        });
    }
    //first see if id is valid

    var isID = mongoose.Types.ObjectId.isValid(id);
    if (isID) {
        var f1 = Game.findById(id);
        gameSelect(f1, function (err, game) {
            if (!game || err) {
                var f2 = Game.findOne({
                    slug: id.toLowerCase()
                });
                gameSelect(f2, function (err, game) {
                    if (err) {
                        return next(err);
                    }

                    if (!game) return next(new Error('Failed to load Game ' + id));
                    req.game = game;
                    next();
                });
            } else {
                req.game = game;
                next();
            }
        });
    } else {
        var f2 = Game.findOne({
            slug: id.toLowerCase()
        });
        gameSelect(f2, function (err, game) {
            if (err) {
                return next(err);
            }

            if (!game) return next(new Error('Failed to load Game ' + id));
            req.game = game;
            next();
        });
    }

};

exports.getByUsername = function (req, res, next) {
    var username = req.params.username;
    Game.find({
        creatorNames: username
    }).exec(function (err, games) {
        if (err) {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var ret = _.map(games, function (game) {
                //console.log(game);
                var g = {};
                _.each(standardGameFields, function (f) {
                    g[f] = game[f];
                });
                return g;
            });
            res.jsonp(ret);
        }
    });
};


exports.like = function (req, res) {
    var game = req.game;
    var user = req.user;
    if (user.gamesLiked.indexOf(game._id) < 0) {
        user.gamesLiked.push(game._id);
        game.liked++;
        user.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err),
                    err: err
                });
            } else {
                game.save(function (err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(user);
                    }
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'user already liked this'
        });
    }
};

exports.unlike = function (req, res) {
    var game = req.game;
    var user = req.user;
    if (user.gamesLiked.indexOf(game._id) >= 0) {
        user.gamesLiked.splice(user.gamesLiked.indexOf(game._id), 1);
        game.liked--;
        user.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                game.save(function (err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(user);
                    }
                });
            }
        });
    } else {
        res.status(400).send({
            message: 'user didn\'t like this to begin with'
        });
    }
};

exports.deleteImg = function (req, res) {
    var game = req.game;
    var imgId = req.imgId;

    var index;

    for (var i = 0; i < game.screenshots.length; i++) {
        if (game.screenshots[i]._id.toString() === imgId) {
            index = i;
            break;
        }
    }

    if (index !== undefined) {
        game.screenshots.splice(index, 1);
        game.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                return res.status(200).send();
            }
        });
    } else {
        return res.status(400).send({
            message: 'image file not found in association with this game'
        });
    }

};

/**
 * Upload Files
 */
exports.upload = function (req, res) { };

exports.uploadLogo = function (req, res) { };

exports.uploadComplete = function (file, req, res) {
    im.identify(file.path, function (err, features) {
        if (!err) {
            if (features.width > 1600) {
                im.resize({
                    srcPath: file.path,
                    dstPath: file.path,
                    width: 1600
                });
            }
        } else {
            console.error(err);
        }

    });



    var fileupload = new Fileupload({
        filename: file.name,
        user: req.user._id
    });

    fileupload.save(function (err, uploadedfile) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var game = req.game;
            game.screenshots.unshift(uploadedfile._id);
            game.save(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(uploadedfile);
                }
            });
        }
    });


};

exports.uploadLogoComplete = function (file, req, res) {
    im.identify(file.path, function (err, features) {
        if (!err) {
            if (features.width > 1600) {
                im.resize({
                    srcPath: file.path,
                    dstPath: file.path,
                    width: 600
                });
            }
        } else {
            console.error(err);
        }
    });

    var game = req.game;
    var oldname = game.logo;
    game.logo = file.name;
    if (!game.logoHistory) {
        game.logoHistory = [];
    }
    game.logoHistory.push({
        prev: oldname,
        logo: file.name,
        username: req.user.username
    });

    if (game.logoHistory.length > 50) {
        game.logoHistory.shift();
    }
    game.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                filename: file.name
            });
        }
    });
};

/**
 * Tagging and untagging
 */

exports.listTags = function (req, res) {
    res.jsonp({
        Mechanics: [
            'Resource Management',
            'Character Management',
            'Idle Growth',
            'Story',
            'Animated',
            'RPG',
            'Strategy',
            'Action',
            'World-building',
            'FPS',
            'Simulation',
            'Prestige',
            'Clicker',
            'Simple',
            'Text-based',
            'Trading',
            'Micromanagement'
        ],
        Settings: [
            'Pre-history',
            'Ancient',
            'Medieval',
            'Renaissance',
            'Colonial',
            'Industrial',
            'Modern',
            'Digital',
            'Future',
            'Sci-fi',
            'Fantasy',
            'Post-apocalypse',
            'Historical',
            'Fairy tale',
            'Space',
            'Atomic',
            'Mathematical',
            'Utopia',
            'Dystopia',
            'Dark',
            'Other'
        ],
        Features: [
            'Registration Required',
            'Multiplayer',
            'NSFW',
            'Work Friendly',
            'Mobile',
            'Offline Progress',
            'Cloud Save',
            'Achievements',
            'Open Source',
            'Chat in game',
            'Humour',
            'Realism'
        ],
        Monetization: [
            'Ads',
            'Video',
            'Donations',
            'B2P',
            'P2W',
            'Microtransactions'
        ],
        Site: [
            'Kongregate',
            'Newgrounds',
            'Armor Games',
            'Steam',
            'Itch.io',
            'Github',
            'Self-hosted'
        ],
        Technology: [
            'Unity',
            'HTML 5',
            'JavaScript',
            'Flash',
            //'Silverlight',
            'Source 2',
            'Unreal',
            'Blender',
            'Stencyl',
            'Phaser',
            'Java',
            'Python',
            //'Dart',
            'GoLang',
            'OpenGL'
        ],
        Platform: [
            'Android',
            'iOS',
            //'WP',
            //'Blackberry',
            'Web',
            'PS 3',
            'PS 4',
            //'PS Vita',
            'Xbox 360',
            'Xbox One',
            //'Nintendo Wii',
            //'Nintendo Wii U',
            //'Nintendo DS',
            'Windows',
            'Mac',
            'Unix'
        ]
    });
};

function isLocked(req, res, game) {
    var user = req.user;
    var isAuthor = (game.user._id.toString() == user._id.toString());
    var isAdmin = (user.roles.indexOf('admin') >= 0);
    var isContrib = (user.roles.indexOf('contrib') >= 0);

    if (game.locked && !isAuthor && !isAdmin && !isContrib) {
        res.status(400).send({
            message: 'Game is locked from edits'
        });
        return true;
    } else {
        return false;
    }
}

function updateTag(req, res, game) {
    game.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                tag: req.tag
            });
        }
    });
}

exports.addTag = function (req, res) {
    var game = req.game;
    var tag = req.tag;
    if (!isLocked(req, res, game)) {
        if (game.tags.indexOf(tag) < 0) {
            game.tags.push(tag);
            updateTag(req, res, game);
        } else {
            res.status(400).send({
                message: 'Tag already added'
            });
        }
    }
};

exports.removeTag = function (req, res) {
    var game = req.game;
    var tag = req.tag;
    if (!isLocked(req, res, game)) {
        if (game.tags.indexOf(tag) >= 0) {
            game.tags.splice(game.tags.indexOf(tag), 1);
            updateTag(req, res, game);
        } else {
            res.status(400).send({
                message: 'game not tagged with this tag'
            });
        }
    }
};

exports.listStatuses = function (req, res) {
    res.jsonp([
        'Prototype',
        'Closed-Alpha',
        'Alpha',
        'Open-Alpha',
        'Closed-Beta',
        'Beta',
        'Open-Beta',
        'Released',
        'Abandoned'
    ]);
};

exports.passGameOwnership = function (req, res) {
    var game = req.game;
    User.findById(req.body.userId).exec(function (err, user) {
        if (!err) {
            game.user = user;
            game.save(function (err) {
                if (err) {
                    return res.status(500).send({
                        message: 'Ownership not transferred due to server error'
                    });
                } else {
                    return res.jsonp({
                        user: {
                            username: user.username,
                            _id: user._id,
                            displayName: user.displayName
                        }

                    });
                }
            });
        } else {
            return res.status(400).send({
                message: 'Ownership not transferred'
            });
        }
    });
};

/**
 * Game authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {

    if (req.game.user.id === req.user.id || req.user.roles.indexOf('admin') >= 0 || req.user.roles.indexOf('contrib') >= 0) {
        next();
    } else {
        return res.status(403).send('User is not authorized');
    }

};

exports.canContribute = function (req, res, next) {
    //remove user if we don't want regular users to contribute
    if (req.user.roles.indexOf('admin') >= 0 || req.user.roles.indexOf('contrib') >= 0 || req.user.roles.indexOf('user') >= 0) {
        next();
    } else {
        return res.status(403).send('User is not authorized');
    }
};

exports.getGamesList = function () {
    return gamesList;
};

exports.getSubreddit = function (req, res) {
    res.status(200).send(curPosts);
};
