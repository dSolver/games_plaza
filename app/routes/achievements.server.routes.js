'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var achievements = require('../../app/controllers/achievements.server.controller');

    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    // Achievements Routes
    app.route('/api/achievements')
        .get(achievements.list)
        .post(users.requiresLogin, users.hasAuthorization(['developer']), achievements.create);

    app.route('/api/achievements/:achievementId')
        .get(achievements.read)
        .put(users.requiresLogin, achievements.hasAuthorization, achievements.update)
        .delete(users.requiresLogin, achievements.hasAuthorization, achievements.delete);

    // Finish by binding the Achievement middleware
    app.param('achievementId', achievements.achievementByID);
};