var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
const { isAuth, isAdmin } = require('../middleware/middleware');
var axios = require("axios");

const url = "http://localhost:3000/products";

/* GET home page. */
router.get('/products', async function(req, res, next) {
  const response = await axios.get(url);
  products = response.data;
  console.log(products.products)
  res.render('products2', { title: 'Express', products: products.products});
});

module.exports = router;
