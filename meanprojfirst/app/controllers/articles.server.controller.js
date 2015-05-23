// app/controllers/articles.server.controller.js

var mongoose	= require('mongoose');
	Article 	= mongoose.model('Article');



/*
	Error handling
	It is preferable to write a simple error handling method that will
	take care of extrating a simple error message from the Mongoose error
	object and provide it to your controller methods
*/
var getErrorMessage = function (err) {	//accepts a Mongoose error object
	if (err.errors) {
		for (var errName in err.errors) {
			if(err.errors[errName].message)
				return err.errors[errName].message; // only return first error as to not overwhelm user
		}
	} else {
		return 'Unknown server error';
	}
};








// Creates a new article
exports.create = function (req, res) {

	var article = new Article(req.body);
	article.creator = req.user;

	article.save(function (err) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.json(article);
		}
	});
};


// lists a collection of articles
exports.list = function (req, res) {
	Article.find()
		.sort('-created')
		.populate('creator', 'firstName lastName fullName')
		.exec(function (err, articles) {
			if (err) {
				return res.status(400).send({
					message: getErrorMessage(err)
				});
			} else {
				res.json(articles);
			}
		});
};


// getting an article by ID
exports.articlesByID = function (req, res, next, id) {
	Article.findById(id)
		.populate('creator', 'firstName lastName fullName')
		.exec(function (err, article) {
			if (err) return next(err);
			if (!article)
				return next(new Error('Failed to load article ' + id));

			req.article = article;
			next();
		});
};

// req.articles should already be populated by articlesByID
// when a user hits a route that contains an article ID
exports.read = function (req, res) {
	res.json(req.article);
}


// to update an article
// this assumes that you already obtained the article object
// in the articleByID() middleware.  So you only need to update
// the title and content fields.
exports.update = function (req, res) {
	var article = req.article;

	article.title = req.body.title;
	article.content = req.body.content;

	article.save(function (err) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.json(article);
		}
	});
};


// to delete an article
// this also assumes that you already obtained the article object
// in the articleByID() middleware.  Just need to invoke the mongoose
// remove() method.
exports.delete = function (req, res) {
	var article = req.article;

	article.remove(function (err) {
		if (err) {
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			res.json(article);
		}
	});
};











