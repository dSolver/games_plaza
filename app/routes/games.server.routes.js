'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var games = require('../../app/controllers/games.server.controller');

    var multer = require('multer');
    var randomstring = require('randomstring');



    // Games Routes
    app.route('/api/games')
        .get(games.list)
        .post(users.requiresLogin, games.canContribute, games.create);
    
    app.route('/api/list')
        .get(games.shortList);

    app.route('/api/games/:gameId')
        .get(games.read)
        .put(users.requiresLogin, games.canContribute, games.update)
        .delete(users.requiresLogin, games.hasAuthorization, games.delete);

    app.route('/api/games/:gameId/acl')
        .get(users.requiresLogin, games.gameACL);

    app.route('/api/games/:gameId/like')
        .put(users.requiresLogin, games.like)
        .delete(users.requiresLogin, games.unlike);
        
    app.route('/api/games/:gameId/unlike')
        .put(users.requiresLogin, games.unlike);

    app.route('/api/games/:gameId/similar')
        .get(games.similar);

    app.route('/api/games/:gameId/passOwnership/')
        .put(users.requiresLogin, users.hasAuthorization(['admin']), games.passGameOwnership);

    app.route('/api/gameviews')
        .get(users.requiresLogin, users.hasAuthorization(['admin']), games.sessionViews);

    app.route('/api/subreddit')
        .get(games.getSubreddit);

    /*app.route('/games/:gameId/up/')
        .post(users.requiresLogin, games.upload);*/

    app.post('/api/games/:gameId/up', [multer({
            dest: './public/uploads/',
            fileSize: 2.5 * 1024 * 1024,
            onFileUploadStart: function(file, req, res) {
                if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
                    return false;
                }
            },
            onFileUploadData: function(file, data, req, res) {
                console.log(data.length + ' of ' + file.fieldname + ' arrived');
            },
            onFileUploadComplete: games.uploadComplete
        }),
        function(req, res, next) {
            console.log('form files: ', req.files); // form files
        }
    ]);
    
    app.route('/api/games/by/:username')
        .get(games.getByUsername);

    app.route('/api/games/:gameId/:imgId').delete(users.requiresLogin, games.hasAuthorization, games.deleteImg);

    app.post('/api/games/:gameId/logo', [multer({
            dest: './public/uploads/',
            fileSize: 15 * 1024 * 1024,
            onFileUploadStart: function(file, req, res) {
                if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
                    return false;
                }
            },
            onFileUploadData: function(file, data, req, res) {
                console.log(data.length + ' of ' + file.fieldname + ' arrived');
            },
            onFileUploadComplete: games.uploadLogoComplete
        }),
        function(req, res, next) {
            console.log('form files: ', req.files); // form files
        }
    ]);


    app.route('/api/tags/:gameId/:tag')
        .put(users.requiresLogin, games.addTag)
        .delete(users.requiresLogin, games.canContribute, games.removeTag);

    app.route('/api/tags')
        .get(games.listTags);

    app.route('/api/statuses')
        .get(games.listStatuses);

    // Finish by binding the Game middleware
    app.param('gameId', games.gameByID);

    app.param('imgId', function(req, res, next, id) {
        req.imgId = id;
        next();
    });

    app.param('tag', function(req, res, next, tag) {
        req.tag = tag;
        next();
    });
};
