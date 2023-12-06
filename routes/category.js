var express = require('express');
var router = express.Router();
const db = require('../models');
const isAuth = require('../middleware/middleware');
var CategoryService = require('../services/CategoryService');
var categoryService = new CategoryService(db);
var ProductService = require('../services/ProductService');
var productService = new ProductService(db);

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    let categories = await categoryService.get();
    res.status(200).json({ result: "Success", categories: categories });
  } catch (err) {
    res.status(400).json({ result: "Fail", error: "Error getting categories" });
  }
});

// POST a new category
router.post('/add', isAuth, async function (req, res, next) {

  const { Name } = req.body;
  try {
    if (!Name) {
      res.status(400).json({ result: "Fail", error: "Name of category must be provided" })
      return res.end();
    }
    let nameExist = await categoryService.getOne(Name)
    if (nameExist) {
      res.status(400).json({ result: "Fail", error: "Category name already exist" })
      return res.end();
    }
    newCategory = await categoryService.create(Name)
    res.status(200).json({ result: "Success", addedCategory: newCategory });
  } catch (err) {
    return res.status(400).json({ result: "Fail", error: "Error creating category" })
  }
});

// PUT change the name of the category
router.put('/add/:id', isAuth, async function (req, res, next) {
  try {
    const CategoryId = parseInt(req.params.id);
    const name = req.body.Name;
    if (!name) {
      res.status(400).json({ result: "Fail", error: "Name not provided" })
      return res.end();
    }
    if (CategoryId == null) {
      res.status(400).json({ result: "Fail", error: "Error getting category id" })
      return res.end();
    }
    const CategoryList = await categoryService.getOneId(CategoryId);
    if (CategoryList === null) {
      res.status(400).json({ result: "Fail", error: "Category does not exist" })
      return res.end();
    }
    if (CategoryList.Name == name) {
      res.status(400).json({ result: "Fail", error: "Category already has this name" })
      return res.end();
    }
    await categoryService.update(CategoryId, name);
    const newCategoryName = await categoryService.getOneId(CategoryId);
    res.status(200).json({ result: "Success", oldName: CategoryList, newName: newCategoryName })
    return res.end();


  } catch (err) {
    console.error(err);
    res.status(400).json({ result: "Fail", error: "Error editing category" })
  }
});

// DELETE a category
router.delete('/delete/:id', isAuth, async (req, res) => {
  // #swagger.tags = ['Categories']
  // #swagger.description = "Deletes a category if it is not linked to a product"
  // #swagger.produces = ['text/html']
  try {
    const CategoryId = parseInt(req.params.id);
    if (CategoryId == null) {
      res.status(400).json({ result: "Fail", error: "Error getting category id" })
      return res.end();
    }
    const CategoryList = await categoryService.getOneId(CategoryId);
    if (CategoryList === null) {
      res.status(400).json({ result: "Fail", error: "Category does not exist" })
      return res.end();
    }
    const usedCategory = await productService.getCategory(CategoryId)
    if (usedCategory.length === 0) {
      await categoryService.delete(CategoryId);
      res.status(200).json({ result: "Success", deletedCategory: CategoryList, message: "Category deleted" })
      return res.end();
    } else {
      res.status(400).json({ result: "Fail", error: "Category is in use" })
      return res.end();
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ result: "Fail", error: "Error deleting category" })
  }
});

module.exports = router;
