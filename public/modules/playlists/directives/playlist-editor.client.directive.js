window.angular.module('playlists').directive('playlist-editor', ['$rootScope', 'PlaylistGames', 'Playlists', '$q', '$mdDialog',
	function($rootScope, PlaylistGames, Playlists, $q, $mdDialog){
		return {
			templateUrl: 'modules/playlists/views/playlist-editor.view.html',
			restrict: 'E',
			scope: {
				playlistid: '@'
			},
			link: function postlink(scope, element){
				
			}
		}
	}]);