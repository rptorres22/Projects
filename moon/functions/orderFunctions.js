var express = require('express');
var pool = require('../config/connection.js');

module.exports.GetAllOrders = function (callback) {
    pool.query('select *, (SELECT SUM(order_details.quantity * order_details.price) FROM order_details where order_details.order_id = orders.order_id GROUP BY order_details.order_id) as Total FROM orders INNER JOIN customers on customers.customer_id = orders.customer_id INNER JOIN platforms on orders.platform_id = platforms.platform_id ORDER BY orders.date DESC', function (err, result) {
        if (err)
            console.log(err);
        else
            callback(result)
}); };

module.exports.GetOrder = function (order_id, callback) {
    pool.query('select *, platforms.name as platform_name, orders.notes as order_notes, products.name as product_name FROM order_details INNER JOIN orders on order_details.order_id = orders.order_id INNER JOIN products on order_details.product_id = products.product_id INNER JOIN customers on orders.customer_id = customers.customer_id INNER JOIN platforms on platforms.platform_ID = orders.platform_id where order_details.order_id = ' + order_id, function (err, result) {
        if (err)
            console.log(err);
        else
            callback(result);
}); };

function InsertOrderItem (OrderID, callback) {
    pool.query('INSERT INTO order_details SET ?', { order_id: OrderID, product_id: 1, quantity: 1, price: 0, feedback_message: 0 }, function (err, item) {
        if (err)
            console.log(err);
        else
            callback(item.insertId);
}); };

module.exports.InsertOrderItem = function (OrderID, callback) {
    pool.query('INSERT INTO order_details SET ?', { order_id: OrderID, product_id: 1, quantity: 1, price: 0, feedback_message: 0 }, function (err, result) {
        if (err)
            console.log(err);
        else
            callback(result.insertId);
}); };

module.exports.InsertOrder = function (order, callback) {
    pool.query('INSERT INTO orders SET ?', order, function (err, result) {
        if (err)
            console.log(err);
        else
            InsertOrderItem(result.insertId, function() {
                callback(result.insertId);
}); }); };

module.exports.UpdateOrder = function (order, callback) {
    pool.query('UPDATE orders SET ? where order_id =' + order.order_id, order, function (err) {
        if (err)
            console.log(err);
        else
            callback(order.order_id);
}); };

module.exports.GetOrderItem = function (OrderItemId, callback) {
    pool.query('SELECT * FROM order_details INNER JOIN products ON products.product_id = order_details.product_id WHERE order_details_id =' + OrderItemId, function (err,result) {
        if (err)
            console.log(err);
        else
            callback(result);
}); };

module.exports.UpdateOrderItem = function(OrderItem, callback) {
    pool.query('UPDATE order_details SET order_id = ?, product_id = ?, quantity = ?, price = ?, feedback_message = ? where order_details_id = ?', [OrderItem.order_id, OrderItem.product_id, OrderItem.quantity, OrderItem.product_price, OrderItem.feedback_message, OrderItem.order_details_id], function (err, result) {
        if (err)
            console.log(err);
        else
            callback(OrderItem.order_id);
}); };

