var express = require('express');
var router = express.Router();
const db = require('../models');
var ProductService = require('../services/ProductService');
var productService = new ProductService(db);
var CartService = require('../services/CartService');
const isAuth = require('../middleware/middleware');
var cartService = new CartService(db);

/* GET home page. */
router.get('/', async function(req, res, next) {
  let products = await productService.get();
  res.status(200).json({result: "Success", products: products});
  res.render('products', { title: 'Express', products: products });
});

router.post('/', isAuth, async function(req, res, next) {
  const Name = req.body.Name
  const userId = req.user.id;
  console.log("THIS")
  // if (userId == null) {
  //   return res.status(400).json({status: "error", error: "Error getting the user ID"});
  // }

  // let cart = await cartService.create(Name, userId)
  res.status(200).json({result: "Success", cart: userId});
  res.render('cart', { title: 'Express', cart: userId });
});


module.exports = router;
