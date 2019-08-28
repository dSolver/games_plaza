'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    activity = require('../../app/controllers/activity.server.controller');

module.exports = function(app) {
    app.route('/api/activity').get(activity.list);
};