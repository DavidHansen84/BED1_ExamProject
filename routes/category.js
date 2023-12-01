var express = require('express');
var router = express.Router();
const db = require('../models');
var CategoryService = require('../services/CategoryService');
var categoryService = new CategoryService(db);

/* GET home page. */
router.get('/', async function(req, res, next) {
  let categories = await categoryService.get();
  res.status(200).json({result: "Success", categories: categories});
  res.render('categories', { title: 'Express', categories: categories });
});

module.exports = router;
