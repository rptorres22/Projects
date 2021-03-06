/*
A schema is just a representation of your data in MongoDB. This is where you can enforce a 
certain field to be of particular type. A field can also be required, unique or contain only 
specified characters.

While a schema is just an abstract representation of the data, a model on the other hand is a 
more practical object with methods to query, remove, update and save data from/to MongoDB. 
Above, we create a Character model and immediately export it.

random - an array of two numbers generated by [Math.random(), 0]. It is a geospatial point as 
far as MongoDB is concerned. In order to grab a random character from the database we are going 
to use the $near operator. I found about this “trick” from Random record from MongoDB on 
StackOverflow.

voted - a boolean for identifying which characters have already been voted. Previously, people 
were abusing the website by voting for the same character multiple times in a row. But now, when 
querying for two characters, only those characters that have not been voted will be fetched. Even 
if someone were to hit the API directly, a vote will not count for already voted characters.
*/

var mongoose = require('mongoose');

var characterSchema = new mongoose.Schema({
	characterId: { type: String,  unique: true, index: true },
	name: String,
	race: String,
	gender: String,
	bloodline: String,
	wins: { type: Number, default: 0 },
	losses: { type: Number, default: 0 },
	reports: { type: Number, default: 0 },
	random: { type: [Number], index: '2d' },
	voted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Character', characterSchema);


