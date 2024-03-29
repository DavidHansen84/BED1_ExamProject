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
const { is } = require('express/lib/request');

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
  // #swagger.tags = ['Orders']
    // #swagger.description = "Gets all of the logged in user Orders"
    // #swagger.produces = ['text/html']
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
    res.status(500).json({ status: "error", error: "Error getting the orders", });
  }
});

// GET One of the users order
router.get('/one', isAuth, async function (req, res, next) {
  // #swagger.tags = ['Orders']
    // #swagger.description = "Gets one of the logged in users orders"
    // #swagger.produces = ['text/html']
  let totalPrice = 0
  let discount = 0;
  try {

    let { orderName } = req.body
    if (!orderName) {
      return res.status(400).json({ status: "error", error: "orderName must be provided" });
    }
    const userId = req.user.id;
    if (userId == null) {
      res.status(400).json({ status: "error", error: "Error getting the user ID" });
      return res.end();
    }
    let order = await orderService.getOne(orderName, userId);
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
      discount = 0;
    }

    let PIO = await productsInOrderService.getAll(order.Id)
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
    res.status(500).json({ status: "error", error: "Error getting the order",  });
  }
});

// GET one of a users order
router.get('/all/one', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Orders']
    // #swagger.description = "Gets order with orderNumber"
    // #swagger.produces = ['text/html']
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
    res.status(500).json({ status: "error", error: "Error getting the order", });
  }
});

// GET All the orders from all the users
router.get('/all', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Orders']
    // #swagger.description = "Gets all the orders in the database and the products in it"
    // #swagger.produces = ['text/html']
  let OrdersAndProducts = [];
  let orderStatus;
  console.log(req.user)
  try {
    let status = await statusService.get();
    if (!status) {
      res.status(400).json({ result: "Fail", message: "Error getting status" });
      return res.end();
    }
    let orders = await orderService.getAllOrders();
    if (orders == null) {
      res.status(400).json({ result: "Fail", message: "Order does not exist" });
      return res.end();
    }
    for (const obj of orders) {
      let orderAndProducts = []
      let order = await orderService.getOne(obj.Name, obj.UserId);
      let product = await productsInOrderService.getAll(obj.Id);
      orderStatus = await statusService.getOneId(order.StatusId)
      orderAndProducts.push(order);
      orderAndProducts.push(product);
      OrdersAndProducts.push(orderAndProducts);
    }
    res.status(200).json({ result: "Success", Orders: OrdersAndProducts, status: orderStatus });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", error: "Error getting the orders", });
  }
});

//GET all the orders in the database
router.get('/orders', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Orders']
    // #swagger.description = "Gets all the orders in the database"
    // #swagger.produces = ['text/html']
  try {
    let orders = await orderService.getAllOrders();
    if (orders == null) {
      res.status(400).json({ result: "Fail", message: "Order does not exist" });
      return res.end();
    }
    res.status(200).json({ result: "Success", orders: orders});
  } catch (error) {
    console.error("Error:", error);  
    res.status(500).json({ status: "error", error: "Error getting the orders",  });
  }
});

// POST add cart to the order
router.post('/checkout', isAuth, async function (req, res, next) {
  // #swagger.tags = ['Orders']
    // #swagger.description = "Adds a users cart to a the order and deactivates the cart"
    // #swagger.produces = ['text/html']
  // could not remember the full way to do this so found this here - https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  let orderNumber = await createOrderNumber();
  let totalPrice = 0;
  let discount = 0;
  try {
   
    let { cartName } = req.body
    if (!cartName) {
      return res.status(400).json({ status: "error", error: "cartName must be provided" });
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
    res.status(500).json({  status: "error",  error: "Error adding cart to the order", });
  }
});

// PUT change status of an order
router.put('/update', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Orders']
    // #swagger.description = "Updates the status of a order"
    // #swagger.produces = ['text/html']
  try{
  const { orderNumber, newStatus } = req.body;
  console.log(req.body)
  if (!orderNumber) {
    res.status(400).json({ status: "error", error: "orderNumber must be provided" });
      return res.end();
  }
  if (!newStatus) {
    res.status(400).json({ status: "error", error: "newStatus must be provided" });
      return res.end();
  }
  console.log(orderNumber)
  console.log(newStatus)
  const orderExists = await orderService.getOrderNumber(orderNumber);
    if (orderExists === null) {
      res.status(400).json({ result: "Fail", error: "Order does not exist" })
      return res.end();
    }
  const status = await statusService.getOneId(newStatus);
  if (status == null) {
    res.status(400).json({ status: "error", error: "Error getting the status" });
      return res.end();
  }
  console.log(status)
  await orderService.update(orderNumber, status.Id);
  order = await orderService.getOrderNumber(orderNumber);
  res.status(200).json({ status: "Status Updated", Order: order, NewStatus: newStatus  });
  }  catch (error) {
    console.error("Error:", error);
    res.status(500).json({  status: "error",  error: "Error updating the order",  });
  }
})
module.exports = router;
