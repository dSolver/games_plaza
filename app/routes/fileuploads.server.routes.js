'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var fileuploads = require('../../app/controllers/fileuploads.server.controller');

	// Fileuploads Routes
	app.route('/api/fileuploads')
		.get(fileuploads.list)
		.post(users.requiresLogin, fileuploads.create);

	app.route('/api/fileuploads/:fileuploadId')
		.get(fileuploads.read)
		.put(users.requiresLogin, fileuploads.hasAuthorization, fileuploads.update)
		.delete(users.requiresLogin, fileuploads.hasAuthorization, fileuploads.delete);

	// Finish by binding the Fileupload middleware
	app.param('fileuploadId', fileuploads.fileuploadByID);
};
