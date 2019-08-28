

// Fileuploads controller
window.angular.module('fileuploads').controller('FileuploadsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Fileuploads',
	function($scope, $stateParams, $location, Authentication, Fileuploads) {
		$scope.authentication = Authentication;

		// Create new Fileupload
		$scope.create = function() {
			// Create new Fileupload object
			var fileupload = new Fileuploads ({
				name: this.name
			});

			// Redirect after save
			fileupload.$save(function(response) {
				$location.path('fileuploads/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Fileupload
		$scope.remove = function(fileupload) {
			if ( fileupload ) { 
				fileupload.$remove();

				for (var i in $scope.fileuploads) {
					if ($scope.fileuploads [i] === fileupload) {
						$scope.fileuploads.splice(i, 1);
					}
				}
			} else {
				$scope.fileupload.$remove(function() {
					$location.path('fileuploads');
				});
			}
		};

		// Update existing Fileupload
		$scope.update = function() {
			var fileupload = $scope.fileupload;

			fileupload.$update(function() {
				$location.path('fileuploads/' + fileupload._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Fileuploads
		$scope.find = function() {
			$scope.fileuploads = Fileuploads.query();
		};

		// Find existing Fileupload
		$scope.findOne = function() {
			$scope.fileupload = Fileuploads.get({ 
				fileuploadId: $stateParams.fileuploadId
			});
		};
	}
]);