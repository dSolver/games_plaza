

(function() {
	// Comments Controller Spec
	describe('Comments Controller Tests', function() {
		// Initialize global variables
		var CommentsController,
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

			// Initialize the Comments controller.
			CommentsController = $controller('CommentsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Comment object fetched from XHR', inject(function(Comments) {
			// Create sample Comment using the Comments service
			var sampleComment = new Comments({
				name: 'New Comment'
			});

			// Create a sample Comments array that includes the new Comment
			var sampleComments = [sampleComment];

			// Set GET response
			$httpBackend.expectGET('comments').respond(sampleComments);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.comments).toEqualData(sampleComments);
		}));

		it('$scope.findOne() should create an array with one Comment object fetched from XHR using a commentId URL parameter', inject(function(Comments) {
			// Define a sample Comment object
			var sampleComment = new Comments({
				name: 'New Comment'
			});

			// Set the URL parameter
			$stateParams.commentId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/comments\/([0-9a-fA-F]{24})$/).respond(sampleComment);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.comment).toEqualData(sampleComment);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Comments) {
			// Create a sample Comment object
			var sampleCommentPostData = new Comments({
				name: 'New Comment'
			});

			// Create a sample Comment response
			var sampleCommentResponse = new Comments({
				_id: '525cf20451979dea2c000001',
				name: 'New Comment'
			});

			// Fixture mock form input values
			scope.name = 'New Comment';

			// Set POST response
			$httpBackend.expectPOST('comments', sampleCommentPostData).respond(sampleCommentResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Comment was created
			expect($location.path()).toBe('/comments/' + sampleCommentResponse._id);
		}));

		it('$scope.update() should update a valid Comment', inject(function(Comments) {
			// Define a sample Comment put data
			var sampleCommentPutData = new Comments({
				_id: '525cf20451979dea2c000001',
				name: 'New Comment'
			});

			// Mock Comment in scope
			scope.comment = sampleCommentPutData;

			// Set PUT response
			$httpBackend.expectPUT(/comments\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/comments/' + sampleCommentPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid commentId and remove the Comment from the scope', inject(function(Comments) {
			// Create new Comment object
			var sampleComment = new Comments({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Comments array and include the Comment
			scope.comments = [sampleComment];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/comments\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleComment);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.comments.length).toBe(0);
		}));
	});
}());