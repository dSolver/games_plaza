'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    crypto = require('crypto');

module.exports = function(app) {
    // User Routes
    var users = require('../../app/controllers/users.server.controller');
    var notifications = require('../../app/controllers/notification.server.controller');

    // Setting up the users profile api
    app.route('/api/users/me').get(users.me);
    app.route('/api/users/myId').get(users.myId);

    app.route('/api/m/:username').get(users.getProfile);

    app.route('/api/users')
        .get(users.hasAuthorization(['admin']), users.list)
        .put(users.update);
    app.route('/api/user/:userId/changeRoles').post(users.hasAuthorization(['admin']), users.changeRoles);
    app.route('/api/users/accounts').delete(users.removeOAuthProvider);
    
    app.route('/api/users/count').get(users.count);

    // Setting up the users password api
    app.route('/api/users/password').post(users.changePassword);
    app.route('/auth/forgot').post(users.forgot);
    app.route('/auth/reset/:token').get(users.validateResetToken);
    app.route('/auth/reset/:token').post(users.reset);

    // Setting up the users authentication api
    app.route('/auth/signup').post(users.signup);
    app.route('/auth/signin').post(users.signin);
    app.route('/auth/signout').get(users.signout);

    // Setting the facebook oauth routes
    app.route('/auth/facebook').get(passport.authenticate('facebook', {
        scope: ['email']
    }));
    app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

    // Setting the twitter oauth routes
    app.route('/auth/twitter').get(passport.authenticate('twitter'));
    app.route('/auth/twitter/callback').get(users.oauthCallback('twitter'));

    // Setting the google oauth routes
    app.route('/auth/google').get(passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }));
    app.route('/auth/google/callback').get(users.oauthCallback('google'));

    // Setting the linkedin oauth routes
    app.route('/auth/linkedin').get(passport.authenticate('linkedin'));
    app.route('/auth/linkedin/callback').get(users.oauthCallback('linkedin'));

    // Setting the github oauth routes
    app.route('/auth/github').get(passport.authenticate('github'));
    app.route('/auth/github/callback').get(users.oauthCallback('github'));

    app.route('/auth/reddit').get(function(req, res, next) {
        req.session.state = crypto.randomBytes(32).toString('hex');
        req.session.redirect = req.query.redirect;
        passport.authenticate('reddit', {
            state: req.session.state
        })(req, res, next);
    });
    //app.route('/auth/reddit').get(passport.authenticate('reddit'));
    app.route('/auth/reddit/callback').get(users.oauthCallback('reddit'));

    app.route('/auth/steam').get(passport.authenticate('steam'));

    app.route('/auth/steam/callback').get(users.oauthCallback('steam'));


    //Getting notifications
    app.route('/api/notifications').get(users.requiresLogin, notifications.getNotifications);

    app.route('/api/notification/:notificationId').put(users.requiresLogin, notifications.canRead, notifications.read);

    app.route('/api/unread').get(users.requiresLogin, notifications.getUnread);

    // Finish by binding the user middleware
    app.param('userId', users.userByID);

    app.param('username', users.userByUsername);

    app.param('notificationId', notifications.notificationByID);
};