

//Playlists service used to communicate Playlists REST endpoints
window.angular.module('playlists').factory('Playlists', ['$resource',
	function($resource) {
		return $resource('api/playlists/:playlistId', { playlistId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
			vote: {
				method: 'PUT',
				url: 'api/playlists/:playlistId/vote'
			}
		});
	}
]);