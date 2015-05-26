var express = require('express');
var router = express.Router();

var pool = require('../config/connection.js');

var otherFunctions = require('../functions/otherFunctions.js');

// All Feedbacks
router.get('/', function (req, res) {
	otherFunctions.GetFeedbacks(function (result) {
		res.render('allFeedbacks', {
			title: "All Feedbacks",
			feedbacks: result		
}); }); });

module.exports = router;