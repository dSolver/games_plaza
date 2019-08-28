

//Setting up route
window.angular.module('comments').config(['$stateProvider',
	function($stateProvider) {
		// Comments state routing
		$stateProvider.
		state('listComments', {
			url: '/comments',
			templateUrl: 'modules/comments/views/list-comments.client.view.html'
		}).
		state('createComment', {
			url: '/comments/create',
			templateUrl: 'modules/comments/views/create-comment.client.view.html'
		}).
		state('viewComment', {
			url: '/comments/:commentId',
			templateUrl: 'modules/comments/views/view-comment.client.view.html'
		}).
		state('editComment', {
			url: '/comments/:commentId/edit',
			templateUrl: 'modules/comments/views/edit-comment.client.view.html'
		});
	}
]);