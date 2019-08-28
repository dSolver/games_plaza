

//Setting up route
window.angular.module('reviews').config(['$stateProvider',
	function($stateProvider) {
		// Reviews state routing
		$stateProvider.
		state('listReviews', {
			url: '/reviews',
			templateUrl: 'modules/reviews/views/list-reviews.client.view.html'
		}).
		state('createReview', {
			url: '/reviews/create',
			templateUrl: 'modules/reviews/views/create-review.client.view.html'
		}).
		state('viewReview', {
			url: '/reviews/:reviewId',
			templateUrl: 'modules/reviews/views/view-review.client.view.html'
		}).
		state('editReview', {
			url: '/reviews/:reviewId/edit',
			templateUrl: 'modules/reviews/views/edit-review.client.view.html'
		});
	}
]);