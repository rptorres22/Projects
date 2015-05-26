var express = require('express');
var router = express.Router();

var pool = require('../config/connection.js');

var customerFunctions = require('../functions/customerFunctions.js')

// Display all Customers
router.get('/', function (req, res) {
    customerFunctions.GetAllCustomers(function (allCustomers) {
        res.render('allCustomers', {
            title: 'List of Customers',
            customers: allCustomers }); }); });

// Add new Customer
router.get('/new', function (req, res) {
    res.render('addCustomer',
	{ title: 'Add new Customer' }); });

// --- POST
router.post('/new' , function (req, res) {
    customerFunctions.InsertCustomer(req.body, function (result) {
        res.redirect('/Customers/' + result.insertId); }); });

// View Customer
router.get('/:id/', function (req, res) {
    customerFunctions.GetCustomer(req.params.id, function (results) {
        if (results.length == 0) {
            res.send('Customer does not exist <br> <a href=/Customers>Go back</a>');}
        else {
            customerFunctions.GetOrders(req.params.id, function (orders) {
                res.render('viewCustomer', {
                    title: 'View Customer',
                    customer: results,
                    orders: orders }); }); } }); });

// Edit Customer
router.get('/Edit/:id', function (req, res) {
    customerFunctions.GetCustomer(req.params.id, function (results) {
        if (results.length == 0) {
            res.send('Customer does not exist <br> <a href=/Customers>Go back</a>'); }
        else {
            res.render('editCustomer', {
                title: 'View Customer',
                customer: results }); } }); });

// --- POST
router.post('/Edit/:id', function (req, res) {
    var Customer = req.body;
    customerFunctions.UpdateCustomer(Customer, function () { 
        res.redirect('/Customers/' + req.params.id);
    });
});

module.exports = router;