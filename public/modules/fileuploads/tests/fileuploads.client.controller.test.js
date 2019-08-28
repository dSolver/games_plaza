

(function() {
	// Fileuploads Controller Spec
	describe('Fileuploads Controller Tests', function() {
		// Initialize global variables
		var FileuploadsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Fileuploads controller.
			FileuploadsController = $controller('FileuploadsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Fileupload object fetched from XHR', inject(function(Fileuploads) {
			// Create sample Fileupload using the Fileuploads service
			var sampleFileupload = new Fileuploads({
				name: 'New Fileupload'
			});

			// Create a sample Fileuploads array that includes the new Fileupload
			var sampleFileuploads = [sampleFileupload];

			// Set GET response
			$httpBackend.expectGET('fileuploads').respond(sampleFileuploads);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.fileuploads).toEqualData(sampleFileuploads);
		}));

		it('$scope.findOne() should create an array with one Fileupload object fetched from XHR using a fileuploadId URL parameter', inject(function(Fileuploads) {
			// Define a sample Fileupload object
			var sampleFileupload = new Fileuploads({
				name: 'New Fileupload'
			});

			// Set the URL parameter
			$stateParams.fileuploadId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/fileuploads\/([0-9a-fA-F]{24})$/).respond(sampleFileupload);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.fileupload).toEqualData(sampleFileupload);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Fileuploads) {
			// Create a sample Fileupload object
			var sampleFileuploadPostData = new Fileuploads({
				name: 'New Fileupload'
			});

			// Create a sample Fileupload response
			var sampleFileuploadResponse = new Fileuploads({
				_id: '525cf20451979dea2c000001',
				name: 'New Fileupload'
			});

			// Fixture mock form input values
			scope.name = 'New Fileupload';

			// Set POST response
			$httpBackend.expectPOST('fileuploads', sampleFileuploadPostData).respond(sampleFileuploadResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Fileupload was created
			expect($location.path()).toBe('/fileuploads/' + sampleFileuploadResponse._id);
		}));

		it('$scope.update() should update a valid Fileupload', inject(function(Fileuploads) {
			// Define a sample Fileupload put data
			var sampleFileuploadPutData = new Fileuploads({
				_id: '525cf20451979dea2c000001',
				name: 'New Fileupload'
			});

			// Mock Fileupload in scope
			scope.fileupload = sampleFileuploadPutData;

			// Set PUT response
			$httpBackend.expectPUT(/fileuploads\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/fileuploads/' + sampleFileuploadPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid fileuploadId and remove the Fileupload from the scope', inject(function(Fileuploads) {
			// Create new Fileupload object
			var sampleFileupload = new Fileuploads({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Fileuploads array and include the Fileupload
			scope.fileuploads = [sampleFileupload];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/fileuploads\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleFileupload);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.fileuploads.length).toBe(0);
		}));
	});
}());