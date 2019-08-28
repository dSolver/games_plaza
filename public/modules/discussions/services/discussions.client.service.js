

//Discussions service used to communicate Discussions REST endpoints
window.angular.module('discussions').factory('Discussions', ['$resource',
	function($resource) {
		return $resource('api/discussions/:discussionId', { discussionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);