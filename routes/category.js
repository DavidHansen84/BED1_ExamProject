var express = require('express');
var router = express.Router();
const db = require('../models');
const { isAuth, isAdmin } = require('../middleware/middleware');
var CategoryService = require('../services/CategoryService');
var categoryService = new CategoryService(db);
var ProductService = require('../services/ProductService');
var productService = new ProductService(db);


// need to add a API to change the category of a product 


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
router.post('/add', isAuth, isAdmin, async function (req, res, next) {

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
router.put('/change/:id', isAuth, isAdmin, async function (req, res, next) {
  try {
    const CategoryId = parseInt(req.params.id);
    const name = req.body.Name;
    if (!name) {
      res.status(400).json({ result: "Fail", error: "Name not provided" })
      return res.end();
    }
    if (CategoryId == null || isNaN(CategoryId)) {
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

// PUT change category of the product
router.put('/product/:id', isAuth, isAdmin, async function (req, res, next) {
  try {
    const ProductId = parseInt(req.params.id);
    const newCategory = req.body.newCategory;
    if (!newCategory) {
      res.status(400).json({ result: "Fail", error: "newCategory not provided" })
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
    const CategoryList = await categoryService.getOne(newCategory);
    if (CategoryList === null) {
      res.status(400).json({ result: "Fail", error: "Category does not exist" })
      return res.end();
    }

    const Category = await categoryService.getOne(newCategory);

    const oldCategoryId = await productService.getOne(ProductId);

    const oldCategory = await categoryService.getOneId(oldCategoryId[0].CategoryId)

    await productService.updateCategory(ProductId, Category.Id);
    
    res.status(200).json({ Result: "Success", OldCategory: oldCategory.Name, NewCategory: newCategory })
    
  } catch (err) {
    console.error(err);
    res.status(400).json({ result: "Fail", error: "Error editing category" })
  }
});

// DELETE a category
router.delete('/delete/:id', isAuth, isAdmin, async (req, res) => {
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
