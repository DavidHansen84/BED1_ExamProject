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
var StatusService = require('../services/StatusService');
var statusService = new StatusService(db);

let products = []
async function fetchProducts() {
    const response = await axios.get(process.env.PRODUCTS_API);
    products = response.data;
}

async function getCategory(products, res) {
    try {

        let CategoryList = await categoryService.get();

        if (CategoryList.length === 0) {
            for (const obj of products.data) {
                let categoryExist = await categoryService.getOne(obj.category);
                if (!categoryExist) {
                    await categoryService.create(obj.category);
                }
            };
            console.log("Category table populated!")
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

async function getBrand(products, res) {
    try {

        let BrandList = await brandService.get();

        if (BrandList.length === 0) {
            for (const obj of products.data) {
                let brandExist = await brandService.getOne(obj.brand);
                if (!brandExist) {
                    await brandService.create(obj.brand);
                };
            }
            console.log("Brands table populated!")
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
            console.log("Products table populated!")
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

            await roleService.create("Admin");
            await roleService.create("User");
            console.log("Roles table populated");

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

            await membershipService.create("Bronze");
            await membershipService.create("Silver");
            await membershipService.create("Gold");
            console.log("Membership table populated!");
        } else {
            console.log("Memberships are already populated!")
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal Server Error",
        });
    }
}

async function populateStatus() {
    try {

        let statusList = await statusService.get();

        if (statusList.length === 0) {

            await statusService.create("Ordered");
            await statusService.create("In Progress");
            await statusService.create("Completed");
            console.log("Status table populated!");
        } else {
            console.log("Status are already populated!")
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
            let membership = await membershipService.getOne("Bronze");
            let role = await roleService.getOne("Admin");

            var salt = crypto.randomBytes(16);
            crypto.pbkdf2("P@ssword2023", salt, 310000, 32, 'sha256', function (err, hashedPassword) {
                if (err) { return next(err); }
                userService.create("Admin", hashedPassword, "admin@noroff.no", "Admin", "Support", "Online", 911, salt, membership.Id, role.Id);
            });
            console.log("Admin created!")
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
router.post('/', async function (req, res, next) {
    try {
        await fetchProducts();
        await getCategory(products, res);
        await getBrand(products, res);
        await populateProduct(products);
        await populateRoles();
        await populateMemberships();
        await populateStatus();
        await createAdmin(res);
        console.log("Database populated!")
        res.status(200).json({status: "Success", message: "Database populated!"})

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            status: "error",
            error: "Internal Server Error",
        });
    }


});

module.exports = router;
