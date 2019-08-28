

//Setting up route
window.angular.module('playlists').config(['$stateProvider',
	function($stateProvider) {
		// playlists state routing
		$stateProvider.
		state('listPlaylists', {
			url: '/playlists',
			templateUrl: 'modules/playlists/views/list-playlists.client.view.html'
		}).
		state('createPlaylist', {
			url: '/playlists/create',
			templateUrl: 'modules/playlists/views/create-playlist.client.view.html'
		}).
		state('viewPlaylist', {
			url: '/playlists/:playlistId',
			templateUrl: 'modules/playlists/views/view-playlist.client.view.html'
		}).
		state('editPlaylist', {
			url: '/playlists/:playlistId/edit',
			templateUrl: 'modules/playlists/views/edit-playlist.client.view.html'
		});
	}
]);