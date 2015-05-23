// app/controllers/users.server.controller.js

var User 	= require('mongoose').model('User');
	passport = require('passport');




var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {		// this is a MongoDB indexing error
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Username already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		// err.errors is from Mongoose validatoin error
		for (var errName in err.errors) {
			if (err.errors[errName].message) 
				message = err.errors[errName].message;
		}
	}

	return message;
};


exports.renderSignin = function (req, res, next) {
	if (!req.user) {
		res.render('signin', {
			title: 'Sign-in Form',
			messages: req.flash('error') || req.flash('info')
		});
	} else {
		return res.redirect('/');
	}
};


exports.renderSignup = function (req, res, next) {
	if (!req.user) {
		res.render('signup', { 
			title: 'Sign-up Form', 
			messages: req.flash('error')
		});
	} else {
		return res.redirect('/');
	}
};


exports.signup = function (req, res, next) {
	if (!req.user) {
		var user = new User(req.body);
		var message = null;

		user.provider = 'local';

		user.save(function (err) {
			
			if (err) {
				var message = getErrorMessage(err);

				req.flash('error', message);
				return res.redirect('/signup');
			}

			//req.login() is provided by passport
			req.login(user, function (err) { 
				if (err) 
					return next(err);
				return res.redirect('/');
			});
		});
	} else {
		return res.redirect('/');
	}
};


exports.signout = function (req, res) {
	req.logout();		// res.logout() is provided by passport
	res.redirect('/');
};


exports.saveOAuthUserProfile = function (req, profile, done) {

	User.findOne({
		provider: profile.provider,
		providerId: profile.providerId
	}, function (err, user) {
		if (err) {

			return done(err);

		} else {
			// if it can not find an existing user
			if (!user) {

				var possibleUsername = profile.username || 
					((profile.email) ? profile.email.split('@')[0] : '');

				// find a unique username
				User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
					profile.username = availableUsername;

					user = new User(profile);

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


// to check if user is authenticated
// this will use the passport initiated req.isAuthenticated() method
// to check whether a user is currently authenticated.
// if user is not it will respond with an auth error and an http error
exports.requiresLogin = function(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}

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