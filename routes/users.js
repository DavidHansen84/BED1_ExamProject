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

router.put('/edit/:id', async function (req, res, next) {
  try {
  let userExists;
  const userId = parseInt(req.params.id);
  const { email, firstName, lastName, role, username, telephoneNumber } = req.body;

  if (!userId) {
    res.status(400).json({
      result: "Fail", error: "id must be provided in the parameters"
    })
    return res.end();
  }
   
  if (!email) {
    res.status(400).json({
      result: "Fail", error: "email must be provided"
    })
    return res.end();
  }

  if (!firstName) {
    res.status(400).json({
      result: "Fail", error: "firstName must be provided"
    })
    return res.end();
  }

  if (!lastName) {
    res.status(400).json({
      result: "Fail", error: "lastName must be provided"
    })
    return res.end();
  }

  if (!role) {
    res.status(400).json({
      result: "Fail", error: "role must be provided"
    })
    return res.end();
  }

  if (!username) {
    res.status(400).json({
      result: "Fail", error: "username must be provided"
    })
    return res.end();
  }

  if (!telephoneNumber) {
    res.status(400).json({
      result: "Fail", error: "telephoneNumber must be provided"
    })
    return res.end();
  }

  userExists = await userService.getOne(email);

  if (!userExists) {
    res.status(400).json({
      result: "Fail", error: "User does not exist"
    })
    return res.end();
  }

  await userService.update(userId, email, firstName, lastName, role, username, telephoneNumber)
  let newUser = await userService.getOne(email);

  res.status(200).json({ result: "Success", oldData: userExists, newData: newUser });
  } catch (err) {
    res.status(400).json({ result: "Fail", error: "Error updating user" });
  }
});

module.exports = router;
