var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var async = require('async');
var request = require('request');
var xml2js = require('xml2js');
var _ = require('lodash');



//"Show" mongoose schema
/*
	A schema is just a representation of yoru data in MongoDB.  This is where
	you can enforce a certain field to be of particular type.  A field can also
	be rquired, unique, contain only certain characters.

	All these fields are almost 1-to-1 match with the data response from the
	TheTVDB.com API.  Two things to note here:
	1. the default _id field has been overwritten with the numberical ID from 
		"The TVDB".  There is no point in having both _id and showId fields
	2. The "subscribers" field is an array of "User" ObjectIDs.  Essentially 
		it's just an array of refrences to "User" documents.
*/
var showSchema = new mongoose.Schema({
	_id: Number,
	name: String,
	airsDaysOfWeek: String,
	airsTime: String,
	firstAired: Date,
	genre: [String],
	network: String,
	overview: String,
	rating: Number,
	ratingCount: Number,
	status: String,
	poster: String,
	subscribers: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	}],
	episodes: [{
		season: Number,
		episodeNumber: Number,
		episodeName: String,
		firstAired: Date,
		overview: String
	}]
});


//Create the User schema
var usersSchema = new mongoose.Schema({
	email: { 
		type: String,
		unique: true
	},
	password: String
});


/*
	Using "pre-save" mongoose middleware
*/
usersSchema.pre('save', function(next) {
	var user = this;
	if(!user.isModified('password')) 
		return next();

	bcrypt.genSalt(10, function(err, salt) {
		if(err)
			return next(err);
		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err)
				return next(err);
			user.password = hash;
			next();
		});
	});
});

/*
	comparePassword instance method
*/
usersSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err)
			return cb(err);
		cb(null, isMatch);
	});
};




/*
	Now that we have schemas in place, we just have to create mongoose models
	which we will use for querying MongoDB.  Where a "schema" is just an 
	abstract representation of the data, a "model" on the other hand is a 
	concrete object with methods to query, remove, update, and save data
	from/to MongoDB
*/
var User = mongoose.model('User', usersSchema);
var Show = mongoose.model('Show', showSchema);


//Connect to the database:
mongoose.connect('localhost');


var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




/*
	EXPRESS API ROUTES
	Table that outliens a route's responsibility:
	ROUTE  				POST 			GET 			PUT 				DELETE
	/api/shows 			Add new show    Get all shows  	Update all shows    Remove all shows
	/api/shows/:id      N/A             Get a show      Update a show       Delete a show

	You may have noticed the "next" parameter.  If there is an error, it will be passed
	onto the error middleware and handled there as well.  
*/
app.get('/api/shows', function(req, res, next) {
	var query = Show.find();
	if (req.query.genre) {
		query.where({ genre: req.query.genre });
	} else if (req.query.alphabet) {
		query.where({ name: new RegExp('^' + '[' + req.query.alphabet + ']', 'i') });
	} else {
		query.limit(12);
	}

	query.exec(function(err, shows) {
		if(err)
			return next(err);
		res.send(shows);
	});
});

app.get('/api/shows/:id', function(req, res, next) {
	Show.findById(req.params.id, function(err, show) {
		if(err)
			return next(err);
		res.send(show);
	});
});


/*
	To add a new TV show to the database
*/
app.post('/api/shows', function(req, res, next) {
	
	var apiKey = '9EF1D1E7D28FDA0B'; // must first obtain an API key from the TVDB

	/*
		The xml2js parser is configured to normalize all tags to lowercase and disable conversion
		to arrays when there is only one child element.
	*/
	var parser = xml2js.Parser({
		explicitArray: false,
		normalizeTags: true
	});

	/*
		The TV show name is "slugified" with underscores instead of dashes because that's what the TVDB
		API expects.  For example if you pass in Breaking Bad it will be converted to breaking_bad.
	*/
	var seriesName = req.body.showName
		.toLowerCase()
		.replace(/ /g, '_')
		.replace(/[^\w-]+/g, '');




	/*
		Using "async.waterfall" to manage multiple asynchronous operations.  Here is how it works:
		1. Get the "Show" ID given the "Show Name" and pass it on to the next function.
		2. Get the show information using the "Show" ID from previous step and pass the new "show"
			object on to the next function.
		3. Convert the poster image to Base64, assign it to "show.poster" and pass the "show" 
			object to the final callback function.
		4. Save the "show" object to database.
	*/
	async.waterfall([

		// 1. Get the "Show" ID given the "Show Name" and pass it on to the next function.
		function(callback) {
			request.get('http://thetvdb.com/api/GetSeries.php?seriesname=' + seriesName, function(error, response, body) {
				if(error)
					return next(error);

				parser.parseString(body, function(err,result) {
					if(!result.data.series) {
						return res.sendStatus(404, { message: req.body.showName + ' was not found.'});
					}
					var seriesId = result.data.series.seriesid || result.data.series[0].seriesid;
					callback(err, seriesId);
				});
			});
		},

		// 2. Get the show information using the "Show" ID from previous step and pass the new "show"
		//	object on to the next function.
		function(seriesId, callback) {
			request.get('http://thetvdb.com/api/' + apiKey + '/series/' + seriesId + '/all/en.xml', function(error, response, body) {
				if(error)
					return next(error);

				parser.parseString(body, function(err, result) {
					var series = result.data.series;
					var episodes = result.data.episode;

					var show = new Show({
						_id: series.id,
						name: series.seriesname,
						airsDaysOfWeek: series.airs_dayofweek,
						airsTime: series.airs_time,
						firstAired: series.firstaired,
						genre: series.genre.split('|').filter(Boolean),
						network: series.network,
						overview: series.overview,
						rating: series.rating,
						ratingCount: series.ratingcount,
						runtime: series.runtime,
						status: series.status,
						poster: series.poster,
						episodes: []
					});

					_.each(episodes, function(episode) {
						show.episodes.push({
							season: episode.seasonnumber,
							episodeNumber: episode.episodenumber,
							episodeName: episode.episodename,
							firstAired: episode.firstaired,
							overview: episode.overview
						});
					});

					callback(err, show);	
				});
			});
		},

		/* 
			3. Convert the poster image to Base64, assign it to "show.poster" and pass the "show" 
				object to the final callback function.
			Storing Base64 images to MongoDB because we do not have an Amazon S3 account to store these
			images.  As a side effect, each image is about 30% larger in the Base64 form, but is well
			within the 500MB free tier limit provided by MongoLab and MongoHQ.
		*/
		function(show, callback) {
			var url = 'http://thetvdb.com/banners/' + show.poster;
			request({ url: url, encoding: null }, function(error, response, body) {
				show.poster = 'data:' + response.headers['content-type'] + ';base64,' + body.toString('base64');
				callback(error, show);
			});
		}

		//4. Save the "show" object to database.
	], function(err, show) { 
		if(err)
			return next(err);

		show.save(function(err) {
			if(err) {
				/*
					Error code 11000 refers to the duplicate key error.  We cannot have duplicate _id
					fields in MongoDB.
				*/
				if (err.code == 11000) {
					return res.sendStatus(409, { message: show.name + ' already exists.' });
				}
				return next(err);
			}
			res.sendStatus(200);
		}); 
	});
});


/*
	A common problem when you use HTML5 pushState on the client-side.  To
	get around this problem we have to create a redirect route.

	It is very important that you add this route after all your other routes
	(excluding error handler) because we are using the * wild card that will
	match any route tha tyou type.

	If you try going to http://localhost:3000/asdf this last route will match it
	and you will be redirected to http://localhost:3000/#asdf.  At that point
	AngularJS will try to match this URL with yoru routes defined in 
	$routeProvider.  Since we haven't defined a route that matches /asdf you will
	be redirected back to home page:
*/
app.get('*', function(req, res) {
	res.redirect('/#' + req.originalUrl);
});


/*
	You may have noticed the "next" parameter.  If there is an error, it will be passed
	onto the error middleware and handled there as well.  How you handle the error is up
	to you.  A typical approach is to print a stack strace to the console and return
	only an error message to the user.
*/
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.sendStatus(500, { message: err.message });
});


app.listen(app.get('port'), function() {
  console.log('Express server listening on poirt ' + app.get('port'));
});