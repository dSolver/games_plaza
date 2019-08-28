window.angular.module('games')
    .service('PlaygroundService', ['Authentication', '$timeout',
        function(Authentication, $timeout) {
            var sv = this;
            var ChatMgr = function() {
                this.online = [];
                this.onlineHash = {};
                this.messages = [];
                this.maxMessages = 70;
            }

            ChatMgr.prototype.addMessages = function(messages) {
                var self = this;
                messages.forEach(function(m){
                    if(!self.messages.some(function(_m){
                        return _m.created === m.created
                    })){
                        self.messages.push(m);
                        if(self.messages.length > self.maxMessages){
                            self.messages.shift();
                        }
                    }
                });
            };

            ChatMgr.prototype.setOnline = function(users) {
                var self = this;
                self.onlineHash= {}; 
                users.forEach(function(username) {
                    self.onlineHash[username] = true;
                });

                self.online = Object.keys(self.onlineHash);
                return self.online;
            };

            function connect() {
                // Connect only when authenticated
                if (Authentication.user) {
                    service.socket = io('/', {
                        query: 'room=lobby'
                    });
                }
            }

            // Wrap the Socket.io 'emit' method
            function emit(eventName, data) {
                if (service.socket) {
                    service.socket.emit(eventName, data);
                }
            }

            // Wrap the Socket.io 'on' method
            function on(eventName, callback) {
                if (service.socket) {
                    service.socket.on(eventName, function(data) {
                        $timeout(function() {
                            callback(data);
                        });
                    });
                }
            }

            // Wrap the Socket.io 'removeListener' method
            function removeListener(eventName) {
                if (service.socket) {
                    service.socket.removeListener(eventName);
                }
            }

            var service = {
                connect: connect,
                emit: emit,
                on: on,
                removeListener: removeListener,
                socket: null,
                chatMgr: new ChatMgr()
            };

            connect();

            return service;

        }

    ]);
