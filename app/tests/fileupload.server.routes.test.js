'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Fileupload = mongoose.model('Fileupload'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, fileupload;

/**
 * Fileupload routes tests
 */
describe('Fileupload CRUD tests', function() {
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

		// Save a user to the test db and create new Fileupload
		user.save(function() {
			fileupload = {
				name: 'Fileupload Name'
			};

			done();
		});
	});

	it('should be able to save Fileupload instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Fileupload
				agent.post('/fileuploads')
					.send(fileupload)
					.expect(200)
					.end(function(fileuploadSaveErr, fileuploadSaveRes) {
						// Handle Fileupload save error
						if (fileuploadSaveErr) done(fileuploadSaveErr);

						// Get a list of Fileuploads
						agent.get('/fileuploads')
							.end(function(fileuploadsGetErr, fileuploadsGetRes) {
								// Handle Fileupload save error
								if (fileuploadsGetErr) done(fileuploadsGetErr);

								// Get Fileuploads list
								var fileuploads = fileuploadsGetRes.body;

								// Set assertions
								(fileuploads[0].user._id).should.equal(userId);
								(fileuploads[0].name).should.match('Fileupload Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Fileupload instance if not logged in', function(done) {
		agent.post('/fileuploads')
			.send(fileupload)
			.expect(401)
			.end(function(fileuploadSaveErr, fileuploadSaveRes) {
				// Call the assertion callback
				done(fileuploadSaveErr);
			});
	});

	it('should not be able to save Fileupload instance if no name is provided', function(done) {
		// Invalidate name field
		fileupload.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Fileupload
				agent.post('/fileuploads')
					.send(fileupload)
					.expect(400)
					.end(function(fileuploadSaveErr, fileuploadSaveRes) {
						// Set message assertion
						(fileuploadSaveRes.body.message).should.match('Please fill Fileupload name');
						
						// Handle Fileupload save error
						done(fileuploadSaveErr);
					});
			});
	});

	it('should be able to update Fileupload instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Fileupload
				agent.post('/fileuploads')
					.send(fileupload)
					.expect(200)
					.end(function(fileuploadSaveErr, fileuploadSaveRes) {
						// Handle Fileupload save error
						if (fileuploadSaveErr) done(fileuploadSaveErr);

						// Update Fileupload name
						fileupload.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Fileupload
						agent.put('/fileuploads/' + fileuploadSaveRes.body._id)
							.send(fileupload)
							.expect(200)
							.end(function(fileuploadUpdateErr, fileuploadUpdateRes) {
								// Handle Fileupload update error
								if (fileuploadUpdateErr) done(fileuploadUpdateErr);

								// Set assertions
								(fileuploadUpdateRes.body._id).should.equal(fileuploadSaveRes.body._id);
								(fileuploadUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Fileuploads if not signed in', function(done) {
		// Create new Fileupload model instance
		var fileuploadObj = new Fileupload(fileupload);

		// Save the Fileupload
		fileuploadObj.save(function() {
			// Request Fileuploads
			request(app).get('/fileuploads')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Fileupload if not signed in', function(done) {
		// Create new Fileupload model instance
		var fileuploadObj = new Fileupload(fileupload);

		// Save the Fileupload
		fileuploadObj.save(function() {
			request(app).get('/fileuploads/' + fileuploadObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', fileupload.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Fileupload instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Fileupload
				agent.post('/fileuploads')
					.send(fileupload)
					.expect(200)
					.end(function(fileuploadSaveErr, fileuploadSaveRes) {
						// Handle Fileupload save error
						if (fileuploadSaveErr) done(fileuploadSaveErr);

						// Delete existing Fileupload
						agent.delete('/fileuploads/' + fileuploadSaveRes.body._id)
							.send(fileupload)
							.expect(200)
							.end(function(fileuploadDeleteErr, fileuploadDeleteRes) {
								// Handle Fileupload error error
								if (fileuploadDeleteErr) done(fileuploadDeleteErr);

								// Set assertions
								(fileuploadDeleteRes.body._id).should.equal(fileuploadSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Fileupload instance if not signed in', function(done) {
		// Set Fileupload user 
		fileupload.user = user;

		// Create new Fileupload model instance
		var fileuploadObj = new Fileupload(fileupload);

		// Save the Fileupload
		fileuploadObj.save(function() {
			// Try deleting Fileupload
			request(app).delete('/fileuploads/' + fileuploadObj._id)
			.expect(401)
			.end(function(fileuploadDeleteErr, fileuploadDeleteRes) {
				// Set message assertion
				(fileuploadDeleteRes.body.message).should.match('User is not logged in');

				// Handle Fileupload error error
				done(fileuploadDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Fileupload.remove().exec();
		done();
	});
});