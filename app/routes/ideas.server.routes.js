'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var ideas = require('../../app/controllers/ideas.server.controller');

	// Ideas Routes
	app.route('/api/ideas')
		.get(ideas.list)
		.post(users.requiresLogin, ideas.create);

	app.route('/api/ideas/:ideaId')
		.get(ideas.read)
		.put(users.requiresLogin, ideas.hasAuthorization, ideas.update)
		.delete(users.requiresLogin, ideas.hasAuthorization, ideas.delete);

	// Finish by binding the Idea middleware
	app.param('ideaId', ideas.ideaByID);
};
