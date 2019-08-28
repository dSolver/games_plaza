'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Idea = mongoose.model('Idea'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, idea;

/**
 * Idea routes tests
 */
describe('Idea CRUD tests', function() {
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

		// Save a user to the test db and create new Idea
		user.save(function() {
			idea = {
				name: 'Idea Name'
			};

			done();
		});
	});

	it('should be able to save Idea instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Idea
				agent.post('/ideas')
					.send(idea)
					.expect(200)
					.end(function(ideaSaveErr, ideaSaveRes) {
						// Handle Idea save error
						if (ideaSaveErr) done(ideaSaveErr);

						// Get a list of Ideas
						agent.get('/ideas')
							.end(function(ideasGetErr, ideasGetRes) {
								// Handle Idea save error
								if (ideasGetErr) done(ideasGetErr);

								// Get Ideas list
								var ideas = ideasGetRes.body;

								// Set assertions
								(ideas[0].user._id).should.equal(userId);
								(ideas[0].name).should.match('Idea Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Idea instance if not logged in', function(done) {
		agent.post('/ideas')
			.send(idea)
			.expect(401)
			.end(function(ideaSaveErr, ideaSaveRes) {
				// Call the assertion callback
				done(ideaSaveErr);
			});
	});

	it('should not be able to save Idea instance if no name is provided', function(done) {
		// Invalidate name field
		idea.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Idea
				agent.post('/ideas')
					.send(idea)
					.expect(400)
					.end(function(ideaSaveErr, ideaSaveRes) {
						// Set message assertion
						(ideaSaveRes.body.message).should.match('Please fill Idea name');
						
						// Handle Idea save error
						done(ideaSaveErr);
					});
			});
	});

	it('should be able to update Idea instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Idea
				agent.post('/ideas')
					.send(idea)
					.expect(200)
					.end(function(ideaSaveErr, ideaSaveRes) {
						// Handle Idea save error
						if (ideaSaveErr) done(ideaSaveErr);

						// Update Idea name
						idea.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Idea
						agent.put('/ideas/' + ideaSaveRes.body._id)
							.send(idea)
							.expect(200)
							.end(function(ideaUpdateErr, ideaUpdateRes) {
								// Handle Idea update error
								if (ideaUpdateErr) done(ideaUpdateErr);

								// Set assertions
								(ideaUpdateRes.body._id).should.equal(ideaSaveRes.body._id);
								(ideaUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Ideas if not signed in', function(done) {
		// Create new Idea model instance
		var ideaObj = new Idea(idea);

		// Save the Idea
		ideaObj.save(function() {
			// Request Ideas
			request(app).get('/ideas')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Idea if not signed in', function(done) {
		// Create new Idea model instance
		var ideaObj = new Idea(idea);

		// Save the Idea
		ideaObj.save(function() {
			request(app).get('/ideas/' + ideaObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', idea.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Idea instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Idea
				agent.post('/ideas')
					.send(idea)
					.expect(200)
					.end(function(ideaSaveErr, ideaSaveRes) {
						// Handle Idea save error
						if (ideaSaveErr) done(ideaSaveErr);

						// Delete existing Idea
						agent.delete('/ideas/' + ideaSaveRes.body._id)
							.send(idea)
							.expect(200)
							.end(function(ideaDeleteErr, ideaDeleteRes) {
								// Handle Idea error error
								if (ideaDeleteErr) done(ideaDeleteErr);

								// Set assertions
								(ideaDeleteRes.body._id).should.equal(ideaSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Idea instance if not signed in', function(done) {
		// Set Idea user 
		idea.user = user;

		// Create new Idea model instance
		var ideaObj = new Idea(idea);

		// Save the Idea
		ideaObj.save(function() {
			// Try deleting Idea
			request(app).delete('/ideas/' + ideaObj._id)
			.expect(401)
			.end(function(ideaDeleteErr, ideaDeleteRes) {
				// Set message assertion
				(ideaDeleteRes.body.message).should.match('User is not logged in');

				// Handle Idea error error
				done(ideaDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Idea.remove().exec();
		done();
	});
});