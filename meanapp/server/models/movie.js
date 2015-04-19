var mongoose = require('mongoose');

// Create the MovieSchema
// define properties for this object and what they are
var MovieSchema = new mongoose.Schema({

	title: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	}
});

// Export the model schema.
module.exports = MovieSchema;