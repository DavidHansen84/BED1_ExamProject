var express = require('express');
var router = express.Router();
var db = require("../models");
var crypto = require('crypto');
var UserService = require("../services/UserService")
var userService = new UserService(db);
var RoleService = require('../services/RoleService');
var roleService = new RoleService(db);
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json();
const { isAuth, isAdmin } = require('../middleware/middleware');
var jwt = require('jsonwebtoken');
const validator = require('email-validator');
var axios = require("axios");

let role

async function getRole(RoleId) {
  let roleInfo = await roleService.get(RoleId);
  
  role = roleInfo[0].dataValues.Name;
}
/* GET home page. */
router.get('/', async function(req, res, next) {
  
  res.render('login', { title: 'Products'});
});

router.post("/login", jsonParser, async (req, res, next) => {
  // #swagger.tags = ['Auth']
    // #swagger.description = "Post for registered users to be able to login"
    // #swagger.produces = ['text/html']
    const { Email, Password } = req.body;
    if (Email == null) {
      return res.status(400).json({status: "error", error: "Email is required."});
    }
    if (Password == null) {
      return res.status(400).json({status: "error", error: "Password is required."});
    }
    userService.getOne(Email).then((data) => {
              if(data === null) {
            return res.status(400).json({status: "error", error: "Incorrect email or password"});
        }
        getRole(data.RoleId);
        crypto.pbkdf2(Password, data.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
          if (err) { return cb(err); }
          if (!crypto.timingSafeEqual(data.password, hashedPassword)) {
              return res.status(400).json({status: "error", error: "Incorrect email or password"});
          }
          let token;
          
          try {
            
            console.log(role)
            token = jwt.sign(
              { id: data.Id, email: data.email, role: role },
              process.env.TOKEN_SECRET,
              { expiresIn: "2h" }
            );
          } catch (err) {
            res.status(400).json({error: "Something went wrong with creating JWT token"})
          }

          // got it form chatGPT and https://expressjs.com/en/api.html#res.cookie
          res.status(200).cookie('token', 'Bearer ' + token, {expires: new Date(Date.now() + 2 * 3600000) }).redirect('/admin/products')
        });
    });
});

router.get('/products', isAuth, isAdmin, async function(req, res, next) {
  console.log('Request Headers:', req.headers.cookies);
  const response = await axios.get("http://localhost:3000/products");
  let data = response.data;
  res.render('products', { title: 'Products', products: data.products, brands: data.brands, categories: data.categories});
});

router.get('/editProducts/:id', isAuth, isAdmin, async function(req, res, next) {
  console.log('Request Headers:', req.headers.cookies);
  const response = await axios.get("http://localhost:3000/products");
  let productId = req.params.id;
  console.log(productId)
  let data = response.data;
  console.log(data.products)
  console.log(data.products[productId - 1])
  res.render('editProducts', { title: 'Products', product: data.products[productId - 1], brands: data.brands, categories: data.categories});
});

router.get('/brands', isAuth, isAdmin, async function(req, res, next) {
  const response = await axios.get("http://localhost:3000/brands");
  let data = response.data;
  console.log(data.brands)
  res.render('brands', { title: 'Express', brands: data.brands});
});

router.get('/categories', isAuth, isAdmin, async function(req, res, next) {
  const response = await axios.get("http://localhost:3000/categories");
  let data = response.data;
  console.log(data.categories)
  res.render('categories', { title: 'Express', categories: data.categories});
});

router.get('/roles', isAuth, isAdmin, async function(req, res, next) {
  const response = await axios.get("http://localhost:3000/roles");
  let data = response.data;
  console.log(data.roles)
  res.render('roles', { title: 'Express', roles: data.roles});
});

router.get('/users', isAuth, isAdmin, async function(req, res, next) {
  const response = await axios.get("http://localhost:3000/users");
  let data = response.data;
  console.log(data.memberships[0])
  res.render('users', { title: 'Express', users: data.users, memberships: data.memberships, roles: data.roles });
});

router.get('/orders', isAuth, isAdmin, async function(req, res, next) {
  const response = await axios.get("http://localhost:3000/orders/all");
  let data = response.data;
  console.log(data.Orders)
  res.render('orders', { title: 'Express', orders: data.Orders});
});

module.exports = router;
