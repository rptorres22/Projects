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

	// Create a new article object
	var article = new Article(req.body);

	// Set the article's 'creator' property
	article.creator = req.user;

	//try saving the article
	article.save(function (err) {
		if (err) {
			// if error, send error message
			return res.status(400).send({
				message: getErrorMessage(err)
			});
		} else {
			// send a JSON representation of the article
			res.json(article);
		}
	});
};


// lists a collection of articles
exports.list = function (req, res) {
	// Use the model 'find' method to get a list of articles
	Article.find()
		.sort('-created')
		.populate('creator', 'firstName lastName fullName')
		.exec(function (err, articles) {
			if (err) {
				// If error, send error message
				return res.status(400).send({
					message: getErrorMessage(err)
				});
			} else {
				// Send JSON representation of the article
				res.json(articles);
			}
		});
};


// getting an article by ID
exports.articleByID = function (req, res, next, id) {
	Article.findById(id)
		.populate('creator', 'firstName lastName fullName')
		.exec(function (err, article) {
			if (err) return next(err);
			if (!article)
				return next(new Error('Failed to load article ' + id));

			//console.log(article.creator.fullName);
			req.article = article;
			next();
		});
};

// req.article should already be populated by articlesByID
// when a user hits a route that contains an article ID
exports.read = function (req, res) {
	//console.log(req.article);
	res.json(req.article);
}


// to update an article
// this assumes that you already obtained the article object
// in the articleByID() middleware.  So you only need to update
// the title and content fields.
exports.update = function (req, res) {
	// Get the article form the 'request' object
	var article = req.article;

	// update the article fields
	article.title = req.body.title;
	article.content = req.body.content;

	// try saving the updated article
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


// middleware to check if article is created by
// the user.  only users that created the article
// can update/delete them.
exports.hasAuthorization = function (req, res, next) {
	if (req.article.creator.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};







