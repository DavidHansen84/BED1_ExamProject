var express = require('express');
var router = express.Router();
const db = require('../models');
var BrandService = require('../services/BrandService');
var brandService = new BrandService(db);

/* GET home page. */
router.get('/', async function(req, res, next) {
  let brands = await brandService.get();
  res.status(200).json({result: "Success", brands: brands});
  res.render('brands', { title: 'Express', brands: brands });
});

module.exports = router;
