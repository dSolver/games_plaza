var _ = require('lodash'),
    mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Notification = mongoose.model('Notification'),
    User = mongoose.model('User');

exports.create = function(objid, notifType, title, user, attachObjid) {
    var notif = {
        notifType: notifType,
        objid: objid,
        title: title,
        creator: user
    };
    switch (notifType) {
        case 'New Comment':
            commentNotif();
            break;
        case 'New Discussion':
            discussionNotif();
            break;
        case 'New Review':
            gameNotif();
            break;
    }

    function commentNotif() {


        User.find({
            '_id': {
                $ne: user._id
            },
            'followed': objid
        }, function(err, users) {
            _.each(users, function(u) {
                findExistingUnreadNotification(u, function(){
                    var notification = new Notification(notif);
                    notification.user = u;
                    notification.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
                
            });
        });

    }

    function discussionNotif(){
        User.find({
            '_id':{
                $ne: user._id
            },
            'gamesLiked': attachObjid
        }, function(err, users){
            _.each(users, function(u) {
                var notification = new Notification(notif);
                notification.user = u;
                notification.save(function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        });
    }

    function gameNotif() {
        User.find({
            '_id': {
                $ne: user._id
            },
            'gamesLiked': objid
        }, function(err, users){
            if(err){
                console.log(err);
            }
            _.each(users, function(u) {
                var notification = new Notification(notif);
                notification.user = u;
                notification.save(function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        });
    }

    function findExistingUnreadNotification(u, notfound){
        Notification.findOne({
            'objid': objid,
            'user': u,
            'read': false,
            'notifType': notifType
        }).exec(function(err, notification){
            if(!err && !notification){
                notfound();
            } else {
                notification.count++;
                notification.created = new Date();
                notification.save(function(err){
                    if(err){
                        console.log(err);
                    }
                });
            }
        });
    }

};

exports.getNotifications = function(req, res) {
    var user = req.user;
    Notification.find({
            user: user._id
        })
        .sort({ created: -1 })
        .populate('user', 'username')
        .populate('creators', 'username').limit(100).exec(function(err, notifications) {
            if (err) {
                res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                })
            }
            res.jsonp(notifications);
        });
};

exports.getUnread = function(req, res) {
    var user = req.user;
    Notification.find({
            user: user._id,
            read: false
        }).populate('user', 'username')
        .populate('creator', 'username').exec(function(err, notifications) {
            if (err) {
                res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                })
            }
            res.jsonp(notifications);
        });
};

exports.read = function(req, res) {
    var user = req.user;
    var notification = req.notification;
    notification.read = true;
    notification.save(function(err) {
        if (!err) {
            Notification.count({
                user: user._id,
                read: false
            }, function(err, c) {
                if (err) {
                    res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.status(200).send({
                        unread: c
                    });
                }
            });
        } else {
            res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
    });
};


exports.canRead = function(req, res, next) {
    if (req.notification.user.id == req.user.id) {
        next()
    } else {
        res.status(403).send({
            message: 'You are not allowed to read this'
        });
    }
};

exports.notificationByID = function(req, res, next, id) {
    Notification.findById(id).populate('user', 'username').populate('creator', 'username').exec(function(err, notification) {
        if (err) {
            next(err);
        }

        if (!notification) {
            return next(new Error('Failed to load Notification ' + id));
        } else {
            req.notification = notification;
            next();
        }
    });
};
