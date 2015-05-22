// app/routes/users.server.routes.js

var users 		= require('../../app/controllers/users.server.controller'),
	passport 	= require('passport');

module.exports = function(app) {



	// ================================================
	app.route('/signup')
		.get(users.renderSignup)
		.post(users.signup);

	app.route('/signin')
		.get(users.renderSignin)
		.post(passport.authenticate('local', {
			successRedirect: '/',			// tells passport where to redirect on success
			failureRedirect: '/signin',		// tells passport where to redirect on failure
			failureFlash: true				// tells passport whether or not to use flash messages
		}));

	app.get('/signout', users.signout);

	// ================================================

	app.get('/oauth/facebook', passport.authenticate('facebook', {
		scope: 'email',
		failureRedirect: '/signin'
	}));

	app.get('/oauth/facebook/callback', passport.authenticate('facebook', {
		failureRedirect: '/signin',
		successRedirect: '/'
	}));

	// ================================================

	app.get('/oauth/twitter', passport.authenticate('twitter', {
		failureRedirect: '/signin'
	}));

	app.get('/oauth/twitter/callback', passport.authenticate('twitter', {
		failureRedirect: '/signin',
		successRedirect: '/'
	}));

	// ================================================

	app.get('/oauth/google', passport.authenticate('google', {
		failureRedirect: '/signin',
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		],
	}));

	app.get('/oauth/google/callback', passport.authenticate('google', {
		failureRedirect: '/signin',
		successRedirect: '/'
	}));


	//app.route('/users/:userId')
	//	.get(users.read)
	//	.put(users.update)
	//	.delete(users.delete);

	// this is the middleware that will be called before the 
	//	route '/users/:userId' above
	//	this is so that req.user in the controller will be populated
	//app.param('userId', users.userByID);

};