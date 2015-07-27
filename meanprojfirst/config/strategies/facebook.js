// config/strategies/facebook.js

// Invoke 'strict' JavaScript mode
//'use strict';

// Load the module dependencies
var passport 			= require('passport'),
	url					= require('url'),
	FaceBookStrategy 	= require('passport-facebook').Strategy,
	config				= require('../config'),
	users				= require('../../app/controllers/users.server.controller');


// Create the Facebook strategy configuration method
module.exports = function () {

	// Use the Passport's Facebook strategy 
	passport.use(new FaceBookStrategy({
		clientID: 			config.facebook.clientID,
		clientSecret: 		config.facebook.clientSecret,
		callbackURL: 		config.facebook.callbackURL,
		passReqToCallback: 	true
	},
	function (req, accessToken, refreshToken, profile, done) {
		// Set the user's provider data and include tokens
		var providerData = profile._json;
		providerData.accessToken = accessToken;
		providerData.refreshToken = refreshToken;

		//console.log(profile);
		// Create the user OAuth profile
		var providerUserProfile = {
			firstName: 		profile.name.givenName,
			lastName: 		profile.name.familyName,
			fullName: 		profile.displayName,
			email: 			profile.emails[0].value, //need to add { scope: 'email' } in router
			username: 		profile.username,
			provider: 		'facebook',
			providerId: 	profile.id,
			providerData: 	providerData
		};

		// Save the user OAuth profile
		users.saveOAuthUserProfile(req, providerUserProfile, done);
	}
	));
};