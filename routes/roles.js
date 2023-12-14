var express = require('express');
var router = express.Router();
const db = require('../models');
var RoleService = require('../services/RoleService');
var roleService = new RoleService(db);


/* GET home page. */
router.get('/', async function (req, res, next) {
  // #swagger.tags = ['Roles']
    // #swagger.description = "Gets all the roles"
    // #swagger.produces = ['text/html']
  try {
    let roles = await roleService.getAll();
    res.status(200).json({ result: "Success", roles: roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Error", error: "Error getting roles" })
  }
});

module.exports = router;
