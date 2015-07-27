// config/env/production.js

// Invoke 'strict' JavaScript mode
//'use strict';

// Set the 'development' environment configuration object
module.exports = {
	db: 'mongodb://localhost/mean-production',

	sessionSecret: 'productionSessionSecret',


	//https://developers.facebook.com/
	facebook: {
		clientID: '819714528122681',
		clientSecret: '74163950b427a2bfa216db5c33b8066e',
		callbackURL: 'http://localhost:3000/oauth/facebook/callback'
	},


	//https://dev.twitter.com/
	twitter: {
		clientID: 'zFAt5fsbnQHBCs3zZzSGjDI9N',
		clientSecret: 'WejLFzF6yw6pCJTZHhBpD89mJdYLmoPnGRkjIcqpEsum2dfxBj',
		callbackURL: 'http://localhost:3000/oauth/twitter/callback'
	},

	//https://console.developers.google.com
		google: {
		clientID: '31505953581-a02hvj6485nfb97sf01q3fr30n2l3loe.apps.googleusercontent.com',
		clientSecret: 'xfPfXa067EvdLarEci6wOKSk',
		callbackURL: 'http://localhost:3000/oauth/google/callback'
	}

};
