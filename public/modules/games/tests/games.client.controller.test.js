

(function() {
	// Games Controller Spec
	describe('Games Controller Tests', function() {
		// Initialize global variables
		var GamesController,
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

			// Initialize the Games controller.
			GamesController = $controller('GamesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Game object fetched from XHR', inject(function(Games) {
			// Create sample Game using the Games service
			var sampleGame = new Games({
				name: 'New Game'
			});

			// Create a sample Games array that includes the new Game
			var sampleGames = [sampleGame];

			// Set GET response
			$httpBackend.expectGET('games').respond(sampleGames);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.games).toEqualData(sampleGames);
		}));

		it('$scope.findOne() should create an array with one Game object fetched from XHR using a gameId URL parameter', inject(function(Games) {
			// Define a sample Game object
			var sampleGame = new Games({
				name: 'New Game'
			});

			// Set the URL parameter
			$stateParams.gameId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/games\/([0-9a-fA-F]{24})$/).respond(sampleGame);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.game).toEqualData(sampleGame);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Games) {
			// Create a sample Game object
			var sampleGamePostData = new Games({
				name: 'New Game'
			});

			// Create a sample Game response
			var sampleGameResponse = new Games({
				_id: '525cf20451979dea2c000001',
				name: 'New Game'
			});

			// Fixture mock form input values
			scope.name = 'New Game';

			// Set POST response
			$httpBackend.expectPOST('games', sampleGamePostData).respond(sampleGameResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Game was created
			expect($location.path()).toBe('/games/' + sampleGameResponse._id);
		}));

		it('$scope.update() should update a valid Game', inject(function(Games) {
			// Define a sample Game put data
			var sampleGamePutData = new Games({
				_id: '525cf20451979dea2c000001',
				name: 'New Game'
			});

			// Mock Game in scope
			scope.game = sampleGamePutData;

			// Set PUT response
			$httpBackend.expectPUT(/games\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/games/' + sampleGamePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid gameId and remove the Game from the scope', inject(function(Games) {
			// Create new Game object
			var sampleGame = new Games({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Games array and include the Game
			scope.games = [sampleGame];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/games\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleGame);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.games.length).toBe(0);
		}));
	});
}());