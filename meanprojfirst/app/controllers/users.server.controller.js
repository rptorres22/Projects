// app/controllers/users.server.controller.js

// Invoke 'strict' JavaScript mode
//'use strict';

// Load the module dependencies
var User 		= require('mongoose').model('User'),
	passport 	= require('passport');



// Create a new error handling controller method
var getErrorMessage = function(err) {
	// Define the error message variable
	var message = '';

	// If an internal MongoDB error occurs get the error message
	if (err.code) {		// this is a MongoDB indexing error
		switch (err.code) {
			// If a unique index error occurs set the message error
			case 11000:
			case 11001:
				message = 'Username already exists';
				break;
			// If a general error occurs set the message error
			default:
				message = 'Something went wrong';
		}
	} else {
		// Grab the first error message from a list of possible errors
		// err.errors is from Mongoose validation error
		for (var errName in err.errors) {
			if (err.errors[errName].message) 
				message = err.errors[errName].message;
		}
	}

	// Return the message error
	return message;
};



// Create a new controller method that renders the signin page
exports.renderSignin = function (req, res, next) {
	// If user is not connected render the signin page, otherwise redirect the user back to the main application page
	if (!req.user) {
		// Use the 'response' object to render the signin page
		res.render('signin', {
			// Set the page title variable
			title: 'Sign-in Form',
			// Set the flash message variable
			messages: req.flash('error') || req.flash('info')
		});
	} else {
		return res.redirect('/');
	}
};


// Create a new controller method that renders the signup page
exports.renderSignup = function (req, res, next) {
	// If user is not connected render the signup page, otherwise redirect the user back to the main application page
	if (!req.user) {
		// Use the 'response' object to render the signup page
		res.render('signup', { 
			// Set the page title variable
			title: 'Sign-up Form', 
			// Set the flash message variable
			messages: req.flash('error')
		});
	} else {
		return res.redirect('/');
	}
};

// Create a new controller method that creates new 'regular' users
exports.signup = function (req, res, next) {
	// If user is not connected, create and login a new user, otherwise redirect the user back to the main application page
	if (!req.user) {
		// Create a new 'User' model instance
		var user = new User(req.body);
		var message = null;

		// Set the user provider property
		user.provider = 'local';

		// Try saving the new user document
		user.save(function (err) {
			// If an error occurs, use flash messages to report the error
			if (err) {
				// Use the error handling method to get the error message
				var message = getErrorMessage(err);

				// Set the flash messages
				req.flash('error', message);

				// Redirect the user back to the signup page
				return res.redirect('/signup');
			}

			// If the user was created successfully use the Passport 'login' method to login
			//req.login() is provided by passport
			req.login(user, function (err) { 
				// If a login error occurs move to the next middleware
				if (err) 
					return next(err);

				// Redirect the user back to the main application page
				return res.redirect('/');
			});
		});
	} else {
		return res.redirect('/');
	}
};

// Create a new controller method for signing out
exports.signout = function (req, res) {

	// Use the Passport 'logout' method to logout
	req.logout();		// res.logout() is provided by passport

	// Redirect the user back to the main application page
	res.redirect('/');
};


// Create a new controller method that creates new 'OAuth' users
exports.saveOAuthUserProfile = function (req, profile, done) {
	// Try finding a user document that was registered using the current OAuth provider
	User.findOne({
		provider: profile.provider,
		providerId: profile.providerId
	}, function (err, user) {
		// If an error occurs continue to the next middleware
		if (err) {

			return done(err);

		} else {
			// If a user could not be found, create a new user, otherwise, continue to the next middleware
			if (!user) {
				// Set a possible base username
				var possibleUsername = profile.username || 
					((profile.email) ? profile.email.split('@')[0] : '');

				// Find a unique available username
				User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
					// Set the available user name
					profile.username = availableUsername;

					// Create the user
					user = new User(profile);

					// Try saving the new user document
					user.save(function(err) {
						if (err) {
							var message = _this.getErrorMessage(err);

							req.flash('error', message);
							return res.redirect('/signup');
						}

						// return user
						return done(err, user);
					});
				});
			} else {

				// if it finds the user, return user's mongoDB document
				return done(err, user);
			}
		}
	});
};


// Create a new controller middleware that is used to authorize authenticated operations
// to check if user is authenticated
// this will use the passport initiated req.isAuthenticated() method
// to check whether a user is currently authenticated.
// if user is not it will respond with an auth error and an http error
// if it is it will move onto next middleware
exports.requiresLogin = function(req, res, next) {
	// If a user is not authenticated send the appropriate error message
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}

	// Call the next middleware
	next();
};


/*
exports.create = function (req, res, next) {
	var user = new User(req.body);

	user.save(function (err) {
		if (err) {
			return next (err);
		} else {
			res.json(user);
		}
	});
};

exports.list = function (req, res, next) {
	User.find({}, function (err, users) {
		if (err) {
			return next (err);
		} else {
			res.json(users);
		}
	});
};

exports.read = function (req, res) {
	//req.user gets populated/created by the function userByID below
	//that function will be called by middleware in the user.server.routes 
	//file before it gets to this one
	res.json(req.user);
};

exports.userByID = function (req, res, next, id) {

	//console.log("i'm getting called by app.param in the user.server.routes file");

	User.findOne({
		_id: id
	}, function(err, user) {
		if (err) {
			return next (err);
		} else {
			req.user = user;
			next();
		}
	});
};

exports.update = function (req, res, next) {
	User.findByIdAndUpdate(req.user.id, req.body, function (err, user) {
		if (err) {
			return next(err);
		} else {
			res.json(user);
		}
	});
};

exports.delete = function (req, res, next) {
	req.user.remove(function (err) {
		if (err) {
			return next(err);
		} else {
			res.json(req.user);
		}
	});
};

*/