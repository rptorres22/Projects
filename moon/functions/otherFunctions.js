var express = require('express');
var pool = require('../config/connection.js');

module.exports.GetPlatforms = function (callback) {
    pool.query('SELECT *, name as label from platforms', function (err, result) {
        if (err)
            console.log(err);
        else
        	callback(JSON.stringify(result));
}); };

module.exports.GetFeedbacks = function (callback) {
	pool.query('SELECT *, products.name as product_name, platforms.name as platform_name FROM order_details INNER JOIN products on order_details.product_id = products.product_id INNER JOIN orders ON order_details.order_id = orders.order_id INNER JOIN platforms on platforms.platform_id = orders.platform_id INNER JOIN customers on orders.customer_id = customers.customer_id WHERE order_details.feedback_message !=\'0\' AND order_details.feedback_message IS NOT NULL ORDER BY product_name', function (err, result) {
		if (err)
			console.log(err);
		else
			callback(result);
}); };