// app/models/article.server.model.js

// Invoke 'strict' JavaScript mode
'use strict';

/*
	This will represent the article entity
*/

// Load the module dependencies
var mongoose 	= require('mongoose'),
	Schema 		= mongoose.Schema;


// Define a new 'ArticleSchema'
var ArticleSchema = new Schema({

	created: {
		type: Date,
		default: Date.now
	},


	title: {
		type: String,
		default: '',
		trim: true,
		required: 'Title cannot be blank'
	},

	
	content: {
		type: String,
		default: '',
		trim: true
	},


	creator: {
		type: Schema.ObjectId,
		ref: 'User'
	}

});

// needed to add this to fix a bug when trying to return a list of articles
// it was not populating the fullName virtual field of the 'User' object in this schema's 'creator'
ArticleSchema.set('toJSON', { getters: true, virtuals: true });


// Create the 'Article' model out of the 'ArticleSchema'
mongoose.model('Article', ArticleSchema);