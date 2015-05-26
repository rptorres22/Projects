var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'moonrise_crystals_sample',
    dateStrings: 'date'
});

module.exports = pool;