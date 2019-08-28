'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Wiki = mongoose.model('Wiki'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, wiki;

/**
 * Wiki routes tests
 */
describe('Wiki CRUD tests', function() {
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

		// Save a user to the test db and create new Wiki
		user.save(function() {
			wiki = {
				name: 'Wiki Name'
			};

			done();
		});
	});

	it('should be able to save Wiki instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Wiki
				agent.post('/wikis')
					.send(wiki)
					.expect(200)
					.end(function(wikiSaveErr, wikiSaveRes) {
						// Handle Wiki save error
						if (wikiSaveErr) done(wikiSaveErr);

						// Get a list of Wikis
						agent.get('/wikis')
							.end(function(wikisGetErr, wikisGetRes) {
								// Handle Wiki save error
								if (wikisGetErr) done(wikisGetErr);

								// Get Wikis list
								var wikis = wikisGetRes.body;

								// Set assertions
								(wikis[0].user._id).should.equal(userId);
								(wikis[0].name).should.match('Wiki Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Wiki instance if not logged in', function(done) {
		agent.post('/wikis')
			.send(wiki)
			.expect(401)
			.end(function(wikiSaveErr, wikiSaveRes) {
				// Call the assertion callback
				done(wikiSaveErr);
			});
	});

	it('should not be able to save Wiki instance if no name is provided', function(done) {
		// Invalidate name field
		wiki.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Wiki
				agent.post('/wikis')
					.send(wiki)
					.expect(400)
					.end(function(wikiSaveErr, wikiSaveRes) {
						// Set message assertion
						(wikiSaveRes.body.message).should.match('Please fill Wiki name');
						
						// Handle Wiki save error
						done(wikiSaveErr);
					});
			});
	});

	it('should be able to update Wiki instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Wiki
				agent.post('/wikis')
					.send(wiki)
					.expect(200)
					.end(function(wikiSaveErr, wikiSaveRes) {
						// Handle Wiki save error
						if (wikiSaveErr) done(wikiSaveErr);

						// Update Wiki name
						wiki.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Wiki
						agent.put('/wikis/' + wikiSaveRes.body._id)
							.send(wiki)
							.expect(200)
							.end(function(wikiUpdateErr, wikiUpdateRes) {
								// Handle Wiki update error
								if (wikiUpdateErr) done(wikiUpdateErr);

								// Set assertions
								(wikiUpdateRes.body._id).should.equal(wikiSaveRes.body._id);
								(wikiUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Wikis if not signed in', function(done) {
		// Create new Wiki model instance
		var wikiObj = new Wiki(wiki);

		// Save the Wiki
		wikiObj.save(function() {
			// Request Wikis
			request(app).get('/wikis')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Wiki if not signed in', function(done) {
		// Create new Wiki model instance
		var wikiObj = new Wiki(wiki);

		// Save the Wiki
		wikiObj.save(function() {
			request(app).get('/wikis/' + wikiObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', wiki.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Wiki instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Wiki
				agent.post('/wikis')
					.send(wiki)
					.expect(200)
					.end(function(wikiSaveErr, wikiSaveRes) {
						// Handle Wiki save error
						if (wikiSaveErr) done(wikiSaveErr);

						// Delete existing Wiki
						agent.delete('/wikis/' + wikiSaveRes.body._id)
							.send(wiki)
							.expect(200)
							.end(function(wikiDeleteErr, wikiDeleteRes) {
								// Handle Wiki error error
								if (wikiDeleteErr) done(wikiDeleteErr);

								// Set assertions
								(wikiDeleteRes.body._id).should.equal(wikiSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Wiki instance if not signed in', function(done) {
		// Set Wiki user 
		wiki.user = user;

		// Create new Wiki model instance
		var wikiObj = new Wiki(wiki);

		// Save the Wiki
		wikiObj.save(function() {
			// Try deleting Wiki
			request(app).delete('/wikis/' + wikiObj._id)
			.expect(401)
			.end(function(wikiDeleteErr, wikiDeleteRes) {
				// Set message assertion
				(wikiDeleteRes.body.message).should.match('User is not logged in');

				// Handle Wiki error error
				done(wikiDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Wiki.remove().exec();
		done();
	});
});