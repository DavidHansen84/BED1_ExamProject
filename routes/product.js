var express = require('express');
var router = express.Router();
const db = require('../models');
const { isAuth, isAdmin } = require('../middleware/middleware');
var ProductService = require('../services/ProductService');
var productService = new ProductService(db);
var CartService = require('../services/CartService');
var cartService = new CartService(db);
var ProductsInCartService = require('../services/ProductsInCartService');
var productsInCartService = new ProductsInCartService(db);
var CategoryService = require('../services/CategoryService');
var categoryService = new CategoryService(db);
var BrandService = require('../services/BrandService');
var brandService = new BrandService(db);
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json();


// TODO add search, add isAdmin, add try{} error handling

// GET all the products
router.get('/', jsonParser, async function (req, res, next) {
  let products = await productService.get();
  let brands = await brandService.get();
  let categories = await categoryService.get();
  res.status(200).json({ result: "Success", products: products, brands: brands, categories: categories });
});

// GET products in user cart
router.get('/cart', jsonParser, isAuth, async function (req, res, next) {
  let totalPrice = 0
  try {
  
  let { cartName } = req.body
  if (!cartName) {
    cartName = "";
  }
  console.log(req.user)
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
  

    let PIC = await productsInCartService.getAll(cart.Id)
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
router.post('/add/cart', jsonParser, isAuth, async function (req, res, next) {
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
  if (cart.Active == 0) {
    res.status(400).json({ result: "Fail", message: "This cart is inactive. Chose a diffrent cart or create a new one" });
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

  }
});

// DELETE to remove product from user cart
router.delete('/del/cart', jsonParser, isAuth, async function (req, res, next) {
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

// POST to add product ADMIN ONLY -- need isAdmin
router.post('/add', jsonParser, isAuth, isAdmin, async function (req, res, next) {
  let brandExists
  let categoryExists
  const { Name, ImageURL, Description, Price, Quantity, Brand, Category } = req.body;
  console.log(req.body)
  if (!Name) {
    res.status(400).json({
      result: "Fail", error: "Name must be provided"
    })
    return res.end();
  }
  let nameExist = await productService.getName(Name)
  if (nameExist.length > 0) {
    res.status(400).json({
      result: "Fail", error: "Product name already exist"
    })
    return res.end();
  }
  if (!ImageURL) {
    res.status(400).json({
      result: "Fail", error: "ImageURL must be provided"
    })
    return res.end();
  }
  if (!Description) {
    res.status(400).json({
      result: "Fail", error: "Description must be provided"
    })
    return res.end();
  }
  if (!Price) {
    res.status(400).json({
      result: "Fail", error: "Price must be provided"
    })
    return res.end();
  }
  if (isNaN(Price)) {
    res.status(400).json({
      result: "Fail", error: "Price must be a number"
    })
    return res.end();
  }
  if (!Quantity) {
    res.status(400).json({
      result: "Fail", error: "Quantity must be provided"
    })
    return res.end();
  }
  if (isNaN(Quantity)) {
    res.status(400).json({
      result: "Fail", error: "Quantity must be a number"
    })
    return res.end();
  }
  if (!Brand) {
    res.status(400).json({
      result: "Fail", error: "Brand must be provided"
    })
    return res.end();
  }
  if (isNaN(Brand)) {
    brandExists = await brandService.getOne(Brand)
    if (!brandExists) {
      res.status(400).json({
        result: "Fail", error: "Brand does not exist"
      })
      return res.end();
    }
  } else {
  brandExists = await brandService.getOneId(Brand)
  if (!brandExists) {
    res.status(400).json({
      result: "Fail", error: "Brand does not exist"
    })
    return res.end();
  }}
  if (!Category) {
    res.status(400).json({
      result: "Fail", error: "Category must be provided"
    })
    return res.end();
  }
  if (isNaN(Category)) {
    categoryExists = await categoryService.getOne(Category)
    if (!categoryExists) {
      res.status(400).json({
        result: "Fail", error: "Category does not exist"
      })
      return res.end();
    }
  } else {
  categoryExists = await categoryService.getOneId(Category)
  if (!categoryExists) {
    res.status(400).json({
      result: "Fail", error: "Category does not exist"
    })
    return res.end();
  }}
  console.log(brandExists.Id)
  console.log(categoryExists.Id)

  newProduct = await productService.createNew(Name, ImageURL, Description, Price, Quantity, brandExists.Id, categoryExists.Id)
  res.status(200).json({ result: "Success", addedProduct: newProduct });
});

// PUT to update product ADMIN ONLY -- need isAdmin
router.put('/edit/:id', jsonParser, isAuth, isAdmin, async function (req, res, next) {
  let brandExists
  let categoryExists
  const productId = parseInt(req.params.id);
  console.log(productId);
  const { Name, ImageURL, Description, Price, Quantity, Brand, Category } = req.body;
  console.log(req.body)
  if (!productId) {
    res.status(400).json({
      result: "Fail", error: "id must be provided in the parameters"
    })
    return res.end();
  }
  let productExist = await productService.getOne(productId)

  if (!Name) {
    res.status(400).json({
      result: "Fail", error: "Name must be provided"
    })
    return res.end();
  }
  if (!productExist) {
    res.status(400).json({
      result: "Fail", error: "Product does not exist, try POST"
    })
    return res.end();
  }
  if (!ImageURL) {
    res.status(400).json({
      result: "Fail", error: "ImageURL must be provided"
    })
    return res.end();
  }
  if (!Description) {
    res.status(400).json({
      result: "Fail", error: "Description must be provided"
    })
    return res.end();
  }
  if (!Price) {
    res.status(400).json({
      result: "Fail", error: "Price must be provided"
    })
    return res.end();
  }
  if (isNaN(Price)) {
    res.status(400).json({
      result: "Fail", error: "Price must be a number"
    })
    return res.end();
  }
  if (!Quantity) {
    res.status(400).json({
      result: "Fail", error: "Quantity must be provided"
    })
    return res.end();
  }
  if (isNaN(Quantity)) {
    res.status(400).json({
      result: "Fail", error: "Quantity must be a number"
    })
    return res.end();
  }
  if (!Brand) {
    res.status(400).json({
      result: "Fail", error: "Brand must be provided"
    })
    return res.end();
  }
  if (isNaN(Brand)) {
    brandExists = await brandService.getOne(Brand)
    if (!brandExists) {
      res.status(400).json({
        result: "Fail", error: "Brand does not exist"
      })
      return res.end();
    }
  } else {
  brandExists = await brandService.getOneId(Brand)
  if (!brandExists) {
    res.status(400).json({
      result: "Fail", error: "Brand does not exist"
    })
    return res.end();
  }}
  if (!Category) {
    res.status(400).json({
      result: "Fail", error: "Category must be provided"
    })
    return res.end();
  }
  if (isNaN(Category)) {
    categoryExists = await categoryService.getOne(Category)
    if (!categoryExists) {
      res.status(400).json({
        result: "Fail", error: "Category does not exist"
      })
      return res.end();
    }
  } else {
  categoryExists = await categoryService.getOneId(Category)
  if (!categoryExists) {
    res.status(400).json({
      result: "Fail", error: "Category does not exist"
    })
    return res.end();
  }}
  
  await productService.update(productId, Name, ImageURL, Description, Price, Quantity, brandExists.Id, categoryExists.Id)
  let newProduct = await productService.getOne(productId)
  res.status(200).json({ result: "Success", oldData: productExist, newData: newProduct });
});

// PUT to activate a product ADMIN ONLY need isAdmin
router.put('/activate/:id', jsonParser, isAuth, isAdmin, async function (req, res, next) {
  const productId = parseInt(req.params.id);
  if (!productId) {
    res.status(400).json({
      result: "Fail", error: "id must be provided in the parameters"
    })
    return res.end();
  }
  let productExist = await productService.getOne(productId)

  if (!productExist) {
    res.status(400).json({
      result: "Fail", error: "Product does not exist"
    })
    return res.end();
  }
  if (productExist[0].Active === 1) {
    res.status(400).json({
      result: "Fail", error: "Product is already active", activatedProduct: productExist
    })
    return res.end();
  }
  await productService.activate(productId);
  productExist = await productService.getOne(productId)
  res.status(200).json({result: "Success", activatedProduct: productExist, message: "This product has been made active"})
});

// DELETE to soft-delete product ADMIN ONLY -- need isAdmin
router.delete('/delete/:id', jsonParser, isAuth, isAdmin, async function (req, res, next) {
  const productId = parseInt(req.params.id);
  if (!productId) {
    res.status(400).json({
      result: "Fail", error: "id must be provided in the parameters"
    })
    return res.end();
  }
  let productExist = await productService.getOne(productId)

  if (!productExist) {
    res.status(400).json({
      result: "Fail", error: "Product does not exist"
    })
    return res.end();
  }
  if (productExist[0].Active === 0) {
    res.status(400).json({ result: "Fail", error: "Product is already deleted", deletedProduct: productExist })
    return res.end();
  }
  await productService.delete(productId);
  productExist = await productService.getOne(productId)
  res.status(200).json({result: "Success", deletedProduct: productExist, message: "This product has been deleted"})
});

module.exports = router;
