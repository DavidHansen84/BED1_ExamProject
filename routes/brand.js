var express = require('express');
var router = express.Router();
const db = require('../models');
const { isAuth, isAdmin } = require('../middleware/middleware');
var BrandService = require('../services/BrandService');
var brandService = new BrandService(db);
var ProductService = require('../services/ProductService');
var productService = new ProductService(db);

/* GET home page. */
router.get('/', async function (req, res, next) {
  // #swagger.tags = ['Brand']
    // #swagger.description = "Gets all the brands"
    // #swagger.produces = ['text/html']
  try {
    let brands = await brandService.get();
    res.status(200).json({ result: "Success", brands: brands });
  } catch (err) {
    res.status(500).json({ result: "Fail", error: "Error getting brand" });
  }
});

// POST a new brand
router.post('/add', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Brand']
    // #swagger.description = "Adds a brand"
    // #swagger.produces = ['text/html']

  const { Name } = req.body;
  try {
    if (!Name) {
      res.status(400).json({ result: "Fail", error: "Name of brand must be provided" })
      return res.end();
    }
    let nameExist = await brandService.getOne(Name)
    if (nameExist) {
      res.status(400).json({ result: "Fail", error: "Brand name already exist" })
      return res.end();
    }
    newBrand = await brandService.create(Name)
    res.status(200).json({ result: "Success", addedBrand: newBrand });
  } catch (err) {
    return res.status(500).json({ result: "Fail", error: "Error creating brand" })
  }
});

// PUT change the name of the brand

router.put('/change/:id', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Brand']
    // #swagger.description = "Change the name of a brand"
    // #swagger.produces = ['text/html']
  try {
    const BrandId = parseInt(req.params.id);
    console.log(BrandId)
    const name = req.body.Name;
    if (!name) {
      res.status(400).json({ result: "Fail", error: "Name not provided" })
      return res.end();
    }
    if (BrandId == null || isNaN(BrandId)) {
      
      res.status(400).json({ result: "Fail", error: "Error getting brand id" })
      return res.end();
    }
    const BrandList = await brandService.getOneId(BrandId);
    console.log(BrandList)
    if (BrandList == null) {
      res.status(400).json({ result: "Fail", error: "Brand does not exist" })
      return res.end();
    }
    if (BrandList.Name == name) {
      res.status(400).json({ result: "Fail", error: "Brand already has this name" })
      return res.end();
    }
    await brandService.update(BrandId, name);
    const newBrandName = await brandService.getOneId(BrandId);
    res.status(200).json({ result: "Success", oldName: BrandList, newName: newBrandName })
    return res.end();


  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error editing brand" })
  }
});

// PUT change brand of the product
router.put('/product/:id', isAuth, isAdmin, async function (req, res, next) {
  // #swagger.tags = ['Brand']
    // #swagger.description = "Change the brand of a product"
    // #swagger.produces = ['text/html']
  try {
    const ProductId = parseInt(req.params.id);
    const newBrand = req.body.newBrand;
    if (!newBrand) {
      res.status(400).json({ result: "Fail", error: "newBrand not provided" })
      return res.end();
    }
    if (ProductId == null) {
      res.status(400).json({ result: "Fail", error: "Error getting product id" })
      return res.end();
    }
    const ProductList = await productService.getOne(ProductId);
    if (ProductList === null) {
      res.status(400).json({ result: "Fail", error: "Product does not exist" })
      return res.end();
    }
    const BrandList = await brandService.getOne(newBrand);
    if (BrandList === null) {
      res.status(400).json({ result: "Fail", error: "Brand does not exist" })
      return res.end();
    }

    const Brand = await brandService.getOne(newBrand);

    const oldBrandId = await productService.getOne(ProductId);

    const oldBrand = await brandService.getOneId(oldBrandId[0].BrandId)

    await productService.updateBrand(ProductId, Brand.Id);
    
    res.status(200).json({ Result: "Success", OldBrand: oldBrand.Name, NewBrand: newBrand })
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error editing brand" })
  }
});

// DELETE a brand
router.delete('/delete/:id', isAuth, isAdmin, async (req, res) => {
  // #swagger.tags = ['Brand']
  // #swagger.description = "Deletes a Brand if it is not linked to a product"
  // #swagger.produces = ['text/html']
  try {
    const BrandId = parseInt(req.params.id);
    if (BrandId == null) {
      res.status(400).json({ result: "Fail", error: "Error getting brand id" })
      return res.end();
    }
    const BrandList = await brandService.getOneId(BrandId);
    if (BrandList === null) {
      res.status(400).json({ result: "Fail", error: "Brand does not exist" })
      return res.end();
    }
    const usedBrand = await productService.getBrand(BrandId)
    if (usedBrand.length === 0) {
      await brandService.delete(BrandId);
      res.status(200).json({ result: "Success", deletedBrand: BrandList, message: "Brand deleted" })
      return res.end();
    } else {
      res.status(400).json({ result: "Fail", error: "Brand is in use" })
      return res.end();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error deleting brand" })
  }
});

module.exports = router;