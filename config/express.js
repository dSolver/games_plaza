'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    passport = require('passport'),
    mongoStore = require('connect-mongo')(session),
    flash = require('connect-flash'),
    config = require('./config'),
    consolidate = require('consolidate'),
    path = require('path'),
    expressThumbnail = require('express-thumbnail'),
    socketio = require('socket.io');

module.exports = function(db) {
    // Initialize express app
    var app = express();
    
    

    // Globbing model files
    config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
        require(path.resolve(modelPath));
    });
    
    

    // Setting application local variables
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    app.locals.keywords = config.app.keywords;
    app.locals.facebookAppId = config.facebook.clientID;
    app.locals.jsFiles = config.getJavaScriptAssets();
    app.locals.cssFiles = config.getCSSAssets();

    // Passing the request url to environment locals
    app.use(function(req, res, next) {
        res.locals.url = req.protocol + '://' + req.headers.host + req.url;
        next();
    });
    


    // Should be placed before express.static
    app.use(compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));
    


    // Showing stack errors
    app.set('showStackError', true);

    // Set swig as the template engine
    app.engine('server.view.html', consolidate[config.templateEngine]);

    // Set views path and view engine
    app.set('view engine', 'server.view.html');
    app.set('views', './app/views');

    // Environment dependent middleware
    if (process.env.NODE_ENV === 'development') {
        // Enable logger (morgan)
        app.use(morgan('dev'));

        // Disable views cache
        app.set('view cache', false);
    } else if (process.env.NODE_ENV === 'production') {
        app.locals.cache = 'memory';
    }

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    // CookieParser should be above session
    app.use(cookieParser());

    // Express MongoDB session storage
    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret,
        store: new mongoStore({
            mongooseConnection: db.connection,
            collection: config.sessionCollection
        })
    }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // connect flash for flash messages
    app.use(flash());

    app.use(expressThumbnail.register(__dirname + '/../public', {
        quality: 70,
        cacheDir: __dirname + '/../public/uploads/.thumb'
    }));

    // Use helmet to secure Express headers
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');
    
    // Setting the app router and static folder
    app.use(express.static(path.resolve('./public')));

    app.use(express.static(path.resolve('./sitemap.xml')));

    // Globbing routing files
    config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
        require(path.resolve(routePath))(app);
    });

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function(err, req, res, next) {
        // If the error object doesn't exists
        if (!err) return next();

        // Log it
        console.error(err.stack);

        // Error page
        res.status(500).render('500', {
            error: err.stack
        });
    });
    
    //app.use(require('prerender-node').set('protocol', 'https').set('prerenderToken', 'mdBYxNvCIVsqFRO35Cm7'));


    // Assume 404 since no middleware responded
    //If nothing matches
    //We will send index file to client side
    //So angular will take care of that route
    //If we call url without hash control will go here

    app.get('/*', function(req, res) {
        var games = require('../app/controllers/games.server.controller');
        res.render('index', {
            user: req.user || null,
            request: req,
            games: games.getGamesList()
        });
    });
    

    
    
    var sitemap = require('express-sitemap')({
        http: 'https',
        url: 'plaza.dsolver.ca'
    });
    sitemap.generate(app);
    sitemap.XMLtoFile();

    var server = http.createServer(app);
    configureSocketIO();
    return server;

    // TODO: Separate this into new module
    function configureSocketIO() {
        var store = new mongoStore({
            mongooseConnection: db.connection,
            collection: config.sessionCollection
        });

        var io = socketio.listen(server);

        var messageHistory = [];
        var MESSAGEHISTORYMAXLENGTH = 50;

        function logChatMessage(message){
            messageHistory.push(message);
            if(messageHistory.length > MESSAGEHISTORYMAXLENGTH){
                messageHistory.shift();
            }
        }

        io.use(function(socket, next) {
            // Use the 'cookie-parser' module to parse the request cookies
            cookieParser(config.sessionSecret)(socket.request, {}, function(err) {
                //console.log(socket.request);
                // Get the session id from the request cookies
                var sessionId = socket.request.signedCookies ? socket.request.signedCookies['connect.sid'] : undefined;

                if (!sessionId) {
                    return next(new Error('sessionId was not found in socket.request'), false);
                }
                // Use the mongoStorage instance to get the Express session information
                store.get(sessionId, function(err, session) {
                    if (err) {
                        return next(err, false);
                    }
                    if (!session) {
                        return next(new Error('session was not found for ' + sessionId), false);
                    }

                    // Set the Socket.io session information
                    socket.request.session = session;

                    // Use Passport to populate the user details
                    passport.initialize()(socket.request, {}, function() {
                        passport.session()(socket.request, {}, function() {
                            if (socket.request.user) {
                                next(null, true);
                            } else {
                                next(new Error('User is not authenticated'), false);
                            }
                        });
                    });
                });
            });
        });

        io.on('connection', function(socket) {

            var room = socket.handshake['query']['room'];

            socket.join(room, function(err) {
                var currentUsers = getUsersInRoom();
                io.sockets.in(room).emit('chatMessage', {
                    type: 'status',
                    text: 'joined',
                    username: socket.request.user.username,
                    created: Date.now(),
                    data: currentUsers
                });

                socket.emit('system', {
                    type: 'status',
                    data: currentUsers
                });

                socket.emit('system', {
                    type: 'catchup',
                    data: messageHistory
                });
            });


            // Send a chat messages to all connected sockets when a message is received
            socket.on('chatMessage', function(message) {
                var now = new Date();
                var minTime = (Math.max(socket.strike, 1)) * 2000;
                if (!socket.lastMessage || now - socket.lastMessage > minTime) {
                    message.type = 'message';
                    message.created = Date.now();
                    message.username = socket.request.user.username;
                    // Emit the 'chatMessage' event
                    if (message.room) {
                        io.sockets.in(message.room).emit('chatMessage', message);
                    } else {
                        io.emit('chatMessage', message);
                    }
                    logChatMessage(message);
                    socket.lastMessage = now;
                    socket.strike = 0;
                } else {
                    if (!socket.strike) {
                        socket.strike = 0;
                    }
                    socket.strike++;
                    socket.emit('systemMessage', 'You are sending messages too quickly, give it a moment!')
                }
            });

            // Emit the status event when a socket client is disconnected
            socket.on('disconnect', function() {
                var now = new Date();
                var currentUsers = getUsersInRoom();
                io.sockets.in(room).emit('chatMessage', {
                    type: 'status',
                    text: 'left',
                    username: socket.request.user.username,
                    created: Date.now(),
                    data: currentUsers
                });
            });


            function getUsersInRoom() {
                var users = [];
                for (var i in io.sockets.sockets) {
                    var s = io.sockets.sockets[i];
                    if (s.rooms[room]) {
                        users.push(s.request.user.username);
                    }
                }
                return users;
            }
        })
    }
};
