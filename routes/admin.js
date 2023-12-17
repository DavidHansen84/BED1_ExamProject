var express = require('express');
var router = express.Router();
var db = require("../models");
var crypto = require('crypto');
var UserService = require("../services/UserService")
var userService = new UserService(db);
var RoleService = require('../services/RoleService');
var roleService = new RoleService(db);
var StatusService = require('../services/StatusService');
var statusService = new StatusService(db);
var CategoryService = require('../services/CategoryService');
var categoryService = new CategoryService(db);
var BrandService = require('../services/BrandService');
var brandService = new BrandService(db);
var ProductService = require('../services/ProductService');
var productService = new ProductService(db);
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json();
const { isAuth, isAdmin } = require('../middleware/middleware');
var jwt = require('jsonwebtoken');
const validator = require('email-validator');
var axios = require("axios");
const cookie = require('cookie');

let role

async function getRole(RoleId) {
  let roleInfo = await roleService.get(RoleId);

  role = roleInfo[0].dataValues.Name;
}
/* GET Login page. */
router.get('/', async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "Post for registered users to be able to login"
  // #swagger.produces = ['text/html']
  res.render('login', { title: 'Products' });
});

// Admin login
router.post("/login", jsonParser, async (req, res, next) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = "Post for registered users to be able to login"
  // #swagger.produces = ['text/html']
  try {
    const { Email, Password } = req.body;
  if (Email == null) {
    return res.status(400).json({ status: "error", error: "Email is required." });
  }
  if (Password == null) {
    return res.status(400).json({ status: "error", error: "Password is required." });
  }
  await userService.getOne(Email).then((data) => {
    if (data === null) {
      return res.status(400).json({ status: "error", error: "Incorrect email or password" });
    }
    getRole(data.RoleId);
    crypto.pbkdf2(Password, data.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
      if (err) { return cb(err); }
      if (!crypto.timingSafeEqual(data.password, hashedPassword)) {
        return res.status(400).json({ status: "error", error: "Incorrect email or password" });
      }
      let token;
      try {
        token = jwt.sign(
          { id: data.Id, email: data.email, role: role },
          process.env.TOKEN_SECRET,
          { expiresIn: "2h" }
        );
      
      
      // got it form chatGPT and https://expressjs.com/en/api.html#res.cookie
      res.cookie('token', 'Bearer ' + token, { expires: new Date(Date.now() + 2 * 3600000) });
      console.log(token)
      console.log("HERE")
      console.log(res.cookie)
      res.status(200).redirect('/admin/products');
    } catch (err) {
      res.status(400).json({ error: "Something went wrong with creating JWT token" })
    }});
  });
} catch (err) {
  res.status(500).json({ error: "Something went " })
}});

// Admin get products
router.get('/products', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "See all the products"
  // #swagger.produces = ['text/html']
  try {
    const response = await axios.get("http://localhost:3000/products");
    if (!response) {
      return res.status(400).json({ status: "error", error: "Error getting products form the API" });
    }
    let data = response.data;
    if (!data) {
      return res.status(400).json({ result: "Fail", error: "Data not found" });
    }
    res.render('products', { title: 'Products', products: data.products, brands: data.brands, categories: data.categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error getting product" }).redirect('/admin/products')
  }
});

// Admin search
router.get('/products/search', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "Gets the search data and displays it"
  // #swagger.produces = ['text/html']
  try {

    let data = req.query.jsonData;
    if (!data) {
      return res.status(400).json({ status: "error", error: "Error getting search data" });
    }

    const jsonData = JSON.parse(data);

    const { products, brands, categories } = jsonData;

    res.render('products', { title: 'Products', products: products[0], brands: brands, categories: categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error getting product" })
  }
});

// Admin edit product
router.get('/editProduct/:id', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "Admin page to edit the products"
  // #swagger.produces = ['text/html']
  try {
    const response = await axios.get("http://localhost:3000/products");
    if (!response) {
      return res.status(400).json({ result: "Fail", error: "No response from the products API" });
    }
    let productId = req.params.id;
    if (!productId) {
      return res.status(400).json({ result: "Fail", error: "Product ID not found" });
    }
    let data = response.data;
    if (!data) {
      return res.status(400).json({ result: "Fail", error: "Data not found" });
    }
    let product = data.products.find(product => product.Id == productId);
    if (!product) {
      return res.status(400).json({ result: "Fail", error: "Product not found" });
    }
    res.render('editProduct', { title: 'Product', product: product, brands: data.brands, categories: data.categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error editing product" })
  }
});

// Admin add product
router.get('/addProduct', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "Admin page to add a new product"
  // #swagger.produces = ['text/html']
  try {
    const response = await axios.get("http://localhost:3000/products");
    let data = response.data;
    res.render('addProduct', { title: 'Product', brands: data.brands, categories: data.categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error adding product" })
  }
});

// Admin add brand
router.get('/addBrand', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "Admin page to add a new Brand"
  // #swagger.produces = ['text/html']
  try {

    res.render('addBrand', { title: 'addBrand' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error adding brand" })
  }
});

// Admin add category
router.get('/addcategory', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "Admin page to add a new Category"
  // #swagger.produces = ['text/html']
  try {

    res.render('addCategory', { title: 'addCategory' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error adding category" })
  }
});

// Admin get brands
router.get('/brands', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "See all the brands"
  // #swagger.produces = ['text/html']
  try {
    const response = await axios.get("http://localhost:3000/brands");
    let data = response.data;
    res.render('brands', { title: 'Express', brands: data.brands });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error getting brand" })
  }
});

// Admin edit a brand
router.get('/editBrand/:id', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "Admin page to edit the brands"
  // #swagger.produces = ['text/html']
  try {
    const response = await axios.get("http://localhost:3000/brands");
    if (!response) {
      return res.status(400).json({ result: "Fail", error: "No response from the brand API" });
    }
    let brandId = req.params.id;
    if (!brandId) {
      return res.status(400).json({ result: "Fail", error: "Brand ID not found" });
    }
    let data = response.data;
    if (!data) {
      return res.status(400).json({ result: "Fail", error: "Data not found" });
    }
    let brand = data.brands.find(brand => brand.Id == brandId);
    if (!brand) {
      return res.status(400).json({ result: "Fail", error: "Brand not found" });
    }
    res.render('editBrand', { title: 'Brand', brand: brand });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error editing brand" })
  }
});

// Admin get categories
router.get('/categories', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "See all the categories"
  // #swagger.produces = ['text/html']
  try {
    const response = await axios.get("http://localhost:3000/categories");
    let data = response.data;
    res.render('categories', { title: 'Express', categories: data.categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error getting categories" })
  }
});

// Admin edit a category
router.get('/editCategory/:id', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "Admin page to edit the categories"
  // #swagger.produces = ['text/html']
  try {
    const response = await axios.get("http://localhost:3000/categories");
    if (!response) {
      return res.status(400).json({ result: "Fail", error: "No response from the categories API" });
    }
    let categoryId = req.params.id;
    if (!categoryId) {
      return res.status(400).json({ result: "Fail", error: "Category ID not found" });
    }
    let data = response.data;
    if (!data) {
      return res.status(400).json({ result: "Fail", error: "Data not found" });
    }
    let category = data.categories.find(category => category.Id == categoryId);
    if (!category) {
      return res.status(400).json({ result: "Fail", error: "Category not found" });
    }
    res.render('editCategory', { title: 'Category', category: category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error editing categories" })
  }
});

// Admin get roler
router.get('/roles', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "See all the roles"
  // #swagger.produces = ['text/html']
  try {
    const response = await axios.get("http://localhost:3000/roles");
    let data = response.data;
    res.render('roles', { title: 'Express', roles: data.roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error getting roles" })
  }
});

// Admin get users
router.get('/users', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "See all the users"
  // #swagger.produces = ['text/html']
  try {
    const response = await axios.get("http://localhost:3000/users");
    let data = response.data;
    res.render('users', { title: 'Express', users: data.users, memberships: data.memberships, roles: data.roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error getting users" })
  }
});

// Admin add a user
router.get('/addUser', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "Admin page to add a new User"
  // #swagger.produces = ['text/html']
  try {

    res.render('addUser', { title: 'addUser' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error adding category" })
  }
});

// Admin edit a user
router.get('/editUser/:id', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "Admin page to edit the users"
  // #swagger.produces = ['text/html']
  try {
    const response = await axios.get("http://localhost:3000/users");
    if (!response) {
      return res.status(400).json({ result: "Fail", error: "No response from the user API" });
    }
    let userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ result: "Fail", error: "User ID not found" });
    }
    let data = response.data;
    if (!data) {
      return res.status(400).json({ result: "Fail", error: "Data not found" });
    }
    let roles = await roleService.getAll();
    if (!roles) {
      return res.status(400).json({ result: "Fail", error: "Roles not found" });
    }
    let user = data.users.find(user => user.Id == userId);
    if (!user) {
      return res.status(400).json({ result: "Fail", error: "User not found" });
    }
    res.render('editUser', { title: 'User', user: user, roles: roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error editing users" })
  }
});

// Admin get orders
router.get('/orders', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "See all the orders"
  // #swagger.produces = ['text/html']
  try {
    const cookieHeader = req.headers.cookie;
    const cookies = cookie.parse(cookieHeader || '');
    let token = cookies.token.split(' ')[1]
    const response = await axios.get("http://localhost:3000/orders/all", {
      headers: {
        Authorization: `Bearer ` + token,
      }
    });
    const status = await axios.get("http://localhost:3000/status");
    let data = response.data;
    res.render('orders', { title: 'Express', orders: data.Orders, status: status.data.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error getting orders" })
  }
});

// Admin edit orders
router.get('/editOrder/:id', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Admin']
  // #swagger.description = "Admin page to edit the orders"
  // #swagger.produces = ['text/html']
  try {
    const cookieHeader = req.headers.cookie;
    const cookies = cookie.parse(cookieHeader || '');
    let token = cookies.token.split(' ')[1]
    const response = await axios.get("http://localhost:3000/orders/orders", {
      headers: {
        Authorization: `Bearer ` + token,
      }
    });
    let orderId = req.params.id;
    let data = response.data;
    let statuses = await statusService.get()
    console.log(data.orders)
    res.render('editOrder', { title: 'Orders', order: data.orders[orderId - 1], statuses: statuses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error editing order" })
  }
});

module.exports = router;
