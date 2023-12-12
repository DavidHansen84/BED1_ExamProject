var express = require('express');
var router = express.Router();
const db = require('../models');
var UserService = require('../services/UserService');
var userService = new UserService(db);
var MembershipService = require('../services/MembershipService');
var membershipService = new MembershipService(db);
var RoleService = require('../services/RoleService');
var roleService = new RoleService(db);


/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    let users = await userService.get();
    let memberships = await membershipService.get();
    let roles = await roleService.getAll();
    res.status(200).json({ result: "Success", users: users, memberships: memberships, roles: roles });
  } catch (err) {
    res.status(400).json({ result: "Fail", error: "Error getting users" });
  }
});

module.exports = router;
