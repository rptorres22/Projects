// app/controllers/index.server.controller.js

exports.render = function (req, res) {

	res.render('index', {
		title: 'Hello World',
		//userFullName: req.user ? req.user.fullName : ''
		user: JSON.stringify(req.user)
	});

};

