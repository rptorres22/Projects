/*
Note
Understand that we are including all routes in server.js because it is convenient to do so 
for the purposes of this tutorial. In the dashboard project that I had to build at work, 
all routes were split into separate files inside the routes directory, furthermore all 
route handlers were split into separate files inside the controllers directory.
*/

// React Routes (Server-Side)
// Babel ES6/JSX Compiler
require('babel-register');
var swig = require('swig');
var React = require('react');
var ReactDOM = require('react-dom/server');
var Router = require('react-router');
var routes = require('./app/routes');
var _ = require('underscore');

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');


var mongoose = require('mongoose');
var Character = require('./models/character');
var config = require('./config');

var async = require('async');		// use async.waterfall for managing multiple asynchronous operations
var request = require('request');	// for making HTTP requests to the EVE Online API
var xml2js = require('xml2js');

var app = express();


mongoose.connect(config.database);
mongoose.connection.on('error', function() {
	console.info('Error: Could not connect to MongoDB.  Did you forget to run `mongod`?');
})


// Express middleware
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


/**
 * POST /api/characters
 * Adds new character to the database.

 1. Get Character ID from Character Name. (from https://api.eveonline.com/eve/CharacterID.xml.aspx?names=Nova+Kierra)
 <eveapi version="2">
 	<currentTime>2016-04-21 03:41:34</currentTime>
 	<result>
 		<rowset name="characters" key="characterID" columns="name,characterID">
 			<row name="Nova Kierra" characterID="1827765916"/>
 		</rowset>
	</result>
	<cachedUntil>2016-05-21 03:41:34</cachedUntil>
 </eveapi>

 2. Parse XML response
 3. Query the database to check if this character is already in the database.
 4. Pass Character ID to the next function in the async.watefall stage.
 5. Get basic character information from a Character ID. 
 	(from https://api.eveonline.com/eve/CharacterInfo.xml.aspx?characterID=1827765916)
 	<eveapi version="2">
		<currentTime>2016-04-21 03:45:54</currentTime>
		<result>
			<characterID>1827765916</characterID>
			<characterName>Nova Kierra</characterName>
			<race>Gallente</race>
			<bloodlineID>8</bloodlineID>
			<bloodline>Intaki</bloodline>
			<ancestryID>17</ancestryID>
			<ancestry>Diplomats</ancestry>
			<corporationID>1000180</corporationID>
			<corporation>State Protectorate</corporation>
			<corporationDate>2012-05-25 02:05:00</corporationDate>
			<securityStatus>4.20264641901144</securityStatus>
			<rowset name="employmentHistory" key="recordID" columns="recordID,corporationID,corporationName,startDate">
				<row recordID="19817776" corporationID="1000180" corporationName="State Protectorate" startDate="2012-05-25 02:05:00"/>
				<row recordID="19817773" corporationID="1000111" corporationName="Aliastra" startDate="2012-05-25 02:05:00"/>
				<row recordID="19211287" corporationID="98101659" corporationName="Jita Trading Commission" startDate="2012-03-16 08:49:00"/>
				<row recordID="19211219" corporationID="1000111" corporationName="Aliastra" startDate="2012-03-16 08:33:00"/>
				<row recordID="18536198" corporationID="1082366114" corporationName="Nasranite Watch" startDate="2011-12-19 14:52:00"/>
				<row recordID="18534765" corporationID="1000180" corporationName="State Protectorate" startDate="2011-12-19 08:13:00"/>
				<row recordID="18534761" corporationID="1000111" corporationName="Aliastra" startDate="2011-12-19 08:13:00"/>
				<row recordID="18466222" corporationID="98040970" corporationName="Hole Plunderer's" startDate="2011-12-10 16:17:00"/>
				<row recordID="14603262" corporationID="1000180" corporationName="State Protectorate" startDate="2010-08-17 21:14:00"/>
				<row recordID="14586690" corporationID="1000169" corporationName="Center for Advanced Studies" startDate="2010-08-15 18:19:00"/>
			</rowset>
		</result>			
		<cachedUntil>2016-04-21 04:42:54</cachedUntil>
	</eveapi>
 6. Parse XML response
 7. Add a new character to the database
 */
app.post('/api/characters', function(req, res, next) {
	var gender = req.body.gender;
	var characterName = req.body.name;
	var characterIdLookupurl = 'https://api.eveonline.com/eve/CharacterID.xml.aspx?names=' + characterName;

	var parser = new xml2js.Parser();

	async.waterfall([
		function(callback) {
			request.get(characterIdLookupurl, function(err, request, xml) {
				if (err)
					return next(err);

				parser.parseString(xml, function(err, parsedXml) {
					if (err)
						return next(err);

					try {
						var characterId = parsedXml.eveapi.result[0].rowset[0].row[0].$.characterID;

						Character.findOne({ characterId: characterId }, function(err, character) {
							if (err)
								return next(err);

							if (character) {
								return res.status(409).send({ message: character.name + ' is already in the database.' });
							}

							callback(err, characterId);
						});
					} catch (e) {
						return res.status(400).send({ message: 'XML Parse Error' });
					}
				});
			});
		},

		function(characterId) {
			var characterInfoUrl = 'https://api.eveonline.com/eve/CharacterInfo.xml.aspx?characterID=' + characterId;

			request.get({ url: characterInfoUrl }, function(err, request, xml) {
				if (err)
					return next(err);

				parser.parseString(xml, function(err, parsedXml) {
					if (err)
						return res.send(err);

					try {
						var name = parsedXml.eveapi.result[0].characterName[0];
						var race = parsedXml.eveapi.result[0].race[0];
						var bloodline = parsedXml.eveapi.result[0].bloodline[0];

						var character = new Character({
							characterId: characterId,
							name: name,
							race: race,
							bloodline: bloodline,
							gender: gender,
							random: [Math.random(), 0]
						});

						character.save(function(err) {
							if (err)
								return next(err);

							res.send({ message: characterName + ' has been added successfully!' });
						});
					} catch (e) {
						res.status(404).send({ message: characterName + ' is not a registered citizen of New Eden. '});
					}
				});
			});
		}
	]);
});



/**
 * GET /api/characters
 * Returns 2 random characters of the same gender that have not been voted yet.

	I have tried to make this code as readable as possible, so it should be 
	fairly easy to understand how it fetches two random characters. It will 
	randomly select Male or Female gender and query the database for two 
	characters. If we get back less than 2 characters, it will attempt another 
	query with the opposite gender. For example, if we have 10 male characters 
	and 9 of them have already been voted, displaying 1 character makes no sense. 
	If don’t get back 2 characters for either Male or Female gender, that means 
	we have exhausted all unvoted characters and the vote count should be reset 
	by setting voted: false for all characters.
 */
 app.get('/api/characters', function(req, res, next) {
 	var choices = ['Female', 'Male'];
 	var randomGender = _.sample(choices);

 	Character.find({ random: { $near: [Math.random(), 0] } })
 		.where('voted', false)
 		.where('gender', randomGender)
 		.limit(2)
 		.exec(function(err, characters) {
 			if (err) 
 				return next(err);

 			if (characters.length === 2) {
 				return res.send(characters);
 			}

 			Character.update({}, { $set: { voted: false } }, { multi: true }, function(err) {
 				if (err) return next(err);
 				res.send([]);
 			});
 		});
 });



 /**
  * PUT /api/characters
  * Update winning and losing count for both characters.
  This route is related to the previous one since it updates wins and losses 
  fields of winning and losing characters respectively.

  Here we are using async.parallel to make two database queries simultaneously, 
  since one query does not depend on another. However, because we have two 
  separate MongoDB documents, that’s two independent asynchronous operations, 
  hence another async.parallel. Basically, we respond with a success only when 
  both characters have finished updating and there were no errors.
  */
app.put('/api/characters', function(req, res, next) {
	var winner = req.body.winner;
	var loser = req.body.loser;

	if (!winner || !loser) {
		return res.status(400).send({ message: 'Voting requires two characters.' });
	}

	if (winner === loser) {
		return res.status(400).send({ message: 'Cannot vote for and against the same character.' });
	}

	async.parallel([
		function(callback) {
			Character.findOne({ characterId: winner }, function(err, winner) {
				callback(err, winner);
			});
		},
		function(callback) {
			Character.findOne({ characterId: loser }, function(err, loser) {
				callback(err, loser);
			});
		}
	],
	function(err, results) {
		if (err)
			return next(err);

		var winner = results[0];
		var loser = results[1];

		if (!winner || !loser) {
			return res.status(400).send({ message: 'One of the characters no longer exists.' });
		}

		if (winner.voted || loser.voted) {
			return res.status(200).end();
		}

		async.parallel([
			function(callback) {
				winner.wins++;
				winner.voted = true;
				winner.random = [Math.random(), 0];
				winner.save(function(err) {
					callback(err);
				});
			},
			function(callback) {
				loser.losses++;
				loser.voted = true;
				loser.random = [Math.random(), 0];
				loser.save(function(err) {
					callback(err);
				});
			}
		], function(err) {
			if (err)
				return next(err);

			res.status(200).end();
		});
	});
});


/**
 * GET /api/characters/count
 * Returns the total number of characters.
 MongoDB has a built-in count() method for returning the number of results that
 match the query.
 */
app.get('/api/characters/count', function(req, res, next) {
	Character.count({}, function(err, count) {
		if (err)
			return next(err);

		res.send({ count: count });
	});
});


/**
 * GET /api/characters/search
 * Looks up a character by name. (case-insensitive)
  Last I checked MongoDB does not support case-insensitive queries, which explains 
  why we have to use a regex here. The next best thing you could do is to use the 
  $regex operator.
 */
app.get('/api/characters/search', function(req, res, next) {
 	var characterName = new RegExp(req.query.name, 'i');

 	Character.findOne({ name: characterName }, function(err, character) {
 		if (err)
 			return next(err);

 		if (!character) {
 			return res.status(400).send({ message: 'Character not found.' });
 		}

 		res.send(character);
 	});
});


/**
 * GET /api/characters/top
 * Return 100 highest ranked characters. Filter by gender, race and bloodline.

 For example, if we are interested in the Top 100 male characters with Caldari race 
 and Civire bloodline, this would be the URL path for it:
 GET /api/characters/top?race=caldari&bloodline=civire&gender=male

 After we retrieve characters with the highest number of wins, we are doing another 
 sort by winning percentage, so that we don’t end up with the oldest characters 
 always being on top.

 Note
Be careful with accepting user's input directly. Ideally we should have first checked 
for query params before blindly constructing the conditions object and passing it to 
MongoDB.
 */
 app.get('/api/characters/top', function(req, res, next) {
 	var params = req.query;
 	var conditions = {};

 	_.each(params, function(value, key) {
 		conditions[key] = new RegExp('^' + value + '$', 'i');
 	});

 	Character
 		.find(conditions)
 		.sort('-wins') // Sort in descending order (highest wins on top)
 		.limit(100)
 		.exec(function(err, characters) {
 			if (err)
 				return next(err)

 			// Sort by winning percentage
 			characters.sort(function(a, b) {
 				if (a.wins / (a.wins + a.losses) < b.wins / (b.wins + b.losses)) { return 1; }
 				if (a.wins / (a.wins + a.losses) > b.wins / (b.wins + b.losses)) { return -1 }
 			});

 			res.send(characters);
 		});
 });


/**
 * GET /api/characters/shame
 * Returns 100 lowest ranked characters.

 Similar to the previous route, this one retrieves 100 characters with the most losses.
 */
app.get('/api/characters/shame', function(req, res, next) {
	Character
		.find()
		.sort('-losses')
		.limit(100)
		.exec(function(err, characters) {
			if (err)
				return next(err);

			res.send(characters);
		});
});


/**
 * GET /api/characters/:id
 * Returns detailed character information.

 I have left this Express route for last, so that other routes starting with 
 /api/characters/, do not get clobbered by the this route with the :id parameter.
 This route is used by the profile page (Character component that we will build next) 
 as shown at the beginning of the tutorial.
 */
app.get('/api/characters/:id', function(req, res, next) {
	var id = req.params.id;

	Character.findOne({ characterId: id }, function(err, character) {
		if (err)
			return next(err);

		if (!character) {
			return res.status(400).send({ message: 'Character not found.' });
		}

		res.send(character);
	});
});


/**
 * POST /api/report
 * Reports a character. Character is removed after 4 reports.

 Some characters do not have a valid avatar (gray silhouette) while other avatars are 
 nearly pitch-black and shouldn’t be added to the database in the first place. But 
 since anyone can add everyone, sometimes you end up with those characters that need 
 be removed. A character that has been reported by visitors at least 4 times will be 
 removed from the database.
 */

app.post('/api/report', function(req, res, next) {
	var characterId = req.body.characterId;

  	Character.findOne({ characterId: characterId }, function(err, character) {
    	if (err) 
    		return next(err);

    	if (!character) {
      		return res.status(404).send({ message: 'Character not found.' });
    	}

    	character.reports++;

    	if (character.reports > 4) {
      		character.remove();
      	return res.send({ message: character.name + ' has been deleted.' });
    	}

    	character.save(function(err) {
      		if (err) 
      			return next(err);

      		res.send({ message: character.name + ' has been reported.' });
    	});
  	});
 });


/**
 * GET /api/stats
 * Returns characters statistics.

 And last but not least, a route for character stats. Yes, it could be simplified 
 with async.each or promises, but keep in mind when I first built New Eden Faces I 
 was not familiar with either solutions. Most of the back-end code is unchanged 
 since then. Although the code is verbose, at least it is explicit and very 
 readable.

 The last operation with the aggregate() method is a bit more tricky. Admittedly, I had to get help with that part. In MongoDB, aggregations operations process data records and return computed results. In our case it computes the total number of casted votes by summing up all wins counts. Because this is a zero-sum game, the number of wins should be exactly the same as the number of losses, so we could have used losses counts here as well.
 */
app.get('/api/stats', function(req, res, next) {
	async.parallel([
      	function(callback) {
        	Character.count({}, function(err, count) {
          		callback(err, count);
        	});
      	},
      	function(callback) {
        	Character.count({ race: 'Amarr' }, function(err, amarrCount) {
          		callback(err, amarrCount);
        	});
      	},
      	function(callback) {
        	Character.count({ race: 'Caldari' }, function(err, caldariCount) {
          		callback(err, caldariCount);
        	});
      	},
      	function(callback) {
        	Character.count({ race: 'Gallente' }, function(err, gallenteCount) {
          		callback(err, gallenteCount);
        	});
      	},
      	function(callback) {
        	Character.count({ race: 'Minmatar' }, function(err, minmatarCount) {
          		callback(err, minmatarCount);
        	});
      	},
      	function(callback) {
        	Character.count({ gender: 'Male' }, function(err, maleCount) {
          		callback(err, maleCount);
        	});
      	},
      	function(callback) {
        	Character.count({ gender: 'Female' }, function(err, femaleCount) {
          		callback(err, femaleCount);
        	});
      	},
      	function(callback) {
        	Character.aggregate({ $group: { _id: null, total: { $sum: '$wins' } } }, function(err, totalVotes) {
            		var total = totalVotes.length ? totalVotes[0].total : 0;
            		callback(err, total);
          		}
        	);
 		},
      	function(callback) {
        	Character
          		.find()
          		.sort('-wins')
          		.limit(100)
          		.select('race')
          		.exec(function(err, characters) {
            		if (err) return next(err);

            		var raceCount = _.countBy(characters, function(character) { return character.race; });
            		var max = _.max(raceCount, function(race) { return race });
            		var inverted = _.invert(raceCount);
            		var topRace = inverted[max];
            		var topCount = raceCount[topRace];

            		callback(err, { race: topRace, count: topCount });
          		});
      	},
      	function(callback) {
        	Character
          		.find()
          		.sort('-wins')
          		.limit(100)
          		.select('bloodline')
          		.exec(function(err, characters) {
            		if (err) return next(err);

            		var bloodlineCount = _.countBy(characters, function(character) { return character.bloodline; });
            		var max = _.max(bloodlineCount, function(bloodline) { return bloodline });
            		var inverted = _.invert(bloodlineCount);
            		var topBloodline = inverted[max];
            		var topCount = bloodlineCount[topBloodline];

            		callback(err, { bloodline: topBloodline, count: topCount });
          	});
      	}
	],
	function(err, results) {
      	if (err) return next(err);

      	res.send({
        	totalCount: results[0],
        	amarrCount: results[1],
        	caldariCount: results[2],
        	gallenteCount: results[3],
        	minmatarCount: results[4],
        	maleCount: results[5],
        	femaleCount: results[6],
        	totalVotes: results[7],
        	leadingRace: results[8],
        	leadingBloodline: results[9]
      	});
    });
});



// middleware for rendering React on server side
app.use(function(req, res) {
	Router.match({ routes: routes.default, location: req.url }, function(err, redirectLocation, renderProps) {
 		if (err) {
      		res.status(500).send(err.message)
    	} else if (redirectLocation) {
      		res.status(302).redirect(redirectLocation.pathname + redirectLocation.search)
    	} else if (renderProps) {
      		var html = ReactDOM.renderToString(React.createElement(Router.RoutingContext, renderProps));
      		var page = swig.renderFile('views/index.html', { html: html });
      		res.status(200).send(page);
    	} else {
    		res.status(404).send('Page Not Found')
		}
	});
});




/**
 * Socket.io stuff.
 * In a nutshell, when a WebSocket connection is established, it increments the onlineUsers count 
 * (global variable) and broadcasts a message — “Hey, I have this many online visitors now.”. When 
 * someone closes the browser and leaves, the onlineUsers count is decremented and it yet again 
 * broadcasts a message “Hey, someone just left, I have this many online visitors now.”.
 */
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var onlineUsers = 0;

io.sockets.on('connection', function(socket) {
	onlineUsers++;
	
	io.sockets.emit('onlineUsers', { onlineUsers: onlineUsers });

	socket.on('disconnect', function() {
		onlineUsers--;
		io.sockets.emit('onlineUsers', { onlineUsers: onlineUsers });
	});
});


server.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});