'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var wikis = require('../../app/controllers/wikis.server.controller');

	// Wikis Routes
	app.route('/api/wikis')
		.get(wikis.list)
		.post(users.requiresLogin, wikis.create);

	app.route('/api/wikis/:wikiId')
		.get(wikis.read)
		.put(users.requiresLogin, wikis.hasAuthorization, wikis.update)
		.delete(users.requiresLogin, wikis.hasAuthorization, wikis.delete);

	// Finish by binding the Wiki middleware
	app.param('wikiId', wikis.wikiByID);
};
