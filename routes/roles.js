var express = require('express');
var router = express.Router();
const db = require('../models');
var RoleService = require('../services/RoleService');
var roleService = new RoleService(db);


/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    let roles = await roleService.getAll();
    res.status(200).json({ result: "Success", roles: roles });
  } catch (err) {
    res.status(400).json({ result: "Fail", error: "Error getting roles" });
  }
});

module.exports = router;
