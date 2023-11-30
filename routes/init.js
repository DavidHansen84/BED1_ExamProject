var express = require('express');
var router = express.Router();
var axios = require("axios")
const db = require('../models');
var crypto = require('crypto');
var ProductService = require('../services/ProductService');
var productService = new ProductService(db);
var CategoryService = require('../services/CategoryService');
var categoryService = new CategoryService(db);
var BrandService = require('../services/BrandService');
var brandService = new BrandService(db);
var RoleService = require('../services/RoleService');
var roleService = new RoleService(db);
var UserService = require('../services/UserService');
var userService = new UserService(db);
var MembershipService = require('../services/MembershipService');
var membershipService = new MembershipService(db);

let products = []
async function fetchProducts() {
    const response = await axios.get(process.env.PRODUCTS_API);
    products = response.data;
}

async function getCategory(products) {
    try {

        let CategoryList = await categoryService.get();

        if (CategoryList.length === 0) {
            for (const obj of products.data) {
                await categoryService.create(obj.category);
            };
        } else {
            console.log("Category are already populated!")
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal Server Error",
        });
    }
}

async function getBrand(products) {
    try {

        let BrandList = await brandService.get();

        if (BrandList.length === 0) {
            for (const obj of products.data) {
                await brandService.create(obj.brand);
            };
        } else {
            console.log("Brand are already populated!")
        }
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            next()
        } else {
            console.error("Error:", error);
            res.status(500).json({
                status: "error",
                error: "Internal Server Error",
            });
        }
    }
}

async function populateProduct(products) {
    try {

        let ProductList = await productService.get();

        if (ProductList.length === 0) {
            for (const obj of products.data) {
                let category = await categoryService.getOne(obj.category);
                console.log(category.Id)
                let brand = await brandService.getOne(obj.brand);
                Category = category.Id;
                Brand = brand.Id;
                ImageURL = obj.imgurl;
                Name = obj.name;
                Description = obj.description;
                Price = obj.price;
                Quantity = obj.quantity;
                date_added = obj.date_added;

                productService.create(Name, ImageURL, Description, Price, Quantity, date_added, Brand, Category)
            };
        } else {
            console.log("Products are already populated!")
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal Server Error",
        });
    }
}

async function populateRoles() {
    try {

        let RolesList = await roleService.get();

        if (RolesList.length === 0) {

            roleService.create("Admin");
            roleService.create("User");

        } else {
            console.log("Roles are already populated!")
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal Server Error",
        });
    }
}

async function populateMemberships() {
    try {

        let MembershipList = await membershipService.get();

        if (MembershipList.length === 0) {

            membershipService.create("Bronze");
            membershipService.create("Silver");
            membershipService.create("Gold");

        } else {
            console.log("Roles are already populated!")
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal Server Error",
        });
    }
}

async function createAdmin(res) {
    try {

        let UserList = await userService.get();

        if (UserList.length === 0) {

            var salt = crypto.randomBytes(16);
            crypto.pbkdf2("P@ssword2023", salt, 310000, 32, 'sha256', function(err, hashedPassword) {
              if (err) { return next(err); }
              userService.createAdmin("Admin", hashedPassword, "admin@noroff.no", "Admin", "Support", "Online", 911, salt);
            });

        } else {
            console.log("User Admin is already Created!")
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal Server Error",
        });
    }
}


/* Populate Products table */
router.get('/', async function (req, res, next) {


    try {

        let CategoryList = await categoryService.get();

        if (CategoryList.length === 0) {
            await fetchProducts();
            for (const obj of products.data) {
                getCategory(obj, res);
            };
            res.end();
        } else {
            console.log("Category are already populated!")
            res.end();
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal Server Error",
        });
    }
    // setTimeout(() => console.log(products.data[1].category), 1000);

});

/* Populate Products table */
router.post('/', async function (req, res, next) {
    try {
        await fetchProducts();
        await getCategory(products);
        await getBrand(products);
        await populateProduct(products);
        await populateRoles();
        await populateMemberships();
        await createAdmin(res);
        res.end();

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal Server Error",
        });
    }


});

module.exports = router;
