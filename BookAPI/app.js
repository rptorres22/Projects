var express = require('express'),
	mongoose = require('mongoose');


var db = mongoose.connect('mongodb://localhost/bookAPI')



var Book = require('./models/bookModel');

var app = express();
var port = process.env.PORT || 3000;




var bookRouter = express.Router();

bookRouter.route('/Books')
	.get(function (req, res) {
		//var responseJson = {hello: "This is my api"};
		//res.json(responseJson);

		var query = {};

		//santising the req.query
		if(req.query.genre)
		{
			query.genre = req.query.genre;
		}

		Book.find(query, function (err, books) { //this will automatically take the query string in the url
			if (err)
				res.status(500).send(err);
			else
				res.json(books);
		});

	});

bookRouter.route('/Books/:bookId')
	.get(function (req, res) {

		Book.findById(req.params.bookId, function (err, book) { //this will automatically take the query string in the url
			if (err)
				res.status(500).send(err);
			else
				res.json(book);
		});

	});




app.use('/api', bookRouter);




app.get('/', function (req, res) {
	res.send('welcome to my api');
});

app.listen(port, function () {
	console.log('Gulp is running my app on PORT: ' + port);
});

