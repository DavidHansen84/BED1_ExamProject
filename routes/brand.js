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
  try {
    let brand = await brandService.get();
    res.status(200).json({ result: "Success", categories: brand });
  } catch (err) {
    res.status(400).json({ result: "Fail", error: "Error getting brand" });
  }
});

// POST a new brand
router.post('/add', isAuth, isAdmin, async function (req, res, next) {

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
    return res.status(400).json({ result: "Fail", error: "Error creating brand" })
  }
});

// PUT change the name of the brand
router.put('/add/:id', isAuth, isAdmin, async function (req, res, next) {
  try {
    const BrandId = parseInt(req.params.id);
    const name = req.body.Name;
    if (!name) {
      res.status(400).json({ result: "Fail", error: "Name not provided" })
      return res.end();
    }
    if (BrandId == null) {
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
    res.status(400).json({ result: "Fail", error: "Error editing brand" })
  }
});

// DELETE a brand
router.delete('/delete/:id', isAuth, isAdmin, async (req, res) => {
  // #swagger.tags = ['Categories']
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
    res.status(400).json({ result: "Fail", error: "Error deleting brand" })
  }
});

module.exports = router;