var express = require('express');
var router = express.Router();
const db = require('../models');
const isAuth = require('../middleware/middleware');
var CartService = require('../services/CartService');
var cartService = new CartService(db);
var ProductsInCartService = require('../services/ProductsInCartService');
var productsInCartService = new ProductsInCartService(db);
var ProductService = require('../services/ProductService');
var productService = new ProductService(db);
var OrderService = require('../services/OrderService');
var orderService = new OrderService(db);
var ProductsInOrderService = require('../services/ProductsInOrderService');
var productsInOrderService = new ProductsInOrderService(db);
var StatusService = require('../services/StatusService');
const { or } = require('sequelize');
var statusService = new StatusService(db);


// GET the users cart
router.get('/', isAuth, async function (req, res, next) {
  let totalPrice = 0
  try {

    let { cartName } = req.body
    if (!cartName) {
      cartName = "";
    }
    const userId = req.user.id;
    if (userId == null) {
      res.status(400).json({ status: "error", error: "Error getting the user ID" });
      return res.end();
    }
    let cart = await cartService.getOne(cartName, userId);
    console.log(cart)
    if (cart == null) {
      res.status(400).json({ result: "Fail", message: "Cart does not exist" });
      return res.end();
    }

    let PIC = await productsInCartService.getAll(cart.Id)
    console.log(PIC)
    if (!PIC) {
      res.status(400).json({ result: "Fail", message: "Cart does not exist" });
      return res.end();
    }

    for (const obj of PIC) {
      let Price = obj.UnitPrice;
      let Quantity = obj.Quantity;
      totalPrice = totalPrice + (Price * Quantity);
    }

    res.status(200).json({ result: "Success", cart: cart, ProductsInCart: PIC, TotalPrice: totalPrice });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// POST to add product to user cart
router.post('/add/cart', isAuth, async function (req, res, next) {
  const { cartName, productId, quantity } = req.body
  const userId = req.user.id;
  if (userId == null) {
    return res.status(400).json({ status: "error", error: "Error getting the user ID" });
  }
  if (quantity == null) {
    return res.status(400).json({ status: "error", error: "quantity must be provided" });
  }
  if (isNaN(quantity)) {
    return res.status(400).json({ status: "error", error: "quantity must be a number" });
  }
  if (productId == null) {
    return res.status(400).json({ status: "error", error: "productId must be provided" });
  }
  if (isNaN(productId)) {
    return res.status(400).json({ status: "error", error: "productId must be a number" });
  }
  let cart = await cartService.getOne(cartName, userId);
  if (!cart) {
    cart = await cartService.create(cartName, userId)
  }
  let product = await productService.getOne(productId);
  console.log(product[0])
  if (!product[0]) {
    return res.status(400).json({ status: "error", error: "Product does not exist" });
  }
  let PIC = await productsInCartService.getOne(cart.Id, productId)
  if (!PIC) {
    await productsInCartService.create(cart.Id, productId, quantity, product[0].Name, product[0].Price)
    PIC = await productsInCartService.getAll(cart.Id)
    res.status(200).json({ result: "Success", cart: cart, ProductsInCart: PIC });
  }
  else {
    let newQuantity = PIC.Quantity + quantity;
    if (product[0].Quantity < quantity || product[0].Quantity < newQuantity) {
      res.status(400).json({ result: "Fail", message: "not enough in stock" });
    } else {
      await productsInCartService.update(cart.Id, newQuantity);
      PIC = await productsInCartService.getAll(cart.Id)
      res.status(200).json({ result: "Success", cart: cart, ProductsInCart: PIC });
    }

  }
});

// POST add cart to the order
router.post('/now', isAuth, async function (req, res, next) {
  let totalPrice = 0
  try {

    let { cartName } = req.body
    if (!cartName) {
      cartName = "";
    }
    const userId = req.user.id;
    if (userId == null) {
      res.status(400).json({ status: "error", error: "Error getting the user ID" });
      return res.end();
    }
    let cart = await cartService.getOne(cartName, userId);
    if (cart == null) {
      res.status(400).json({ result: "Fail", message: "Cart does not exist" });
      return res.end();
    }
    if (cart.Active == 0) {
      res.status(400).json({ result: "Fail", message: "Cart is deactivated. Most likely due to it already been ordered" });
      return res.end();
    }

    let PIC = await productsInCartService.getAll(cart.Id)
    if (!PIC) {
      res.status(400).json({ result: "Fail", message: "Cart does not exist" });
      return res.end();
    }

    let status = await statusService.getOne("Ordered")

    await orderService.create(cartName, userId, status.Id);
    let order = await orderService.getOne(cartName, userId);

    for (const obj of PIC) {
      let Price = obj.UnitPrice;
      let Quantity = obj.Quantity;
      let ProductName = obj.ProductName;
      let OrderId = order.Id;
      let ProductId = obj.ProductId;
      await productsInOrderService.create(OrderId, ProductId, Quantity, ProductName, Price)
    }
    
    let PIO = await productsInOrderService.getAll(order.Id)
    console.log(PIO)
    console.log("before");
    for (const obj of PIO) {
      let product = await productService.getOne(obj.ProductId);
      console.log(product)
      let newQuantity = product[0].Quantity - obj.Quantity;
      console.log(newQuantity)
      if (newQuantity < 0) {
        res.status(400).json({ result: "Fail", message: "not enough product in stock", Product: product[0].Name });
        return res.end();
      }
      await productService.updateQuantity(obj.ProductId, newQuantity);
    }
    console.log("after");
  

    for (const obj of PIO) {
      let Price = obj.UnitPrice;
      let Quantity = obj.Quantity;
      totalPrice = totalPrice + (Price * Quantity);
    }
    PIO = await productsInOrderService.getAll(order.Id)
    await cartService.ordered(cart.Id)

    res.status(200).json({ result: "Success", Order: order, ProductsInOrder: PIO, TotalPrice: totalPrice });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});


// DELETE to remove product from user cart
router.delete('/del/cart', isAuth, async function (req, res, next) {
  const { cartName, productId, quantity } = req.body
  const userId = req.user.id;
  if (userId == null) {
    return res.status(400).json({ status: "error", error: "Error getting the user ID" });
  }
  let cart = await cartService.getOne(cartName, userId);
  if (!cart) {
    cart = await cartService.create(cartName, userId)
  }
  let PIC = await productsInCartService.getOne(cart.Id, productId)
  if (!PIC) {
    res.status(400).json({ result: "Fail", message: "That product is not in this cart" });
    res.end();
  } else {
    let newQuantity = PIC.Quantity - quantity;
    if (newQuantity == 0) {
      await productsInCartService.remove(PIC.Id)
      res.status(200).json({ result: "Success", message: "Product removed from cart" });
    } else {
      await productsInCartService.update(cart.Id, newQuantity);
      PIC = await productsInCartService.getAll(cart.Id)
      res.status(200).json({ result: "Success", cart: cart, ProductsInCart: PIC });
    }
  }
});



module.exports = router;
