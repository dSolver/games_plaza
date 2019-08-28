'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
    url = require('url'),
    SteamStrategy = require('passport-steam').Strategy,
    config = require('../config'),
    users = require('../../app/controllers/users.server.controller');

module.exports = function() {
    // Use steam strategy
    passport.use(new SteamStrategy({
            apiKey: config.steam.apiKey,
            realm: config.steam.realm,
            returnURL: config.steam.callbackURL
        },
        function(openidURL, profile, done) {
            // Set the provider data and include tokens
            var providerData = profile._json;
            // Create the user OAuth profile
            var providerUserProfile = {
                username: profile.displayName,
                provider: 'steam',
                providerIdentifierField: 'steamid',
                providerData: providerData
            };

            // Save the user OAuth profile
            users.saveOAuthUserProfile(null, providerUserProfile, done);
        }
    ));
};