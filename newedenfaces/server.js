// React Routes (Server-Side)
// Babel ES6/JSX Compiler
require('babel-register');
var swig = require('swig');
var React = require('react');
var ReactDOM = require('react-dom/server');
var Router = require('react-router');
var routes = require('./app/routes');


var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');


var mongoose = require('mongoose');
var Character = require('./models/character');
var config = require('./config');

var async = require('async');		// use async.waterfall fo rmanaging multiple asynchronous operations
var request = require('request');	// for making HTTP requests to the EVE Online API
var xml2js = require('xml2js');

var app = express();


mongoose.connect(config.database);
mongoose.connection.on('error', function() {
	console.info('Error: Could not connect to MongoDB.  Di you forget to run `mongod`?');
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