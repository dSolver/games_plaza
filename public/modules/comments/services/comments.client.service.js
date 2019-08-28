

//Comments service used to communicate Comments REST endpoints
window.angular.module('comments').factory('Comments', ['$resource',
	function($resource) {
		return $resource('comments/:commentId', { commentId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);