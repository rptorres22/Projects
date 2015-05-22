// app/routes/index.server.routes.js

module.exports = function (app) {
	var index = require('../controllers/index.server.controller');
	app.get('/', index.render);

};