

(function() {
	// Discussions Controller Spec
	describe('Discussions Controller Tests', function() {
		// Initialize global variables
		var DiscussionsController,
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

			// Initialize the Discussions controller.
			DiscussionsController = $controller('DiscussionsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Discussion object fetched from XHR', inject(function(Discussions) {
			// Create sample Discussion using the Discussions service
			var sampleDiscussion = new Discussions({
				name: 'New Discussion'
			});

			// Create a sample Discussions array that includes the new Discussion
			var sampleDiscussions = [sampleDiscussion];

			// Set GET response
			$httpBackend.expectGET('discussions').respond(sampleDiscussions);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.discussions).toEqualData(sampleDiscussions);
		}));

		it('$scope.findOne() should create an array with one Discussion object fetched from XHR using a discussionId URL parameter', inject(function(Discussions) {
			// Define a sample Discussion object
			var sampleDiscussion = new Discussions({
				name: 'New Discussion'
			});

			// Set the URL parameter
			$stateParams.discussionId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/discussions\/([0-9a-fA-F]{24})$/).respond(sampleDiscussion);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.discussion).toEqualData(sampleDiscussion);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Discussions) {
			// Create a sample Discussion object
			var sampleDiscussionPostData = new Discussions({
				name: 'New Discussion'
			});

			// Create a sample Discussion response
			var sampleDiscussionResponse = new Discussions({
				_id: '525cf20451979dea2c000001',
				name: 'New Discussion'
			});

			// Fixture mock form input values
			scope.name = 'New Discussion';

			// Set POST response
			$httpBackend.expectPOST('discussions', sampleDiscussionPostData).respond(sampleDiscussionResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Discussion was created
			expect($location.path()).toBe('/discussions/' + sampleDiscussionResponse._id);
		}));

		it('$scope.update() should update a valid Discussion', inject(function(Discussions) {
			// Define a sample Discussion put data
			var sampleDiscussionPutData = new Discussions({
				_id: '525cf20451979dea2c000001',
				name: 'New Discussion'
			});

			// Mock Discussion in scope
			scope.discussion = sampleDiscussionPutData;

			// Set PUT response
			$httpBackend.expectPUT(/discussions\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/discussions/' + sampleDiscussionPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid discussionId and remove the Discussion from the scope', inject(function(Discussions) {
			// Create new Discussion object
			var sampleDiscussion = new Discussions({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Discussions array and include the Discussion
			scope.discussions = [sampleDiscussion];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/discussions\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleDiscussion);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.discussions.length).toBe(0);
		}));
	});
}());