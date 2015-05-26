var express = require('express');
var router = express.Router();

var pool = require('../config/connection.js');

var productFunctions = require('../functions/productFunctions.js');

// All Products
router.get('/', function (req, res) {
	productFunctions.GetAllProducts(function (result) {
		res.render('allProducts', {
			title: 'All Products',
			products: result
}); }); });

// View Product
router.get('/Edit/:id', function (req, res) {
	productFunctions.GetProduct(req.params.id, function (result) {
		res.render('editProduct', {
			title: 'Edit Product',
			product: result
}); }); });

// --- POST
router.post('/Edit', function (req,res) {
	productFunctions.UpdateProduct(req.body, function (result) {
		res.redirect('/Products');
}); });

module.exports = router;