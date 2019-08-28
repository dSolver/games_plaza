
window.angular.module('games')
    .component('lounge', {
        templateUrl: 'modules/games/views/playground.client.view.html',
        controller: loungeController
    });


function loungeController($rootScope, $sce, Authentication, CoreService, PlaygroundService, GamesService) {
	var cp = this;
    cp.messages = [];
    cp.messageText = '';
    cp.sendMessage = sendMessage;
    cp.openedGames = [];
    cp.urlSrc = {};
    cp.show = false;

    //expose function to add game in rootscope
    $rootScope.openGameInLounge = function(gameId){
    	var game =getGame(gameId);
    	if(game){
    		cp.addTab(game);
    	}
    };
    
    cp.$onInit = function(){
        init();
    };
    

    function init() {
        if (!Authentication.user) {
            cp.canChat = false;
        } else {
            cp.canChat = true;
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
                                cp.chatMgr.online = PlaygroundService.chatMgr.setOnline(message.data);
                            } else if (message.text === 'left') {
                                cp.chatMgr.online = PlaygroundService.chatMgr.setOnline(message.data);
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
                        cp.chatMgr.online = PlaygroundService.chatMgr.setOnline(message.data);

                        break;
                    case 'catchup':
                        PlaygroundService.chatMgr.addMessages(message.data);
                        break;
                }
            });

            cp.chatMgr = {
                online: PlaygroundService.chatMgr.online,
                messages: PlaygroundService.chatMgr.messages,
                usersDisplayed: false,
                toggleUsersDisplay: function() {
                    cp.chatMgr.usersDisplayed = !cp.chatMgr.usersDisplayed;
                }
            };

            cp.hideChat = hideChat;
            cp.showChat = showChat;



            showChat();
        }

        CoreService.isReady('gamelist').then(function(){
        	cp.playableGames = GamesService.sort(CoreService.getGames().filter(function(g){
	        	return g.playable;
	        }), cp.sortBy);

	        //check localStorage for any opened games
		    var lastOpened = localStorage.getItem('lastOpened');
		    if(lastOpened){
		    	lastOpened.split(',').forEach(function(gameId){
		    		var game = cp.playableGames.find(function(g){
		    			return g._id === gameId;
		    		});

		    		if(game){
		    			cp.addTab(game);
		    		}
		    	});
		    }
	    });

    }

    function getGame(gameId){
    	return cp.playableGames.find(function(g){
    		return g._id === gameId;
    	});
    }

    

    cp.sortOpts = GamesService.sortBys;

    cp.sortBy = 'Highest Rating';

    cp.onSortChange = function(){
    	cp.playableGames = GamesService.sort(cp.playableGames, cp.sortBy);
    };

    function isBlocked(username) {
        return false;
    }

    function sortGames(field) {
        cp.playableGames.sort(function(a, b) {
            switch (field) {
                case 'slug':
                    return a.slug > b.slug;
                case 'created':
                    return (new Date(b.created)) - (new Date(a.created));
                case 'score':
                    return b.score - a.score;
            }
        });
    }

    // Create a controller method for sending messages
    function sendMessage() {
        // Create a new message object
        var message = {
            text: cp.messageText
        };

        // Emit a 'chatMessage' message event
        PlaygroundService.emit('chatMessage', message);

        // Clear the message text
        cp.messageText = '';
    }

    function hideChat() {
        cp.chatHidden = true;
        console.log(cp.chatMgr);
    }

    function showChat() {
        cp.chatHidden = false;
    }


    cp.addTab = function(game) {
        if (!cp.openedGames.some(function(t) {
                return t === game
            })) {
            game.src = $sce.trustAsResourceUrl(game.link.replace('http://', '//'));
            cp.openedGames.push(game);
            localStorage.setItem('lastOpened', cp.openedGames.join(','));
        }
    };

    cp.closeTab = function(game) {
        var ind = cp.openedGames.findIndex(function(g){
        	return g._id === game._id
        });
        cp.openedGames.splice(ind, 1);
        localStorage.setItem('lastOpened', cp.openedGames.join(','));
    };
}
