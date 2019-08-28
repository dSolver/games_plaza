'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var comments = require('../../app/controllers/comments.server.controller');

    // Comments Routes
    app.route('/api/comments')
        .get(comments.list)
        .post(users.requiresLogin, comments.create);

    app.route('/api/comments/:commentId')
        .get(comments.read)
        .put(users.requiresLogin, comments.hasAuthorization, comments.update)
        .delete(users.requiresLogin, comments.hasAuthorization, comments.delete);

    app.route('/api/comments/:commentId/vote')
        .put(users.requiresLogin, comments.vote);
    // Finish by binding the Comment middleware
    app.param('commentId', comments.commentByID);
};