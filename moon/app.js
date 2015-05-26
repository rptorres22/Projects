var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var mysql = require('mysql');
var router = express.Router();
var logger = require('morgan');

// Configure app
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));
app.use('', router);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

// Routing
var Home = require('./routes/index');
var Customers = require('./routes/customers');
var Orders = require('./routes/orders');
var Products = require('./routes/products');
var Feedbacks = require('./routes/feedbacks');

app.use('/', Home);
app.use('/Customers', Customers);
app.use('/Orders', Orders);
app.use('/Products', Products);
app.use('/Feedbacks', Feedbacks)

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
}); }); }

// Port & Successful Start Message
app.listen(1337, function () {
	console.log('Everything went smooth.');
	console.log("To use the tool visit http://localhost:1337 ")
});