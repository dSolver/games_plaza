

//Setting up route
window.angular.module('fileuploads').config(['$stateProvider',
	function($stateProvider) {
		// Fileuploads state routing
		$stateProvider.
		state('listFileuploads', {
			url: '/fileuploads',
			templateUrl: 'modules/fileuploads/views/list-fileuploads.client.view.html'
		}).
		state('createFileupload', {
			url: '/fileuploads/create',
			templateUrl: 'modules/fileuploads/views/create-fileupload.client.view.html'
		}).
		state('viewFileupload', {
			url: '/fileuploads/:fileuploadId',
			templateUrl: 'modules/fileuploads/views/view-fileupload.client.view.html'
		}).
		state('editFileupload', {
			url: '/fileuploads/:fileuploadId/edit',
			templateUrl: 'modules/fileuploads/views/edit-fileupload.client.view.html'
		});
	}
]);