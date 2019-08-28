'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Game Schema
 */
var GameSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Game name',
        trim: true
    },
    slug: {
        type: String,
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    shortDescription: {
        type: String
    },
    description: {
        type: String
    },
    descriptionHTML: {
        type: String
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    creators: [{
        type: Schema.ObjectId,
        ref: 'Creator'
    }],
    creatorNames: [String],
    achievements: [{
        type: Schema.ObjectId,
        ref: 'Achievement'
    }],
    link: {
        type: String,
        required: 'Please fill in a link to the game',
        unique: true
    },
    screenshots: [{
        type: Schema.ObjectId,
        ref: 'Fileupload'
    }], //array of filenames of uploaded images
    logo: {
        type: String
    },
    logoHistory:[{
        prev: {
            type: String
        },
        logo: {
            type: String
        },
        username: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    liked: {
        type: Number,
        default: 0
    },
    published: {
        type: Date
    },
    playable: {
        type: Boolean
    },
    status: {
        type: String,
        enum: [
            'Prototype',
            'Closed-Alpha',
            'Alpha',
            'Open-Alpha',
            'Closed-Beta',
            'Beta',
            'Open-Beta',
            'Released',
            'Abandoned'
        ]
    },
    tags: [{
        type: String,
        enum: [
            'Resource Management',
            'Character Management',
            'Idle Growth',
            'Story',
            'Animated',
            'RPG',
            'Strategy',
            'Action',
            'World-building',
            'FPS',
            'Simulation',
            'Prestige',
            'Clicker',
            'Simple',
            'Text-based',
            'Trading',
            'Micromanagement',
            'Registration Required',
            'Multiplayer',
            'NSFW',
            'Work Friendly',
            'Mobile',
            'Offline Progress',
            'Cloud Save',
            'Achievements',
            'Open Source',
            'Chat in game',
            'Humour',
            'Realism',
            'Pre-history',
            'Ancient',
            'Medieval',
            'Renaissance',
            'Colonial',
            'Industrial',
            'Modern',
            'Digital',
            'Future',
            'Sci-fi',
            'Fantasy',
            'Post-apocalypse',
            'Historical',
            'Fairy tale',
            'Space',
            'Atomic',
            'Mathematical',
            'Utopia',
            'Dystopia',
            'Dark',
            'Other',
            'Unity',
            'HTML 5',
            'JavaScript',
            'Flash',
            'Silverlight',
            'Source 2',
            'Unreal',
            'Blender',
            'Stencyl',
            'Phaser',
            'Java',
            'Python',
            'Dart',
            'GoLang',
            'OpenGL',
            'Android',
            'iOS',
            'WP',
            'Blackberry',
            'Web',
            'PS 3',
            'PS 4',
            'PS Vita',
            'Xbox 360',
            'Xbox One',
            'Nintendo Wii',
            'Nintendo Wii U',
            'Nintendo DS',
            'Windows',
            'Mac',
            'Unix',
            'Ads',
            'Video',
            'Donations',
            'B2P',
            'P2W',
            'Microtransactions',
            'Kongregate',
            'Newgrounds',
            'Armor Games',
            'Steam',
            'Itch.io',
            'Github',
            'Self-hosted'
        ]
    }],
    subreddit: {
        type: String
    },
    version: {
        type: String
    },
    rating: {
        type: Number
    },
    score: {
        type: Number
    },
    reviews: [{
        type: Schema.ObjectId,
        ref: 'Review'
    }],
    viewed: {
        type: Number,
        default: 0
    },
    github: {
        type: String
    },
    developer_twitter: {
        type: String
    },
    facebook: {
        type: String
    },
    googlePlay: {
        type: String
    },
    appStore: {
        type: String
    },
    windowsStore: {
        type: String
    },
    bbStore: {
        type: String
    },
    steamStore:{
        type: String
    },
    kongregate:{
      type: String  
    },
    armorGames:{
        type: String
    },
    newgrounds:{
        type: String
    },
    itchio:{
        type: String
    },
    youtube: {
        type: String
    },
    twitch: {
        type: String
    },
    locked:{
        type: Boolean
    },
    history: [{
        type: String
    }],
    rss: {
        type: String
    },
    dimensionScores: {
        time: Number,
        depth: Number,
        idle: Number,
        grind: Number,
        compelling: Number
    },
    thirdPartyData: {
        google: {
            ratingValue: Number,
            ratingCount: Number,
            numDownloads: String,
            softwareVersion: String,
            operatingSystems: String,
            lastScraped: Date,
            datePublished: String
        },
        apple: {
            ratingValue: Number,
            reviewCount: Number,
            datePublished: String,
            lastScraped: Date,
            operatingSystem: String
        },
        kongregate: {
            ratingValue: Number,
            ratingCount: Number,
            lastScraped: Date
        }
    }
});

GameSchema.index({
    '_id': 1,
    'link': 1
}, {
    unique: true
});
mongoose.model('Game', GameSchema);