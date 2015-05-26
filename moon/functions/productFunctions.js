var express = require('express');
var pool = require('../config/connection.js');

module.exports.GetAllProducts = function (callback) {
	pool.query('SELECT *, products.name as label FROM products ORDER BY name', function (err, result) {
		if (err)
			console.log(err);
		else
			callback(result);
}); };

module.exports.GetProduct = function (productId, callback) {
    pool.query('SELECT * FROM products WHERE product_id = ' + productId , function (err, result) {
        if (err)
            console.log(err);
        else
            callback(result);
}); };

module.exports.UpdateProduct = function (product, callback) {
    pool.query('UPDATE products SET name = ?, status = ?, default_price = ? where product_id =' + product.product_id, [product.name, product.status, product.price], function (err) {
        if (err)
            console.log(err);
        else
            callback(null);
}); };