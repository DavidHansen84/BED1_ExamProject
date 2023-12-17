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
    let { productSearch, categorySearch, brandSearch } = req.body;

    let productQuery = `SELECT * FROM ecommerce.products WHERE Name LIKE '%${productSearch}%';`

    let categoryQuery = `SELECT * FROM ecommerce.products WHERE CategoryId = '${categorySearch}';`

    let brandQuery = `SELECT * FROM ecommerce.products WHERE BrandId = '${brandSearch}';`

if (categorySearch){
  if(isNaN(categorySearch)) {
    let category = await categoryService.getOne(categorySearch);
    if (!category) {
      return res.status(400).json({ result: "Fail", message: "No category with this name" });
    }
    categorySearch = category.dataValues.Id
    categoryQuery = `SELECT * FROM ecommerce.products WHERE CategoryId = '${categorySearch}';`
  }
}
if (brandSearch){
  if(isNaN(brandSearch)) {
    let brand = await brandService.getOne(brandSearch);
    if (!brand) {
      return res.status(400).json({ result: "Fail", message: "No brand with this name" });
    }
    brandSearch = brand.dataValues.Id
    brandQuery = `SELECT * FROM ecommerce.products WHERE BrandId = '${brandSearch}';`
  }
}
if (productSearch) {
  let products = await productService.searchProduct(productQuery)
  res.status(200).json({ result: "Success", products: products, brands: brands, categories: categories });
}
if (!productSearch) {
if (categorySearch) {
  let products = await productService.searchProduct(categoryQuery)
  console.log(products)
  res.status(200).json({ result: "Success", products: products, brands: brands, categories: categories });
}
if (!categorySearch) {
if (brandSearch) {
  let products = await productService.searchProduct(brandQuery)
  res.status(200).json({ result: "Success", products: products, brands: brands, categories: categories });
}
if (!brandSearch) {
  return res.status(400).json({ result: "Fail", message: "productSearch, categorySearch or brandSearch must be provided" });
}}}
} catch (err) {
  console.error(err);
  res.status(500).json({ result: "Error", error: "Error getting products" })
}
});

module.exports = router;
