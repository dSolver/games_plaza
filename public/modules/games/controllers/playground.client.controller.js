

// Games controller
window.angular.module('games').controller('PlaygroundController', ['$rootScope', '$scope', '$sce', 'Page', '$stateParams', 'Authentication', 'PlaygroundService', 'Games',
    function($rootScope, $scope, $sce, Page, $stateParams, Authentication, PlaygroundService, Games) {


        $scope.messages = [];
        $scope.messageText = '';
        $scope.sendMessage = sendMessage;
        $scope.openedGames =  [];
        init();
        $scope.urlSrc = {};

        function init() {
            Page.title = 'Plaza - Lounge';
            if (!Authentication.user) {
                //$state.go('home');
                $scope.canChat = false;
            } else {
                $scope.canChat = true;
                if (!PlaygroundService.socket) {
                    PlaygroundService.connect();
                }

                // Add an event listener to the 'chatMessage' event
                PlaygroundService.on('chatMessage', function(message) {
                    if (message.username && message.username === Authentication.user.username) {
                        message.self = true;
                    }
                    var ignore = true;
                    if (!isBlocked(message.username)) {
                        switch (message.type) {
                            case 'status':
                                if (message.text === 'joined') {
                                    $scope.chatMgr.online = PlaygroundService.chatMgr.setOnline(message.data);
                                } else if (message.text === 'left') {
                                    $scope.chatMgr.online = PlaygroundService.chatMgr.setOnline(message.data);
                                }
                                break;
                            default:
                                ignore = false;
                                break;
                        }
                    }

                    if (!ignore) {
                        PlaygroundService.chatMgr.addMessages([message]);
                    }

                });

                PlaygroundService.on('system', function(message) {
                    switch (message.type) {
                        case 'status':
                            $scope.chatMgr.online = PlaygroundService.chatMgr.setOnline(message.data);

                            break;
                        case 'catchup':
                            PlaygroundService.chatMgr.addMessages(message.data);
                            break;
                    }
                });

                // Remove the event listener when the controller instance is destroyed
                $scope.$on('$destroy', function() {
                    PlaygroundService.removeListener('chatMessage');
                });

                $scope.playableGames = Games.query({ playable: true }, function() {
                    $scope.sortMgr.selected = $scope.sortMgr.options[1];

                    if($stateParams.games){
                        $stateParams.games.forEach(function(gameId){
                            var game = $scope.playableGames.find(function(g){
                                return g._id == gameId;
                            })
                            $scope.addTab(game);
                        });
                    }
                });


                $scope.chatMgr = {
                    online: PlaygroundService.chatMgr.online,
                    messages: PlaygroundService.chatMgr.messages,
                    usersDisplayed: false,
                    toggleUsersDisplay: function() {
                        $scope.chatMgr.usersDisplayed = !$scope.chatMgr.usersDisplayed;
                    }
                };

                $scope.hideChat = hideChat;
                $scope.showChat = showChat;



                showChat();
            }
        }

        $scope.sortMgr = {
            options: [
                { name: 'Alphabetical', field: 'slug' },
                { name: 'Best', field: 'score' },
                { name: 'Newest', field: 'created' }
            ],
            selected: null
        };


        $scope.$watch('sortMgr.selected', function(newVal) {
            if (newVal) {
                sortGames(newVal.field);
            }
        });

        function isBlocked(username) {
            return false;
        }

        function sortGames(field) {
            $scope.playableGames.sort(function(a, b) {
                switch (field) {
                    case 'slug':
                        return a.slug > b.slug;
                        break;
                    case 'created':
                        return (new Date(b.created)) - (new Date(a.created));
                        break;
                    case 'score':
                        return b.score - a.score;
                        break;
                }
            });
        }

        // Create a controller method for sending messages
        function sendMessage() {
            // Create a new message object
            var message = {
                text: $scope.messageText
            };

            // Emit a 'chatMessage' message event
            PlaygroundService.emit('chatMessage', message);

            // Clear the message text
            $scope.messageText = '';
        }

        function hideChat() {
            $scope.chatHidden = true;
            console.log($scope.chatMgr);
        }

        function showChat() {
            $scope.chatHidden = false;
        }


        $scope.addTab = function(game) {
            console.log('adding game', game);
            if (!$scope.openedGames.some(function(t) {
                    return t === game
                })) {
                game.src = $sce.trustAsResourceUrl(game.link);
                $scope.openedGames.push(game);

            }
        };

        $scope.closeTab = function(game) {
            var ind = $scope.openedGames.indexOf(game);
            $scope.openedGames.splice(ind, 1);
        };
    }
]);
