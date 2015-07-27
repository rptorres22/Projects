var express 		= require('express');
var path 			= require('path');
var logger 			= require('morgan');
var cookieParser 	= require('cookie-parser');
var bodyParser 		= require('body-parser');
var mongoose 		= require('mongoose');
var bcrypt 			= require('bcryptjs');
var async 			= require('async');
var request 		= require('request');
var xml2js 			= require('xml2js');
var _ 				= require('lodash');
var session 		= require('express-session');
var passport 		= require('passport');
var LocalStrategy 	= require('passport-local').Strategy;
var agenda 			= require('agenda')({ db: { address: 'localhost:27017/test' } });
var sugar 			= require('sugar');
var nodemailer 		= require('nodemailer');





// Create new agenda task:
/*
	Agenda is a job scheduling library for Node.js similar to none-cron.  We define an agenda
	called "send email alert".  Here, we don't concern ourselves with when it runs. We only 
	care what it does, i.e. what should happen when "send email alert" job is dispatched.

	When this job runs, name of the show will be passed in as an optional "data" object.

	Since we're not storing the entire user document in "subscribers" array (only references),
	we have to use Mongoose's "populate" method.  Once the show is found, we need a list of
	emails of all subscribers that have to be notified.

	We then find the upcoming episode so that we could include a brief summary of the next
	episode in the email message.

	And then it's just yoru standard "Nodemailer" boilerplate for sending emails.  
*/
agenda.define('send email alert', function(job, done) {
	Show.findOne({ name: job.attrs.data }).populate('subscribers').exec(function(err, show) {
		var emails = show.subscribers.map(function(user) {
			return user.email;
		});

		var upcomingEpisode = show.episodes.filter(function(episode) {
			return new Date(episode.firstAired) > new Date();
		})[0];

		var smtpTransport = nodemailer.createTransport('SMTP', {
			service: 'SendGrid',
			auth: { user: 'hslogin', pass: 'hspassword00'}
		});

		var mailOptions = {
			from: 'Fred Foo ✔ <foo@blurdybloop.com>',
			to: emails.join(','),
			subject: show.name + ' is starting soon!',
			text: show.name + ' starts in less than 2 hours on ' + show.network + '.\n\n' + 
				'Episode ' + upcomingEpisode.episodeNumber + 'Overview\n\n' + upcomingEpisode.overview
		};

		smtpTransport.sendMail(mailOptions, function(error, response) {
			console.log('Message sent: ' + response.message);
			smtpTransport.close();
			done();
		});
	});
});

agenda.on('start', function(job) {
	console.log("Job %s starting", job.attrs.name);
});

agenda.on('complete', function(job) {
	console.log("Job %s finished", job.attrs.name);
});








/*
	In order to setup Passport.js we have to configure four things
	1. Passport serialize and deserialize methods
	2. Passport strategy
	3. Express session middleware
	4. Passport middleware
*/

// Serialize and deserialize methods are used to keep you signed-in
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

/*
	Passport comes with hundreds of different strategies for just about every third-party service out there.
	We will not be signing in with Facebook, Google, Twitter.  Instead we will use Passport's 
	"LocalStrategy" to sign in with username and password.
*/
passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
	User.findOne({ email: email }, function(err, user) {
		if(err)
			return done(err);
		if(!user) 
			return done(null, false);
		user.comparePassword(password, function(err, isMatch) {
			if(err)
				return done(err);
			if(isMatch)
				return done(null, user);
			return done(null, false);
		});
	});
}));



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

app.use(session({ 
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

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

			//so it can start the agenda task whenever a new show is added to the database.
			/*
				How do we know hwen to schedule it?  Do we schedule n jobs for every episode of every show or would
				it be better to schedule a recurring job for each show?  We choose the latter approach of using a
				recurring job per show.
				The TVDB API gives us two pieces of information for each show: "air time" and "air day", e.g. "9:00PM"
				and "Tuesday".  Next challenge - how do we construct a "Date" object from that?
				Sugar.js can override built-in objects such as Date to provide us with extra functionality.  The code
				below creats a "Date" object from something like "Next Saturday at 8:00PM" then substract two hours
				from that.

				When a new job is scheduled, Agenda will save that job to MongoDB for guaranteed persistence.
			*/
			var alertDate = Date.create('Next ' + show.airsDaysOfWeek + ' at' + show.airsTime).rewind({ hour: 2});
			agenda.schedule(alertDate, 'send email alert', show.name).repeatEvery('1 week');
			res.sendStatus(200);
		}); 
	});
});









// to protect our routes from unauthenticated requests
function ensureAuthenticated(req, res, next) {
	if(req.isAuthenticated()) 
		next();
	else
		res.sendStatus(401);
}

/*
	When a user tries to sign-in from our AngularJS application, a POST request
	is sent with the following data:
	
	{
		email: 'example@email.com',
		password: '1234'
	}

	This data is passed to the Passport LocalStrategy.  If email is found and 
	password is valid then a new cookie is created with the user object,
	additionally the user object is sent back to the client.

	It is bad to send user's password over the network or store it in a cookie,
	even if the password is encrypted.  A better solution needs to be used.
*/
app.post('/api/login', passport.authenticate('local'), function(req, res) {
	res.cookie('user', JSON.stringify(req.user));
	res.send(req.user);
});

/*
	The signup route has no input validation.  
	Try using "express-validator"
*/
app.post('/api/signup', function(req, res, next) {
	var user = new User({
		email: req.body.email,
		password: req.body.password
	});
	user.save(function(err) {
		if(err) 
			return next(err);
		res.sendStatus(200);
	});
});

/*
	Passport exposes a logout() function on "req" object that can be called 
	from any route which terminates a login session.  Invoking "logout()" will
	remove the "req.user" property and clear the login session.
*/
app.get('/api/logout', function(req, res, next) {
	req.logout();
	res.sendStatus(200);
});

/*
	Custom middleware.
	If user is authenticated, this will create a new cookie that will be
	consumed by our AngularJS authentication service to read user information
*/
app.use(function(req, res, next) {
	if(req.user) {
		res.cookie('user', JSON.stringify(req.user));
	}
	next();
});







/*
	Two routes for subscribing and unsubscribing to/from a show.
*/
// using "ensureAuthenticated" middleware here to prevent unauthenticated users from accessing
// these route handlers
app.post('/api/subscribe', ensureAuthenticated, function(req, res, next) {
	Show.findById(req.body.showId, function(err, show) {
		
		if(err)
			return next(err);

		//Using req.user.id of a currently signed-in user
		show.subscribers.push(req.user.id);
		show.save(function(err) {
			if(err)
				return next(err);
			res.sendStatus(200);
		});
	});
});

app.post('/api/unsubscribe', ensureAuthenticated, function(req, res, next) {
	Show.findById(req.body.showId, function(err, show) {
	
		if(err)
			return next(err);

		var index = show.subscribers.indexOf(req.user.id);
		show.subscribers.splice(index, 1);
		show.save(function(err) {
			if(err)
				return next(err);
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