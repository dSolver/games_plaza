'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Discussion = mongoose.model('Discussion'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, discussion;

/**
 * Discussion routes tests
 */
describe('Discussion CRUD tests', function() {
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

		// Save a user to the test db and create new Discussion
		user.save(function() {
			discussion = {
				name: 'Discussion Name'
			};

			done();
		});
	});

	it('should be able to save Discussion instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Discussion
				agent.post('/discussions')
					.send(discussion)
					.expect(200)
					.end(function(discussionSaveErr, discussionSaveRes) {
						// Handle Discussion save error
						if (discussionSaveErr) done(discussionSaveErr);

						// Get a list of Discussions
						agent.get('/discussions')
							.end(function(discussionsGetErr, discussionsGetRes) {
								// Handle Discussion save error
								if (discussionsGetErr) done(discussionsGetErr);

								// Get Discussions list
								var discussions = discussionsGetRes.body;

								// Set assertions
								(discussions[0].user._id).should.equal(userId);
								(discussions[0].name).should.match('Discussion Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Discussion instance if not logged in', function(done) {
		agent.post('/discussions')
			.send(discussion)
			.expect(401)
			.end(function(discussionSaveErr, discussionSaveRes) {
				// Call the assertion callback
				done(discussionSaveErr);
			});
	});

	it('should not be able to save Discussion instance if no name is provided', function(done) {
		// Invalidate name field
		discussion.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Discussion
				agent.post('/discussions')
					.send(discussion)
					.expect(400)
					.end(function(discussionSaveErr, discussionSaveRes) {
						// Set message assertion
						(discussionSaveRes.body.message).should.match('Please fill Discussion name');
						
						// Handle Discussion save error
						done(discussionSaveErr);
					});
			});
	});

	it('should be able to update Discussion instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Discussion
				agent.post('/discussions')
					.send(discussion)
					.expect(200)
					.end(function(discussionSaveErr, discussionSaveRes) {
						// Handle Discussion save error
						if (discussionSaveErr) done(discussionSaveErr);

						// Update Discussion name
						discussion.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Discussion
						agent.put('/discussions/' + discussionSaveRes.body._id)
							.send(discussion)
							.expect(200)
							.end(function(discussionUpdateErr, discussionUpdateRes) {
								// Handle Discussion update error
								if (discussionUpdateErr) done(discussionUpdateErr);

								// Set assertions
								(discussionUpdateRes.body._id).should.equal(discussionSaveRes.body._id);
								(discussionUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Discussions if not signed in', function(done) {
		// Create new Discussion model instance
		var discussionObj = new Discussion(discussion);

		// Save the Discussion
		discussionObj.save(function() {
			// Request Discussions
			request(app).get('/discussions')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Discussion if not signed in', function(done) {
		// Create new Discussion model instance
		var discussionObj = new Discussion(discussion);

		// Save the Discussion
		discussionObj.save(function() {
			request(app).get('/discussions/' + discussionObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', discussion.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Discussion instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Discussion
				agent.post('/discussions')
					.send(discussion)
					.expect(200)
					.end(function(discussionSaveErr, discussionSaveRes) {
						// Handle Discussion save error
						if (discussionSaveErr) done(discussionSaveErr);

						// Delete existing Discussion
						agent.delete('/discussions/' + discussionSaveRes.body._id)
							.send(discussion)
							.expect(200)
							.end(function(discussionDeleteErr, discussionDeleteRes) {
								// Handle Discussion error error
								if (discussionDeleteErr) done(discussionDeleteErr);

								// Set assertions
								(discussionDeleteRes.body._id).should.equal(discussionSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Discussion instance if not signed in', function(done) {
		// Set Discussion user 
		discussion.user = user;

		// Create new Discussion model instance
		var discussionObj = new Discussion(discussion);

		// Save the Discussion
		discussionObj.save(function() {
			// Try deleting Discussion
			request(app).delete('/discussions/' + discussionObj._id)
			.expect(401)
			.end(function(discussionDeleteErr, discussionDeleteRes) {
				// Set message assertion
				(discussionDeleteRes.body.message).should.match('User is not logged in');

				// Handle Discussion error error
				done(discussionDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Discussion.remove().exec();
		done();
	});
});