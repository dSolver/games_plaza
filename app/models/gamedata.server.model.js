'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * GameData Schema
 */
var GameDataSchema = new Schema({
    gameName: String,
    gameData: String
});

mongoose.model('GameData', GameDataSchema);

/*The reasoning behind having a list of files for an GameData is to help the author(s) 
of the GameData find the images that have been uploaded for the purpose of this GameData*/