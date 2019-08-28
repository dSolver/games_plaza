'use strict';

module.exports = {
    db: 'mongodb://' + (process.env.WORKSHOP_DB_CRED || '') + 'localhost/workshop-dev',
    app: {
        title: 'Incremental Games Plaza'
    },
    facebook: {
        clientID: process.env.WORKSHOP_FACEBOOK_ID || 'WORKSHOP_FACEBOOK_ID',
        clientSecret: process.env.WORKSHOP_FACEBOOK_SECRET || 'WORKSHOP_FACEBOOK_SECRET',
        callbackURL: '/auth/facebook/callback'
    },
    twitter: {
        clientID: process.env.WORKSHOP_TWITTER_KEY || 'WORKSHOP_TWITTER_KEY',
        clientSecret: process.env.WORKSHOP_TWITTER_SECRET || 'WORKSHOP_TWITTER_SECRET',
        callbackURL: '/auth/twitter/callback'
    },
    google: {
        clientID: process.env.WORKSHOP_GOOGLE_ID || 'WORKSHOP_GOOGLE_ID',
        clientSecret: process.env.WORKSHOP_GOOGLE_SECRET || 'WORKSHOP_GOOGLE_SECRET',
        callbackURL: '/auth/google/callback'
    },
    linkedin: {
        clientID: process.env.WORKSHOP_LINKEDIN_ID || 'WORKSHOP_LINKEDIN_ID',
        clientSecret: process.env.WORKSHOP_LINKEDIN_SECRET || 'WORKSHOP_LINKEDIN_SECRET',
        callbackURL: '/auth/linkedin/callback'
    },
    github: {
        clientID: process.env.WORKSHOP_GITHUB_ID || 'WORKSHOP_GITHUB_ID',
        clientSecret: process.env.WORKSHOP_GITHUB_SECRET || 'WORKSHOP_GITHUB_SECRET',
        callbackURL: '/auth/github/callback'
    },
    reddit: {
        clientID: process.env.WORKSHOP_REDDIT_ID || '0dzUFwdlEtzQHQ',
        clientSecret: process.env.WORKSHOP_REDDIT_SECRET || 'dMo4vsS8OpWrld8iZLu6S1mi6Qw',
        callbackURL: '/auth/reddit/callback'
    },
    steam: {
        apiKey: process.env.WORKSHOP_STEAM_ID || 'WORKSHOP_STEAM_ID',
        callbackURL: 'https://plaza.dsolver.ca/auth/steam/callback',
        realm: 'https://plaza.dsolver.ca'
    },
    mailer: {
        from: process.env.MAILER_FROM || 'MAILER_FROM',
        options: {
            service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
            auth: {
                user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
                pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
            }
        }
    }
};