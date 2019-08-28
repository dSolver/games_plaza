'use strict';

module.exports = function(app) {
    var users = require('../../app/controllers/users.server.controller');
    var creators = require('../../app/controllers/creators.server.controller');

    // Creators Routes
    app.route('/api/creators')
        .get(creators.list)
        .post(users.hasAuthorization(['admin']), creators.create);

    app.route('/api/creators/:creatorId')
        .get(creators.read)
        .put(users.hasAuthorization(['admin']), creators.update)
        .delete(users.hasAuthorization(['admin']), creators.delete);

    // Finish by binding the Creator middleware
    app.param('creatorId', creators.creatorByID);
};