// app/routes/article.server.routes.js

// Invoke 'strict' JavaScript mode
//'use strict';

// Load the module dependencies
var users 		= require('../../app/controllers/users.server.controller'),
	articles 	= require('../../app/controllers/articles.server.controller');



// Define the routes module' method
module.exports = function (app) {

	// Set up the 'articles' base routes 
	app.route('/api/articles')
		.get(articles.list)

		// user needs to be logged in first before creating a new article
		.post(users.requiresLogin, articles.create);


	// Set up the 'articles' parameterized routes
	app.route('/api/articles/:articleId')
		.get(articles.read)

		// user needs to be logged in and be the creator to update and delete articles
		.put(users.requiresLogin, articles.hasAuthorization, articles.update)
		.delete(users.requiresLogin, articles.hasAuthorization, articles.delete);


	// Set up the 'articleId' parameter middleware   
	// to make sure every route that has the articleId parameter
	// to first call the articles.articleByID() middleware
	app.param('articleId', articles.articleByID);
};