var express = require('express');

var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var mysql = require('mysql');



var pool = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'moonrise_crystals_database',
  dateStrings: 'date'
});




// configure app

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));

// middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

var router = express.Router();
app.use('', router);


function allUsers(callback) {
	pool.query('SELECT * from customers ORDER BY customer_id DESC', function(err, rows) {
		if (err)
			throw err;
		else
		callback(null, rows)
		});
}

function getUser(customer_id,callback) {
    pool.query('SELECT * FROM customers WHERE customer_id=' + customer_id, function(err, results) {
    	if (err)
    		throw err;
    	else
    		callback(null, results)
    });
}

function allOrders(callback) {
	pool.query('select *, (SELECT SUM(order_details.quantity * order_details.price) FROM order_details where order_details.order_id = orders.order_id GROUP BY order_details.order_id) as Total FROM orders INNER JOIN customers on customers.customer_id = orders.customer_id INNER JOIN platforms on orders.platform_id = platforms.platform_id ORDER BY orders.date DESC', function (err, rows) {
		if (err)
			throw err;
		callback(null, rows)
	});
}

function getOrder(order_id, callback) {
	pool.query('select *, platforms.name as platform_name, orders.notes as order_notes, products.name as product_name FROM order_details INNER JOIN orders on order_details.order_id = orders.order_id INNER JOIN products on order_details.product_id = products.product_id INNER JOIN customers on orders.customer_id = customers.customer_id INNER JOIN platforms on platforms.platform_ID = orders.platform_id where order_details.order_id = ' + order_id, function (err, results) {
		if (err)
			throw err;
		callback(null, results);
	});
}

function listOrders(customer_id, callback) {
	pool.query('select *, (SELECT SUM(order_details.quantity * order_details.price) FROM order_details where order_details.order_id = orders.order_id GROUP BY order_details.order_id) as Total FROM orders INNER JOIN customers on customers.customer_id = orders.customer_id INNER JOIN platforms on orders.platform_id = platforms.platform_id where customers.customer_id =' + customer_id + " ORDER BY order_id DESC" , function (err, orders) {
		if (err)
			throw err;
		else
			callback(null, orders)
	});


}

//// Index
router.get('/', function (req, res) {
	res.render('index', {
		title: 'Dashboard - Moonrise Crystals',	
	}); });

//
//
//  -- CUSTOMERS --
//
//

router.get('/customers', function (req, res) {
	allUsers(function (req, allCustomers) {
		res.render('allCustomers', {
		title: 'List of Customers',
		customers: allCustomers
		}); }); });

router.get('/customers/new',function (req, res) {
	res.render('addCustomer',
	{
		title: 'Add new Customer'
	}); });

router.get('/customers/:id/', function (req,res) {
    getUser(req.params.id, function (req1, results) {
    if (results.length == 0) {
    	res.send('Customer does not exist <br> <a href=/Customers>Go back</a>');
    }

    else{
    	listOrders(req.params.id, function(req, orders) {
    	res.render('viewCustomer', {
        title: 'View Customer',
        customer: results,
        orders: orders
   	 	});	}); } }); });

router.get('/Customers/Edit/:id', function (req,res) {
	getUser(req.params.id, function (req, results) {
    if (results.length == 0) {
    	res.send('Customer does not exist <br> <a href=/Customers>Go back</a>');
    }
    else {
    	res.render('editCustomer', {
        title: 'View Customer',
        customer: results });
		} }); });

router.post('/Customers/Edit/:id', function (req, res) {
	var Customer = req.body;
	pool.query('UPDATE customers SET first_name = ?, last_name = ?, email = ?, username = ?, phone_number = ?, address = ?, city = ?, state = ?, zip = ?, country = ?, notes = ? WHERE customer_id = ?', [Customer.first_name,Customer.last_name,Customer.email,Customer.username,Customer.phone_number,Customer.address,Customer.city,Customer.state, Customer.zip, Customer.Country,Customer.notes, req.params.id] , function(err) {
	if (err)
		console.log(err);

	res.redirect('/Customers/' + req.params.id);
	}); });



router.post('/customers/new' , function (req, res) {
	pool.query('INSERT INTO customers SET ?', req.body, function (err,result) {
		if (err)
			console.log(err);
		res.redirect('/Customers/' + result.insertId);
	});
	
});

//
//
// -- ORDERS --
//
//

router.get('/Orders/', function (req, res) {
	allOrders(function (req, allOrders) {
		res.render('Orders', {
			title: 'List of Orders',
			orders: allOrders });
}); });


router.get('/Orders/New/:id', function (req, res) {
	pool.query('SELECT *, name as label from platforms', function (err, result) {
		if (err)
			console.log(err);
		res.render('addOrder', {
		title: 'New Order',
		customerID : req.params.id,
		platforms: JSON.stringify(result)
		});
	});
	
});
router.post('/Orders/New', function (req, res) {
	pool.query('INSERT INTO orders SET ?', req.body, function (err, result) {
		if (err)
			console.log(err);
		pool.query('INSERT INTO order_details SET ?', {order_id: result.insertId, product_id: 1, quantity: 1, price: 0, feedback_message:0}, function (err, results) {
			if (err)
				console.log(err);
			res.redirect('/Orders/Item/' + results.insertId);
		});
		
	})
});

router.get('/Orders/:id', function (req,res) {
	getOrder(req.params.id, function (req, results) {
			res.render('viewOrder',
			{
				title: 'View Order',
				order: results,
			});
});
});


router.get('/Orders/Edit/:id', function (req, res) {
	pool.query('SELECT * from orders where order_id =' + req.params.id, function (err, result) {
		if (err)
			console.log(err);
		res.render('editOrder', {
			title: 'Edit order',
			order: result
		})
	});
});

router.post('/Orders/Edit', function (req, res) {
	pool.query('UPDATE orders SET ? where order_id =' + req.body.order_id, req.body, function (err) {
		res.redirect('/Orders/' + req.body.order_id);
	});
});

router.post('/Orders/Item/New/:id', function (req, res) {
	pool.query('INSERT INTO order_details SET ?', {order_id: req.params.id, product_id: 1, quantity: 1, price: 0, feedback_message: 0}, function (err, result2) {
		if (err)
			console.log(err);
		res.redirect('/Orders/Item/' + result2.insertId);
		});
		
	
});

router.get('/Orders/Item/:id', function (req, res) {
	pool.query('SELECT * FROM order_details INNER JOIN products ON products.product_id = order_details.product_id WHERE order_details_id =' + req.params.id, function (req1, results) {
		pool.query('SELECT *, products.name as label FROM products', function (err, result) {
			res.render('editItem', {
			title:'View Item',
			data: JSON.stringify(result),
			item: results
		});
		});
		
	});
});


router.post('/Orders/Item', function (req, res){
	pool.query('UPDATE order_details SET order_id = ?, product_id = ?, quantity = ?, price = ?, feedback_message = ? where order_details_id = ?', [req.body.order_id, req.body.product_id, req.body.quantity, req.body.product_price, req.body.feedback_message, req.body.order_details_id], function (err) {
		if (err)
			console.log(err);
		res.redirect('/Orders/' + req.body.order_id);
	})
});

//
//
// -- ITEMS --
//
//
//

router.get('/Items', function (req, res) {
	pool.query('SELECT * from products ORDER BY name', function (err, results){
		if (err)
			console.log(err);
		res.render('allItems', {
			title: 'List of all Items',
			items: results
		})
	});
});

router.get('/Items/Edit/:id', function (req, res) {
	pool.query('SELECT * FROM products WHERE product_id =' + req.params.id , function (err, results) {
		if (err)
			console.log(err);
		res.render('editProduct', {
			title: 'Edit item',
			item: results});
	});
});

router.post('/Items/Edit', function (req,res) {
	pool.query('UPDATE products SET name = ?, status = ?, default_price = ? where product_id =' + req.body.product_id, [req.body.name, req.body.status, req.body.price], function (err) {
		if (err)
			console.log(err);
		res.redirect('/Items');
	})
});


//
//
// -- FEEDBACK --
//
//

router.get('/Feedbacks', function (req, res) {
	pool.query('SELECT *, products.name as product_name, platforms.name as platform_name FROM order_details INNER JOIN products on order_details.product_id = products.product_id INNER JOIN orders ON order_details.order_id = orders.order_id INNER JOIN platforms on platforms.platform_id = orders.platform_id INNER JOIN customers on orders.customer_id = customers.customer_id WHERE order_details.feedback_message !=\'0\' AND order_details.feedback_message IS NOT NULL ORDER BY product_name', function (err, results) {
		if (err)
			console.log(err);
		res.render('allFeedbacks', {
			title: "All Feedbacks",
			feedbacks: results
		});
	});
});

router.get('/Stats', function (req, res) {
	res.render('Stats', {
		title:"Moonrise Crystals Stats home"
	});
	
});

router.get('/Stats/DailyIncome/:year/:month', function (req, res) {
	pool.query('select orders.order_id, platforms.name, orders.date, orders.platform_id, sum((SELECT SUM(order_details.quantity * order_details.price) FROM order_details where order_details.order_id = orders.order_id GROUP BY order_details.order_id)) as DailyTotal FROM orders INNER JOIN platforms on orders.platform_id = platforms.platform_id where year(orders.date)= ' + req.params.year + ' AND month(orders.date) = ' + req.params.month + ' GROUP BY orders.date, orders.platform_id', function (err, results) {
		if (err)
			console.log(err);
		res.render('DailyIncome', {
			title:'MRC Daily Stats',
			numbers:results});
	});
});

app.listen(1337, function () {
	console.log('The server is ready and listening on port 1337 at localhost.');
});