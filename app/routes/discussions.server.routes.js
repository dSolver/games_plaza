'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var discussions = require('../../app/controllers/discussions.server.controller');

    // Discussions Routes
    app.route('/api/discussions')
        .get(discussions.list)
        .post(users.requiresLogin, discussions.create);

    app.route('/api/discussions/:discussionId')
        .get(discussions.read)
        .put(users.requiresLogin, discussions.hasAuthorization, discussions.update)
        .delete(users.requiresLogin, discussions.hasAuthorization, discussions.delete);

    app.route('/api/discussions/:discussionId/comment')
        .put(users.requiresLogin, discussions.addComment);

    app.route('/api/discussions/:discussionId/report')
        .post(users.requiresLogin, discussions.addReport);

    app.route('/api/discussions/:discussionId/vote')
        .put(users.requiresLogin, discussions.vote);

    app.route('/api/discussions/:discussionId/follow')
        .post(users.requiresLogin, discussions.follow);

    app.route('/api/discussions/:discussionId/unfollow')
        .post(users.requiresLogin, discussions.unfollow);

    // Finish by binding the Discussion middleware
    app.param('discussionId', discussions.discussionByID);
};