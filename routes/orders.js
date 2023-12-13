var express = require('express');
var router = express.Router();
const db = require('../models');
const { isAuth, isAdmin } = require('../middleware/middleware');
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
var statusService = new StatusService(db);
var UserService = require("../services/UserService")
var userService = new UserService(db);
var MembershipService = require('../services/MembershipService');
var membershipService = new MembershipService(db);
var crypto = require('crypto');
const { stat } = require('fs/promises');

async function createOrderNumber() {
  // sadly I had to use ChatGPT to fix the code I had here :(
  const orderNumber = crypto.randomBytes(4).toString('hex');
    await checkOrderNumber(orderNumber);
  return orderNumber;
}

async function checkOrderNumber(orderNumber) {
  let checkedOrderNumber = await orderService.getOrderNumber(orderNumber);
  if ( checkedOrderNumber !== null ) {
    await createOrderNumber();
  }
  return orderNumber;
}

// GET all the users orders
router.get('/user/all', isAuth, async function (req, res, next) {
  let OrdersAndProducts = [];
  try {
    const userId = req.user.id;
    if (userId == null) {
      res.status(400).json({ status: "error", error: "Error getting the user ID" });
      return res.end();
    }
    let orders = await orderService.getAll(userId);
    if (orders == null) {
      res.status(400).json({ result: "Fail", message: "Order does not exist" });
      return res.end();
    }
    for (const obj of orders) {
      let orderAndProducts = []
      let order = await orderService.getOne(obj.Name, obj.UserId);
      let product = await productsInOrderService.getAll(obj.Id);
      orderAndProducts.push(order);
      orderAndProducts.push(product);
      OrdersAndProducts.push(orderAndProducts);
    }

    res.status(200).json({ result: "Success", Orders: OrdersAndProducts });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// GET One of the users order
router.get('/one', isAuth, async function (req, res, next) {
  let totalPrice = 0
  let discount = 0;
  try {

    let { orderName } = req.body
    if (!orderName) {
      orderName = "";
    }
    const userId = req.user.id;
    if (userId == null) {
      res.status(400).json({ status: "error", error: "Error getting the user ID" });
      return res.end();
    }
    let order = await orderService.getOne(orderName, userId);
    console.log(order)
    if (order == null) {
      res.status(400).json({ result: "Fail", message: "Order does not exist" });
      return res.end();
    }
    let membership = await membershipService.getOneId(order.MembershipId);
    if (!membership) {
      res.status(400).json({ status: "error", error: "Error getting the membership" });
      return res.end();
    }
    if (membership.Name == "Silver") {
      discount = 0.15;
    }
    if (membership.Name == "Gold") {
      discount = 0.30;
    }
    if (membership.Name == "Bronze") {
      console.log("Membership is Bronze. No discount!")
    }

    let PIO = await productsInOrderService.getAll(order.Id)
    console.log(PIO)
    if (!PIO) {
      res.status(400).json({ result: "Fail", message: "Order does not exist" });
      return res.end();
    }

    for (const obj of PIO) {
      let Price = obj.UnitPrice;
      let Quantity = obj.Quantity;
      totalPrice = totalPrice + (Price * Quantity);
    }
    let discountTotal = totalPrice - ( totalPrice * discount);

    res.status(200).json({ result: "Success", order: order, ProductsInOrder: PIO, TotalPrice: totalPrice, MembershipAtOrderTime: membership.Name, DiscountPrice: discountTotal });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// GET one of a users order - Admin
router.get('/all/one', isAuth, isAdmin, async function (req, res, next) {
  let totalPrice = 0
  let discount = 0;
  try{
    const { orderNumber } = req.body
    if (!orderNumber) {
      res.status(400).json({ result: "Fail", message: "orderNumber must be provided" });
      return res.end();
    }
    let order = await orderService.getOrderNumber(orderNumber);
    if (order == null) {
      res.status(400).json({ result: "Fail", message: "Order does not exist" });
      return res.end();
    }

    let PIO = await productsInOrderService.getAll(order.Id)
    if (!PIO) {
      res.status(400).json({ result: "Fail", message: "Order does not exist" });
      return res.end();
    }

    let membership = await membershipService.getOneId(order.MembershipId);
    if (!membership) {
      res.status(400).json({ status: "error", error: "Error getting the membership" });
      return res.end();
    }
    if (membership.Name == "Silver") {
      discount = 0.15;
    }
    if (membership.Name == "Gold") {
      discount = 0.30;
    }
    if (membership.Name == "Bronze") {
      console.log("Membership is Bronze. No discount!")
    }

    for (const obj of PIO) {
      let Price = obj.UnitPrice;
      let Quantity = obj.Quantity;
      totalPrice = totalPrice + (Price * Quantity);
    }
    let discountTotal = totalPrice - ( totalPrice * discount);


    res.status(200).json({ result: "Success", Order: order, ProductsInOrder: PIO, OrderPrice: totalPrice, MembershipAtOrderTime: membership.Name, DiscountPrice: discountTotal});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// GET All the orders from all the users - Admin
router.get('/all', async function (req, res, next) {
  let OrdersAndProducts = [];
  try {
    let status = await statusService.get();
    let orders = await orderService.getAllOrders();
    if (orders == null) {
      res.status(400).json({ result: "Fail", message: "Order does not exist" });
      return res.end();
    }
    for (const obj of orders) {
      let orderAndProducts = []
      let order = await orderService.getOne(obj.Name, obj.UserId);
      let product = await productsInOrderService.getAll(obj.Id);
      orderAndProducts.push(order);
      orderAndProducts.push(product);
      OrdersAndProducts.push(orderAndProducts);
    }

    res.status(200).json({ result: "Success", Orders: OrdersAndProducts, status: status });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

router.get('/orders', async function (req, res, next) {
  try {
    let orders = await orderService.getAllOrders();
    if (orders == null) {
      res.status(400).json({ result: "Fail", message: "Order does not exist" });
      return res.end();
    }
    res.status(200).json({ result: "Success", orders: orders});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// POST add cart to the order
router.post('/checkout', isAuth, async function (req, res, next) {
  // could not remember the full way to do this so found this here - https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  let orderNumber = await createOrderNumber();
  let totalPrice = 0;
  let discount = 0;
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
    let user = await userService.getOne(req.user.email);
    if (!user) {
      res.status(400).json({ status: "error", error: "Error getting the user" });
      return res.end();
    }
    let membership = await membershipService.getOneId(user.MembershipId);
    if (!membership) {
      res.status(400).json({ status: "error", error: "Error getting the membership" });
      return res.end();
    }
    if (membership.Name == "Silver") {
      discount = 0.15;
    }
    if (membership.Name == "Gold") {
      discount = 0.30;
    }
    if (membership.Name == "Bronze") {
      console.log("Membership is Bronze. No discount!")
    }

    let status = await statusService.getOne("In Progress")

    await orderService.create(cartName, userId, status.Id, orderNumber, membership.Id);
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
    for (const obj of PIO) {
      let product = await productService.getOne(obj.ProductId);
      let newQuantity = product[0].Quantity - obj.Quantity;
      if (newQuantity < 0) {
        res.status(400).json({ result: "Fail", message: "not enough product in stock", Product: product[0].Name });
        return res.end();
      }
      await productService.updateQuantity(obj.ProductId, newQuantity);
    }
    
    let totalQuantity = user.purchases;

    for (const obj of PIO) {
      let Price = obj.UnitPrice;
      let Quantity = obj.Quantity;
      totalPrice = totalPrice + (Price * Quantity);
      totalQuantity = totalQuantity + Quantity;
    }
    
    

    await userService.updatePurchases(userId, totalQuantity)
    user = await userService.getOne(req.user.email);
    if (user.purchases < 15) {
      let newMembership = await membershipService.getOne("Bronze")
      await userService.updateMembership(userId, newMembership.Id);
    }
    if (user.purchases > 14 && user.purchases < 31) {
      let newMembership = await membershipService.getOne("Silver")
      await userService.updateMembership(userId, newMembership.Id);
    }
    if (user.purchases > 30) {
      let newMembership = await membershipService.getOne("Gold")
      await userService.updateMembership(userId, newMembership.Id);
    }

    let discountTotal = totalPrice - ( totalPrice * discount);
    
    PIO = await productsInOrderService.getAll(order.Id)
    await cartService.ordered(cart.Id)

    res.status(200).json({ result: "Success", Order: order, OrderNumber: orderNumber, ProductsInOrder: PIO, TotalPrice: totalPrice, MembershiStatus: membership.Name,  DiscountTotal: discountTotal});
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
});

// PUT change status of an order
router.put('/update', isAuth, isAdmin, async function (req, res, next) {
  try{
  const { orderNumber, newStatus } = req.body;
  if (!orderNumber) {
    res.status(400).json({ status: "error", error: "orderNumber must be provided" });
      return res.end();
  }
  if (!newStatus) {
    res.status(400).json({ status: "error", error: "newStatus must be provided" });
      return res.end();
  }
  const orderExists = await orderService.getOrderNumber(orderNumber);
    if (orderExists === null) {
      res.status(400).json({ result: "Fail", error: "Order does not exist" })
      return res.end();
    }
    console.log(orderExists)
  const status = await statusService.getOneId(newStatus);
  if (status == null) {
    res.status(400).json({ status: "error", error: "Error getting the status" });
      return res.end();
  }
  await orderService.update(orderNumber, status.Id);
  order = await orderService.getOrderNumber(orderNumber);
  res.status(200).json({ status: "Status Updated", Order: order, NewStatus: newStatus  });
  }  catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      error: "Internal Server Error",
    });
  }
})
module.exports = router;
