// app/models/user.server.model.js

var mongoose 	= require('mongoose'),
	crypto 		= require('crypto'),
	Schema 		= mongoose.Schema;

var UserSchema = new Schema({

	firstName: String,

	lastName: String,

	email: {
		type: String,
		index: true,			// secondary index on email
		match: [/.+\@.+\..+/, "Please fill a valid e-mail address"]		// Predefined validator - make sure e-mail field value matches given regex expression
	},

	username: {				// mongoose predefined modifiers
		type: String,
		trim: true,
		unique: true,							// unique index to keep user names unique
		required: 'Username is required'		// Predefined validator - verify the existence of a username field before saving the user document
	},

	password: {
		type: String, 
		validate: [			//Custom validator - requires a function and error message
			function (password) {
				return password && password.length >= 6;
			},
			'Password should be longer'
		]
	},

	salt: {
		type: String
	},

	provider: {
		type: String,
		required: 'Provier is required'
	},

	providerId: String,

	providerData: {},

	created: {				// mongoose predefined modifiers
		type: Date,
		default: Date.now	// to default this field to a date
	}

	//website: {
	//	type: String,
	//	set: function (url) {	// Mongoose custom setter modifiers
	//		if (!url) {
	//
	//			return url;
	//
	//		} else {
	//
	//			if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
	//				url = 'http://' + url;
	//			}
	//
	//			return url;
	//		}
	//	}
	//},

	//role: {
	//	type: String,
	//	enum: ['Admin', 'Owner', 'User'] // Predefiend enum validator - define set of strings that are available for this field.  Will only allow these
	//}

});






// Virtual attribute to concatenate the user's first name and last name
UserSchema.virtual('fullName').get(function () {
	return this.firstName + ' ' + this.lastName;
}).set(function (fullName) {
	var splitName = fullName.split(' ');
	this.firstName = splitName[0] || '';
	this.lastName = splitName[1] || '';
});


// Pre middleware
//	Pre middleware gets executed before the operation happens.  This will get 
//		executed before the saving of the document.  This functionality makes
//		pre middleware perfect for complex validations and default values assignment
//UserSchema.pre('save', function (next) {
//	if (...) {
//		next()
//	} else {
//		next(new Error('An Error Occurred'));
//	}
//});
UserSchema.pre('save', function (next) {
	if (this.password) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});


// Custom instance methods (method that can execute on an instance of the model)
//	Methods that perform instance operations. To add an instance method, you will
//		declare it as a member of your schema's methods property
//	This will validate the user's password 
//	To use this: user.hashPassword('password), user.authenticate('password');
UserSchema.methods.hashPassword = function (password) {
	return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

UserSchema.methods.authenticate = function (password) {
	return this.password === this.hashPassword(password);
};



// Post middleware
//	Post middleware gets executed after the operation happens.  This will get
//		executed after saving the document.  This functionality makes post middleware
//		perfect to log your application logic
//UserSchema.post('save', function (next) {
//	if (this.isNew) {
//		console.log('A new user was created.');
//	} else {
//		console.log('A user updated its details.');
//	}
//});


// Custom static methods
//	Search users by their username.  You could place this in the controller but it's right 
//		place is here since it's part of the model.
// 	To call this: User.findOneByUsername('username', function(err, user) {...});
//UserSchema.statics.findOneByUsername = function (username, callback) {
//	this.findOne({ username: new RegExp(username, 'i') }, callback);
//};
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {

	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function (err, user) {

		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			
			callback(null);
		}

	});
};


// Custom getter modifier
// These are used to modify existing data before outputting the documents to next layer.
// A getter modifer would sometimes be better to change already existing user documents 
//		by modifying their "website" field at query time instead of going over your MongoDB
//		collection and updating each document.
//UserSchema.set('toJSON', { getters: true, virtuals: true }) //adding virtual
//
//	.set(function (fullName) {
//		//this is a setter to break the fullName field into first and last names
//		var splitName = fullName.split(' ');
//		this.firstName = splitName[0] || '';
//		this.lastName = splitName[1] || '';
//	});
UserSchema.set('toJSON', { getters: true, virtuals: true });



mongoose.model('User', UserSchema);