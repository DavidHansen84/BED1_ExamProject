var express = require('express');
var router = express.Router();
const db = require('../models');
const { isAuth } = require('../middleware/middleware');
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

async function createOrderNumber() {
  // sadly I had to use ChatGPT to fix the code I had here :(
  // could not remember the full way to do this so found this here - https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
  const orderNumber = crypto.randomBytes(4).toString('hex');
  
  console.log(orderNumber)
  await checkOrderNumber(orderNumber);
  return orderNumber;
}

async function checkOrderNumber(orderNumber) {
  let checkedOrderNumber = await orderService.getOrderNumber(orderNumber);
  if ( checkedOrderNumber !== null ) {
    await createOrderNumber();
  }
  console.log(orderNumber);
  return orderNumber;
}

// GET the users cart
router.get('/', isAuth, async function (req, res, next) {
  // #swagger.tags = ['Checkout']
    // #swagger.description = "Gets a users carts"
    // #swagger.produces = ['text/html']
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
    res.status(500).json({ status: "error", error: "Error getting the users cart", });
  }
});

// POST to add product to user cart
router.post('/add/cart', isAuth, async function (req, res, next) {
  // #swagger.tags = ['Checkout']
    // #swagger.description = "Adds a product to the users cart"
    // #swagger.produces = ['text/html']
  const { cartName, productId, quantity } = req.body
  const userId = req.user.id;
  try {
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
  if (cart.Active == 0) {
    res.status(400).json({ result: "Fail", message: "This cart is inactive. Chose a diffrent name" });
    return res.end();
  }
  let product = await productService.getOne(productId);
  if (product == null) {
    return res.status(400).json({ status: "error", error: "Product does not exist" });
  }
    if (!product[0]){
    return res.status(400).json({ status: "error", error: "Product does not exist" });
  }

  let PIC = await productsInCartService.getOne(cart.Id, productId)
  if (!PIC) {
    if ( product[0].Quantity < quantity) {
      return res.status(400).json({ result: "Fail", message: "not enough in stock" });
    }
    await productsInCartService.create(cart.Id, productId, quantity, product[0].Name, product[0].Price)
    PIC = await productsInCartService.getAll(cart.Id)
    res.status(200).json({ result: "Success", cart: cart, ProductsInCart: PIC });
  }
  else {
    let newQuantity = PIC.Quantity + quantity;
    if ( product[0].Quantity < newQuantity || product[0].Quantity < quantity) {
      return res.status(400).json({ result: "Fail", message: "not enough in stock" });
    }
    else {
      let PICId = await productsInCartService.getOne(cart.Id, productId);
      await productsInCartService.update(PICId.Id, newQuantity);
      PIC = await productsInCartService.getAll(cart.Id);
      res.status(200).json({ result: "Success", cart: cart, ProductsInCart: PIC });
    

  }
}} catch (error) {
  console.error("Error:", error);
  res.status(500).json({ status: "error",  error: "Error adding product to cart",  });
}
});

// POST add cart to the order
router.post('/now', isAuth, async function (req, res, next) {
  // #swagger.tags = ['Checkout']
    // #swagger.description = "Puts a cart into a order and deactivates the cart"
    // #swagger.produces = ['text/html']
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

    res.status(200).json({ result: "Success", Order: order, ProductsInOrder: PIO, TotalPrice: totalPrice, DiscountTotal: discountTotal, OrderNumber: orderNumber, MembershiStatus: membership.Name });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({  status: "error", error: "Error adding the cart to order",});
  }
});

//PUT to update the quantity of a product in the cart
router.put('/add/cart', isAuth, async function (req, res, next) {
  // #swagger.tags = ['Checkout']
    // #swagger.description = "Updates the quantity of a product in a cart"
    // #swagger.produces = ['text/html']
  const { cartName, productId, quantity } = req.body
  const userId = req.user.id;
  try {
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
    return res.status(400).json({ status: "error", error: "The cart does not exist" });
  }
  let product = await productService.getOne(productId);
  console.log(product[0])
  if (!product[0]) {
    return res.status(400).json({ status: "error", error: "Product does not exist" });
  }
  let PIC = await productsInCartService.getOne(cart.Id, productId)
  if (!PIC) {
    return res.status(400).json({ status: "error", error: "Product is not in this cart" });
  }
  else {
          await productsInCartService.update(cart.Id, quantity);
      PIC = await productsInCartService.getAll(cart.Id)
      res.status(200).json({ result: "Success", cart: cart, ProductsInCart: PIC });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error",  error: "Error updating the quantity",});
  }
});

// DELETE to remove product from user cart
router.delete('/del/cart', isAuth, async function (req, res, next) {
  // #swagger.tags = ['Checkout']
    // #swagger.description = "Removes a product from the cart"
    // #swagger.produces = ['text/html']
  const { cartName, productId, quantity } = req.body
  const userId = req.user.id;
  try {
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
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({ status: "error", error: "Error removing product from cart",});
}
});



module.exports = router;
