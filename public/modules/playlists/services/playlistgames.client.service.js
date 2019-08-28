

//Playlists service used to communicate Playlists REST endpoints
window.angular.module('playlists').factory('PlaylistGames', ['$http', 'Authentication', 'Playlists', '$q', '$timeout', 
	function($http, Authentication, Playlists, $q, $timeout) {
	    
	    var myPlaylists = [], initialized = false;
	    
	    if(Authentication.user){
	        initUserPlaylists();
	    } else {
	        initialized = true;
	    }
	    
		return {
		    ready: ready,
		    isInitialized: isInitialized,
		    addGame: addGame,
		    removeGame: removeGame,
		    setPublic: setPublic,
		    checkExistIn: checkExistIn,
		    getMyPlaylists: getMyPlaylists,
		    removeMine: removeMine
		};
		
		function ready(callback){
		    var firstCall = new Date();
		    function check(){
		        if(initialized){
		            callback(myPlaylists);
		        } else {
		            $timeout(function(){
		                var now = new Date();
		                //only try for 10 seconds at most
		                if(now - firstCall < 10000){
		                    check();
		                } else {
		                    callback(myPlaylists);
		                }
        		        
        		    }, 100);
		        }
		    }
		    
		    check();
		}
		
		function isInitialized(){
		    return initialized;
		}
		
		function addGame(playlistId, gameId){
		    return $http.put('/api/playlist/'+playlistId+'/'+gameId);
		}
		
		function removeGame(playlistId, gameId){
		    return $http.delete('/api/playlist/'+playlistId+'/'+gameId);
		}
		
		function setPublic(playlistId){
		    return $http.post('/api/playlists/'+playlistId+'/publish');
		}
		
		function checkExistIn(gameId){
		    //returns the playlists that have this game already
		    return myPlaylists.filter(function(playlist){
		        return playlist.games.some(function(_gameId){
		            return gameId === _gameId;  
		        });
		    });
		}

		function getMyPlaylists(){
		     var deferred = $q.defer();
		    if(Authentication.user){
		    	ready(function(playlist){
		    		deferred.resolve(playlist);
		    	});
		    } else {
		    	deferred.reject();
		    }
		    return deferred.promise;

		}
		
		function initUserPlaylists(){
		    var deferred = $q.defer();
		    if(Authentication.user){
		        $http.get('/api/playlists/mine').then(function(response){
		            myPlaylists = response.data;
		            initialized = true;
		            deferred.resolve(myPlaylists);
		        }, function(error){
		        	initialized = true;
		            deferred.reject(error);
		        });
		    } else {
		        deferred.reject({status: 403, errorMessage: 'Not logged in'});
		        initialized = true;
		    }
		    
		    return deferred.promise;
		    
		}

		function removeMine(playlist){
			return $http.delete('/api/playlists/'+playlist._id).then(function(response){
				console.log(response);
				myPlaylists.splice(myPlaylists.indexOf(playlist), 1);
				return response;
			}, function(error){
				console.log(error);
				return error;
			});
		}
		
	}
]);