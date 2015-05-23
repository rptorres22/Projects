// app/routes/article.server.routes.js

var users 		= require('../../app/controllers/users.server.controller'),
	articles 	= require('../../app/controllers/articles.server.controller');




module.exports = function (app) {

	app.route('/api/articles')
		.get(articles.list)

		// user needs to be logged in first before creating a new article
		.post(users.requiresLogin, articles.create);


	app.route('/api/articles/:articleId')
		.get(articles.read)

		// user needs to be logged in and be the creator to update and delete articles
		.put(users.requiresLogin, articles.hasAuthorization, articles.update)
		.delete(users.requiresLogin, articles.hasAuthorization, articles.delete);

	// to make sure every route that has the articleId parameter
	// to first call the articles.articleByID() middleware
	app.param('articleId', articles.articleByID);
};