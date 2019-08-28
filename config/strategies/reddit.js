'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    url = require('url'),
    RedditStrategy = require('passport-reddit').Strategy,
    config = require('../config'),
    users = require('../../app/controllers/users.server.controller');

module.exports = function() {
    // Use reddit strategy
    passport.use(new RedditStrategy({
            clientID: config.reddit.clientID,
            clientSecret: config.reddit.clientSecret,
            callbackURL: config.reddit.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            // Set the provider data and include tokens
            var providerData = profile._json;
            providerData.accessToken = accessToken;
            providerData.refreshToken = refreshToken;
            // Create the user OAuth profile
            var providerUserProfile = {
                username: profile.name,
                provider: 'reddit',
                providerIdentifierField: 'id',
                providerData: providerData
            };

            // Save the user OAuth profile
            users.saveOAuthUserProfile(null, providerUserProfile, done);
        }
    ));
};