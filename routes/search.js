const express = require('express');
const router = express.Router();
const jsonParser = express.json();
const db = require('../models');
var ProductService = require('../services/ProductService');
var productService = new ProductService(db);
var CategoryService = require('../services/CategoryService');
var categoryService = new CategoryService(db);
var BrandService = require('../services/BrandService');
var brandService = new BrandService(db);


router.post('/', jsonParser, async function (req, res, next) {
  // #swagger.tags = ['Search']
    // #swagger.description = "Search API endpoint"
    // #swagger.produces = ['text/html']
  try{
  let brands = await brandService.get();
  if (!brands) {
    return res.status(400).json({ result: "Fail", error: "No response from the brand API" });
  }
  let categories = await categoryService.get();
  if (!categories) {
    return res.status(400).json({ result: "Fail", error: "No response from the categories API" });
  }
    const { productSearch, categorySearch, brandSearch } = req.body;

    const productQuery = `SELECT * FROM ecommerce.products WHERE Name LIKE '%${productSearch}%';`

    const categoryQuery = `SELECT * FROM ecommerce.products WHERE CategoryId = ${categorySearch};`

    const brandQuery = `SELECT * FROM ecommerce.products WHERE BrandId = ${brandSearch};`

if (productSearch) {
  let products = await productService.searchProduct(productQuery)
  res.status(200).json({ result: "Success", products: products, brands: brands, categories: categories });
}
if (!productSearch) {
if (categorySearch) {
  let products = await productService.searchProduct(categoryQuery)
  res.status(200).json({ result: "Success", products: products, brands: brands, categories: categories });
}
if (!categorySearch) {
if (brandSearch) {
  let products = await productService.searchProduct(brandQuery)
  res.status(200).json({ result: "Success", products: products, brands: brands, categories: categories });
}}}
} catch (err) {
  console.error(err);
  res.status(500).json({ result: "Error", error: "Error getting products" })
}
});

module.exports = router;
