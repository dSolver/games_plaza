'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Creator = mongoose.model('Creator'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, creator;

/**
 * Creator routes tests
 */
describe('Creator CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Creator
		user.save(function() {
			creator = {
				name: 'Creator Name'
			};

			done();
		});
	});

	it('should be able to save Creator instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Creator
				agent.post('/creators')
					.send(creator)
					.expect(200)
					.end(function(creatorSaveErr, creatorSaveRes) {
						// Handle Creator save error
						if (creatorSaveErr) done(creatorSaveErr);

						// Get a list of Creators
						agent.get('/creators')
							.end(function(creatorsGetErr, creatorsGetRes) {
								// Handle Creator save error
								if (creatorsGetErr) done(creatorsGetErr);

								// Get Creators list
								var creators = creatorsGetRes.body;

								// Set assertions
								(creators[0].user._id).should.equal(userId);
								(creators[0].name).should.match('Creator Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Creator instance if not logged in', function(done) {
		agent.post('/creators')
			.send(creator)
			.expect(401)
			.end(function(creatorSaveErr, creatorSaveRes) {
				// Call the assertion callback
				done(creatorSaveErr);
			});
	});

	it('should not be able to save Creator instance if no name is provided', function(done) {
		// Invalidate name field
		creator.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Creator
				agent.post('/creators')
					.send(creator)
					.expect(400)
					.end(function(creatorSaveErr, creatorSaveRes) {
						// Set message assertion
						(creatorSaveRes.body.message).should.match('Please fill Creator name');
						
						// Handle Creator save error
						done(creatorSaveErr);
					});
			});
	});

	it('should be able to update Creator instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Creator
				agent.post('/creators')
					.send(creator)
					.expect(200)
					.end(function(creatorSaveErr, creatorSaveRes) {
						// Handle Creator save error
						if (creatorSaveErr) done(creatorSaveErr);

						// Update Creator name
						creator.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Creator
						agent.put('/creators/' + creatorSaveRes.body._id)
							.send(creator)
							.expect(200)
							.end(function(creatorUpdateErr, creatorUpdateRes) {
								// Handle Creator update error
								if (creatorUpdateErr) done(creatorUpdateErr);

								// Set assertions
								(creatorUpdateRes.body._id).should.equal(creatorSaveRes.body._id);
								(creatorUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Creators if not signed in', function(done) {
		// Create new Creator model instance
		var creatorObj = new Creator(creator);

		// Save the Creator
		creatorObj.save(function() {
			// Request Creators
			request(app).get('/creators')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Creator if not signed in', function(done) {
		// Create new Creator model instance
		var creatorObj = new Creator(creator);

		// Save the Creator
		creatorObj.save(function() {
			request(app).get('/creators/' + creatorObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', creator.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Creator instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Creator
				agent.post('/creators')
					.send(creator)
					.expect(200)
					.end(function(creatorSaveErr, creatorSaveRes) {
						// Handle Creator save error
						if (creatorSaveErr) done(creatorSaveErr);

						// Delete existing Creator
						agent.delete('/creators/' + creatorSaveRes.body._id)
							.send(creator)
							.expect(200)
							.end(function(creatorDeleteErr, creatorDeleteRes) {
								// Handle Creator error error
								if (creatorDeleteErr) done(creatorDeleteErr);

								// Set assertions
								(creatorDeleteRes.body._id).should.equal(creatorSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Creator instance if not signed in', function(done) {
		// Set Creator user 
		creator.user = user;

		// Create new Creator model instance
		var creatorObj = new Creator(creator);

		// Save the Creator
		creatorObj.save(function() {
			// Try deleting Creator
			request(app).delete('/creators/' + creatorObj._id)
			.expect(401)
			.end(function(creatorDeleteErr, creatorDeleteRes) {
				// Set message assertion
				(creatorDeleteRes.body.message).should.match('User is not logged in');

				// Handle Creator error error
				done(creatorDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Creator.remove().exec();
		done();
	});
});