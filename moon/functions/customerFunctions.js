var express = require('express');
var pool = require('../config/connection.js');

module.exports.GetAllCustomers = function (callback) {
    pool.query('SELECT * from customers ORDER BY customer_id DESC',
	function (err, result) {
        if (err)
            console.log(err);
        else
            callback(result);
    });
};

module.exports.InsertCustomer = function (customer, callback) {
    pool.query('INSERT INTO customers SET ?', customer, function (err, result) {
        if (err)
            console.log(err);
        else
            callback(result);
    });
};

module.exports.GetCustomer = function (customer_id, callback) {
    pool.query('SELECT * FROM customers WHERE customer_id=' + customer_id, function (err, result) {
        if (err)
            console.log(err);
        else
            callback(result)
    });
};

module.exports.GetOrders = function (customer_id, callback) {
    pool.query('select *, (SELECT SUM(order_details.quantity * order_details.price) FROM order_details where order_details.order_id = orders.order_id GROUP BY order_details.order_id) as Total FROM orders INNER JOIN customers on customers.customer_id = orders.customer_id INNER JOIN platforms on orders.platform_id = platforms.platform_id where customers.customer_id =' + customer_id + " ORDER BY order_id DESC" , function (err, orders) {
        if (err)
            console.log(err);
        else
            callback(orders)
    });
};

module.exports.UpdateCustomer = function (customer, callback) {
    pool.query('UPDATE customers SET first_name = ?, last_name = ?, email = ?, username = ?, phone_number = ?, address = ?, city = ?, state = ?, zip = ?, country = ?, notes = ? WHERE customer_id = ?',
      [customer.first_name, customer.last_name, customer.email, customer.username, customer.phone_number, customer.address, customer.city, customer.state, customer.zip, customer.Country, customer.notes, customer.customer_id] ,
        function (err) {
            if (err)
                console.log(err);
            else
                callback(customer.customer_id)
            });
};

// DONE