'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Comment = mongoose.model('Comment'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, comment;

/**
 * Comment routes tests
 */
describe('Comment CRUD tests', function() {
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

		// Save a user to the test db and create new Comment
		user.save(function() {
			comment = {
				name: 'Comment Name'
			};

			done();
		});
	});

	it('should be able to save Comment instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Comment
				agent.post('/comments')
					.send(comment)
					.expect(200)
					.end(function(commentSaveErr, commentSaveRes) {
						// Handle Comment save error
						if (commentSaveErr) done(commentSaveErr);

						// Get a list of Comments
						agent.get('/comments')
							.end(function(commentsGetErr, commentsGetRes) {
								// Handle Comment save error
								if (commentsGetErr) done(commentsGetErr);

								// Get Comments list
								var comments = commentsGetRes.body;

								// Set assertions
								(comments[0].user._id).should.equal(userId);
								(comments[0].name).should.match('Comment Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Comment instance if not logged in', function(done) {
		agent.post('/comments')
			.send(comment)
			.expect(401)
			.end(function(commentSaveErr, commentSaveRes) {
				// Call the assertion callback
				done(commentSaveErr);
			});
	});

	it('should not be able to save Comment instance if no name is provided', function(done) {
		// Invalidate name field
		comment.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Comment
				agent.post('/comments')
					.send(comment)
					.expect(400)
					.end(function(commentSaveErr, commentSaveRes) {
						// Set message assertion
						(commentSaveRes.body.message).should.match('Please fill Comment name');
						
						// Handle Comment save error
						done(commentSaveErr);
					});
			});
	});

	it('should be able to update Comment instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Comment
				agent.post('/comments')
					.send(comment)
					.expect(200)
					.end(function(commentSaveErr, commentSaveRes) {
						// Handle Comment save error
						if (commentSaveErr) done(commentSaveErr);

						// Update Comment name
						comment.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Comment
						agent.put('/comments/' + commentSaveRes.body._id)
							.send(comment)
							.expect(200)
							.end(function(commentUpdateErr, commentUpdateRes) {
								// Handle Comment update error
								if (commentUpdateErr) done(commentUpdateErr);

								// Set assertions
								(commentUpdateRes.body._id).should.equal(commentSaveRes.body._id);
								(commentUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Comments if not signed in', function(done) {
		// Create new Comment model instance
		var commentObj = new Comment(comment);

		// Save the Comment
		commentObj.save(function() {
			// Request Comments
			request(app).get('/comments')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Comment if not signed in', function(done) {
		// Create new Comment model instance
		var commentObj = new Comment(comment);

		// Save the Comment
		commentObj.save(function() {
			request(app).get('/comments/' + commentObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', comment.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Comment instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Comment
				agent.post('/comments')
					.send(comment)
					.expect(200)
					.end(function(commentSaveErr, commentSaveRes) {
						// Handle Comment save error
						if (commentSaveErr) done(commentSaveErr);

						// Delete existing Comment
						agent.delete('/comments/' + commentSaveRes.body._id)
							.send(comment)
							.expect(200)
							.end(function(commentDeleteErr, commentDeleteRes) {
								// Handle Comment error error
								if (commentDeleteErr) done(commentDeleteErr);

								// Set assertions
								(commentDeleteRes.body._id).should.equal(commentSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Comment instance if not signed in', function(done) {
		// Set Comment user 
		comment.user = user;

		// Create new Comment model instance
		var commentObj = new Comment(comment);

		// Save the Comment
		commentObj.save(function() {
			// Try deleting Comment
			request(app).delete('/comments/' + commentObj._id)
			.expect(401)
			.end(function(commentDeleteErr, commentDeleteRes) {
				// Set message assertion
				(commentDeleteRes.body.message).should.match('User is not logged in');

				// Handle Comment error error
				done(commentDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Comment.remove().exec();
		done();
	});
});