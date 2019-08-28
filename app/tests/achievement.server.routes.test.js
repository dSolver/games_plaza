'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Achievement = mongoose.model('Achievement'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, achievement;

/**
 * Achievement routes tests
 */
describe('Achievement CRUD tests', function() {
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

		// Save a user to the test db and create new Achievement
		user.save(function() {
			achievement = {
				name: 'Achievement Name'
			};

			done();
		});
	});

	it('should be able to save Achievement instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Achievement
				agent.post('/achievements')
					.send(achievement)
					.expect(200)
					.end(function(achievementSaveErr, achievementSaveRes) {
						// Handle Achievement save error
						if (achievementSaveErr) done(achievementSaveErr);

						// Get a list of Achievements
						agent.get('/achievements')
							.end(function(achievementsGetErr, achievementsGetRes) {
								// Handle Achievement save error
								if (achievementsGetErr) done(achievementsGetErr);

								// Get Achievements list
								var achievements = achievementsGetRes.body;

								// Set assertions
								(achievements[0].user._id).should.equal(userId);
								(achievements[0].name).should.match('Achievement Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Achievement instance if not logged in', function(done) {
		agent.post('/achievements')
			.send(achievement)
			.expect(401)
			.end(function(achievementSaveErr, achievementSaveRes) {
				// Call the assertion callback
				done(achievementSaveErr);
			});
	});

	it('should not be able to save Achievement instance if no name is provided', function(done) {
		// Invalidate name field
		achievement.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Achievement
				agent.post('/achievements')
					.send(achievement)
					.expect(400)
					.end(function(achievementSaveErr, achievementSaveRes) {
						// Set message assertion
						(achievementSaveRes.body.message).should.match('Please fill Achievement name');
						
						// Handle Achievement save error
						done(achievementSaveErr);
					});
			});
	});

	it('should be able to update Achievement instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Achievement
				agent.post('/achievements')
					.send(achievement)
					.expect(200)
					.end(function(achievementSaveErr, achievementSaveRes) {
						// Handle Achievement save error
						if (achievementSaveErr) done(achievementSaveErr);

						// Update Achievement name
						achievement.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Achievement
						agent.put('/achievements/' + achievementSaveRes.body._id)
							.send(achievement)
							.expect(200)
							.end(function(achievementUpdateErr, achievementUpdateRes) {
								// Handle Achievement update error
								if (achievementUpdateErr) done(achievementUpdateErr);

								// Set assertions
								(achievementUpdateRes.body._id).should.equal(achievementSaveRes.body._id);
								(achievementUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Achievements if not signed in', function(done) {
		// Create new Achievement model instance
		var achievementObj = new Achievement(achievement);

		// Save the Achievement
		achievementObj.save(function() {
			// Request Achievements
			request(app).get('/achievements')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Achievement if not signed in', function(done) {
		// Create new Achievement model instance
		var achievementObj = new Achievement(achievement);

		// Save the Achievement
		achievementObj.save(function() {
			request(app).get('/achievements/' + achievementObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', achievement.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Achievement instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Achievement
				agent.post('/achievements')
					.send(achievement)
					.expect(200)
					.end(function(achievementSaveErr, achievementSaveRes) {
						// Handle Achievement save error
						if (achievementSaveErr) done(achievementSaveErr);

						// Delete existing Achievement
						agent.delete('/achievements/' + achievementSaveRes.body._id)
							.send(achievement)
							.expect(200)
							.end(function(achievementDeleteErr, achievementDeleteRes) {
								// Handle Achievement error error
								if (achievementDeleteErr) done(achievementDeleteErr);

								// Set assertions
								(achievementDeleteRes.body._id).should.equal(achievementSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Achievement instance if not signed in', function(done) {
		// Set Achievement user 
		achievement.user = user;

		// Create new Achievement model instance
		var achievementObj = new Achievement(achievement);

		// Save the Achievement
		achievementObj.save(function() {
			// Try deleting Achievement
			request(app).delete('/achievements/' + achievementObj._id)
			.expect(401)
			.end(function(achievementDeleteErr, achievementDeleteRes) {
				// Set message assertion
				(achievementDeleteRes.body.message).should.match('User is not logged in');

				// Handle Achievement error error
				done(achievementDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Achievement.remove().exec();
		done();
	});
});