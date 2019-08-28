'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var playlists = require('../../app/controllers/playlists.server.controller');
    var games = require('../../app/controllers/games.server.controller');


    app.route('/api/playlists/mine')
        .get(users.requiresLogin, playlists.readMine);

    // Playlist Routes
    app.route('/api/playlists')
        .get(playlists.list)
        .post(users.requiresLogin, playlists.create);

    app.route('/api/playlists/by/:profileId')
        .get(playlists.playlistsByUser);
        
    app.route('/api/playlists/:playlistId')
        .get(playlists.read)
        .put(users.requiresLogin, playlists.hasAuthorization, playlists.update)
        .delete(users.requiresLogin, playlists.hasAuthorization, playlists.delete);
        
    app.route('/api/playlists/:playlistId/vote')
        .put(users.requiresLogin, playlists.vote);
        
    app.route('/api/playlists/:playlistId/publish')
        .post(users.requiresLogin, playlists.hasAuthorization, playlists.publish);
        
    // Finish by binding the Review middleware
    app.param('playlistId', playlists.playlistByID);
    app.param('gameId', games.gameByID);
};