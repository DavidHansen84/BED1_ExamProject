var express = require('express');
var router = express.Router();
var axios = require("axios")
const db = require('../models');
var ProductService = require('../services/ProductService');
var productService = new ProductService(db);
var CategoryService = require('../services/CategoryService');
var categoryService = new CategoryService(db);
var BrandService = require('../services/BrandService');
var brandService = new BrandService(db);

let products = []
async function fetchProducts() {
    const response = await axios.get(process.env.PRODUCTS_API);
    products = response.data;
}

async function getCategory(obj) {
    let category = await categoryService.get(obj.category);
    if (category.length == 0) {
        await categoryService.create(obj.category);
        console.log("category created")
    } else {
        console.log("Category already exist")
        console.log(category[0].Id + " " + obj.category)
        
    }
}

async function getBrand(obj) {
    let brand = await brandService.get(obj.brand);
    if (brand.length == 0) {
        await brandService.create(obj.brand);
    } else {
        console.log("Brand already exist")
    }
}

async function populateProduct(obj) {
    let category = await categoryService.get(obj.category);
    console.log(category[0])
    let brand = await brandService.get(obj.brand);
    Category = category[0].Id;
    Brand = brand[0].Id;
    ImageURL = obj.imgurl;
    Name = obj.name;
    Description = obj.description;
    Price = obj.price;
    Quantity = obj.quantity;
    date_added = obj.date_added;

    productService.create(Name, ImageURL, Description, Price, Quantity, date_added, Brand, Category)
}

/* Populate Products table */
router.get('/', async function (req, res, next) {

    let productList = await productService.get();
    await fetchProducts();
    products.data.forEach((obj) => {
        getCategory(obj);
        // getBrand(obj)
        // populateProduct(obj)
    });


    // await fetchProducts()

    // setTimeout(() => console.log(products.data[1].category), 1000);
    res.send(productList);


});

/* Populate Products table */
router.post('/', async function (req, res, next) {
    try {
        let productList = await productService.get();
        if (productList.length === 0) {

            await fetchProducts();
            // products.data.forEach((obj) => {
            //     getCategory(obj)
            //     getBrand(obj);
            // });

            products.data.forEach((obj) => {
                try {
                getCategory(obj);
                getBrand(obj);
                populateProduct(obj)

                res.end();
                } catch (error) {
                    console.error("Error:", error);
                    res.status(500).json({
                        status: "error",
                        error: "Internal Server Error",
                    });
                }
            });
        } else {
            console.log("Products are already populated!")
            res.end();
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal Server Error",
        });
    }
});

module.exports = router;
