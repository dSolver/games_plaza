

//Fileuploads service used to communicate Fileuploads REST endpoints
window.angular.module('fileuploads').factory('Fileuploads', ['$resource',
	function($resource) {
		return $resource('api/fileuploads/:fileuploadId', { fileuploadId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);