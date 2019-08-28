'use strict';


var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Activity = mongoose.model('Activity'),
    _ = require('lodash');


exports.create = function(user, action, itemType, itemName, itemId, itemDetails) {
    if (user) {
        var activity = new Activity({
            user: user,
            action: action,
            itemType: itemType,
            itemName: itemName,
            itemId: itemId,
            itemDetails: itemDetails
        });



        activity.save(function(err) {
            if (err) {
                console.log(errorHandler.getErrorMessage(err));
                console.log('Error saving activity', activity);
            }
        });
    }

};

exports.list = function(req, res) {
    var params = req.params;
    var show = [];
    Activity.find().sort('-created').populate('user', 'username').exec(function(err, activities) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var ret = [];
            var level = 0;
            if (req.user) {
                level = 1;
            }
            if (req.user && req.user.roles.indexOf('contrib') >= 0) {
                level = 2;
            }
            if (req.user && req.user.roles.indexOf('admin') >= 0) {
                level = 3;
            }
            var lastActivity;
            _.each(activities, function(activity) {
                if (ret.length < 10) {
                    if (uniqueEnough(ret, activity)) {
                        switch (activity.itemType) {
                            /*case 'game':
                                if (activity.action === 'create') {
                                    ret.push(activity);
                                } else if (activity.action === 'update' && level >= 1) {
                                    ret.push(activity);
                                } else if (activity.action === 'delete' && level >= 3) {
                                    ret.push(activity);
                                }
                                break;*/
                            case 'discussion':
                                if (activity.action === 'create') {
                                    ret.push(activity);
                                } else if (activity.action === 'update' && level >= 3) {
                                    ret.push(activity);
                                } else if (activity.action === 'delete' && level >= 3) {
                                    ret.push(activity);
                                }
                                break;
                            case 'discussion':
                            case 'wiki':
                                if (activity.action === 'create') {
                                    ret.push(activity);
                                } else if (activity.action === 'update' && level >= 3) {
                                    ret.push(activity);
                                } else if (activity.action === 'delete' && level >= 3) {
                                    ret.push(activity);
                                }
                                break;
                            case 'playlist':
                                if(level >= 3){
                                    ret.push(activity);
                                }
                        }
                    }

                }
            });

            res.json(ret);
        }
    });
};


function uniqueEnough(arr, activity){
    //check
    return !arr.some(function(_a){
        return _a.user == activity.user
            && _a.action == activity.action
            && _a.itemType == activity.itemType
            && _a.itemId == activity.itemId
            && _a.itemName == activity.itemName
            && _a.itemDetails == activity.itemDetails
            && Math.abs(_a.created - activity.created) < 1000 * 60 * 15; //within 15 minutes
    });
}