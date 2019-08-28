'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Review = mongoose.model('Review'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, review;

/**
 * Review routes tests
 */
describe('Review CRUD tests', function() {
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

		// Save a user to the test db and create new Review
		user.save(function() {
			review = {
				name: 'Review Name'
			};

			done();
		});
	});

	it('should be able to save Review instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Review
				agent.post('/reviews')
					.send(review)
					.expect(200)
					.end(function(reviewSaveErr, reviewSaveRes) {
						// Handle Review save error
						if (reviewSaveErr) done(reviewSaveErr);

						// Get a list of Reviews
						agent.get('/reviews')
							.end(function(reviewsGetErr, reviewsGetRes) {
								// Handle Review save error
								if (reviewsGetErr) done(reviewsGetErr);

								// Get Reviews list
								var reviews = reviewsGetRes.body;

								// Set assertions
								(reviews[0].user._id).should.equal(userId);
								(reviews[0].name).should.match('Review Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Review instance if not logged in', function(done) {
		agent.post('/reviews')
			.send(review)
			.expect(401)
			.end(function(reviewSaveErr, reviewSaveRes) {
				// Call the assertion callback
				done(reviewSaveErr);
			});
	});

	it('should not be able to save Review instance if no name is provided', function(done) {
		// Invalidate name field
		review.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Review
				agent.post('/reviews')
					.send(review)
					.expect(400)
					.end(function(reviewSaveErr, reviewSaveRes) {
						// Set message assertion
						(reviewSaveRes.body.message).should.match('Please fill Review name');
						
						// Handle Review save error
						done(reviewSaveErr);
					});
			});
	});

	it('should be able to update Review instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Review
				agent.post('/reviews')
					.send(review)
					.expect(200)
					.end(function(reviewSaveErr, reviewSaveRes) {
						// Handle Review save error
						if (reviewSaveErr) done(reviewSaveErr);

						// Update Review name
						review.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Review
						agent.put('/reviews/' + reviewSaveRes.body._id)
							.send(review)
							.expect(200)
							.end(function(reviewUpdateErr, reviewUpdateRes) {
								// Handle Review update error
								if (reviewUpdateErr) done(reviewUpdateErr);

								// Set assertions
								(reviewUpdateRes.body._id).should.equal(reviewSaveRes.body._id);
								(reviewUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Reviews if not signed in', function(done) {
		// Create new Review model instance
		var reviewObj = new Review(review);

		// Save the Review
		reviewObj.save(function() {
			// Request Reviews
			request(app).get('/reviews')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Review if not signed in', function(done) {
		// Create new Review model instance
		var reviewObj = new Review(review);

		// Save the Review
		reviewObj.save(function() {
			request(app).get('/reviews/' + reviewObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', review.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Review instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Review
				agent.post('/reviews')
					.send(review)
					.expect(200)
					.end(function(reviewSaveErr, reviewSaveRes) {
						// Handle Review save error
						if (reviewSaveErr) done(reviewSaveErr);

						// Delete existing Review
						agent.delete('/reviews/' + reviewSaveRes.body._id)
							.send(review)
							.expect(200)
							.end(function(reviewDeleteErr, reviewDeleteRes) {
								// Handle Review error error
								if (reviewDeleteErr) done(reviewDeleteErr);

								// Set assertions
								(reviewDeleteRes.body._id).should.equal(reviewSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Review instance if not signed in', function(done) {
		// Set Review user 
		review.user = user;

		// Create new Review model instance
		var reviewObj = new Review(review);

		// Save the Review
		reviewObj.save(function() {
			// Try deleting Review
			request(app).delete('/reviews/' + reviewObj._id)
			.expect(401)
			.end(function(reviewDeleteErr, reviewDeleteRes) {
				// Set message assertion
				(reviewDeleteRes.body.message).should.match('User is not logged in');

				// Handle Review error error
				done(reviewDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Review.remove().exec();
		done();
	});
});