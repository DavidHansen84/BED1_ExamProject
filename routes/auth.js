var express = require('express');
var router = express.Router();
var db = require("../models");
var crypto = require('crypto');
var UserService = require("../services/UserService")
var userService = new UserService(db);
var MembershipService = require('../services/MembershipService');
var membershipService = new MembershipService(db);
var RoleService = require('../services/RoleService');
var roleService = new RoleService(db);
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json();
const { isAuth, isAdmin } = require('../middleware/middleware');
var jwt = require('jsonwebtoken');
const validator = require('email-validator');
var axios = require("axios");

let role

async function getRole(RoleId) {
  let roleInfo = await roleService.get(RoleId);
  
  role = roleInfo[0].dataValues.Name;
}

// Post for registered users to be able to login
router.post("/login", jsonParser, async (req, res, next) => {
  // #swagger.tags = ['Auth']
    // #swagger.description = "Post for registered users to be able to login"
    // #swagger.produces = ['text/html']
    try {
      const { Email, Password } = req.body;
    if (Email == null) {
      return res.status(400).json({status: "error", error: "Email is required."});
    }
    if (Password == null) {
      return res.status(400).json({status: "error", error: "Password is required."});
    }
    userService.getOne(Email).then((data) => {
              if(data === null) {
            return res.status(400).json({status: "error", error: "Incorrect email or password"});
        }
        getRole(data.RoleId);
        crypto.pbkdf2(Password, data.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
          if (err) { return cb(err); }
          if (!crypto.timingSafeEqual(data.password, hashedPassword)) {
              return res.status(400).json({status: "error", error: "Incorrect email or password"});
          }
          let token;
          try {
            console.log(role)
            token = jwt.sign(
              { id: data.Id, email: data.email, role: role },
              process.env.TOKEN_SECRET,
              { expiresIn: "2h" }
            );
          } catch (err) {
            res.status(400).json({error: "Something went wrong with creating JWT token"})
          }
          res.status(200).json({status: "success" , result: "You are logged in", id: data.Id, email: data.email, role: role, token: token});
        });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error logging in" })
  }
});

// Post for new users to register / signup
router.post("/register", async (req, res, next) => {
  // #swagger.tags = ['Auth']
    // #swagger.description = "Post for new users to register / signup"
    // #swagger.produces = ['text/html']
    try{
      const { Username, Password, Email, FirstName, LastName, Address, Telephone } = req.body;
    if (Username == null || Username.trim() === "") {
      return res.status(400).json({status: "error", error: "Username is required."});
    }
    if (Password == null || Password.trim() === "") {
      return res.status(400).json({status: "error", error: "Password is required."});
    }
    if (Email == null || Email.trim() === "") {
      return res.status(400).json({status: "error", error: "Email is required."});
    }
    // got this from https://singh-sandeep.medium.com/email-validation-in-node-js-using-email-validator-module-20b045b0c107
    const isValid = validator.validate(Email);

    if (!isValid) {
     res.status(400).json({ status: "Bad Request", error: "email must be in a valid email format (user@mail.com)"});
     return res.end();
    }
    if (FirstName == null || FirstName.trim() === "") {
      return res.status(400).json({status: "error", error: "FirstName is required."});
    }
    if (LastName == null || LastName.trim() === "") {
      return res.status(400).json({status: "error", error: "LastName is required."});
    }
    if (Address == null || Address.trim() === "") {
      return res.status(400).json({status: "error", error: "Address is required."});
    }
    if (Telephone == null || Telephone.trim() === "" ) {
      return res.status(400).json({status: "error", error: "Telephone number is required."});
    }
    if (isNaN(Telephone)) {
      return res.status(400).json({ status: "Bad Request", error: "Telephone number have to be a number"});
     
     } 
     if (!isNaN(FirstName) || !isNaN(LastName) || !isNaN(Username) || !isNaN(Address) ) {
      return res.status(400).json({ status: "Bad Request", error: "FirstName, LastName, Username and Addresss must be valid letters" });
     } 
    let membership = await membershipService.getOne("Bronze");
    let role = await roleService.getOne("User");
   
    var userEmail = await userService.getOne(Email);
    if (userEmail != null) {
      return res.status(400).json({status: "error", error: "Provided email is already in use."});
    }
    var userUsername = await userService.getUsername(Username);
    if (userUsername != null) {
      return res.status(400).json({status: "error", error: "Provided username is already in use."});
    }
    var salt = crypto.randomBytes(16);
    crypto.pbkdf2(Password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return next(err); }
      userService.create(Username, hashedPassword, Email, FirstName, LastName, Address, Telephone, salt, membership.Id, role.Id)
      res.status(200).json({status: "success", result: "You created an account."});
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Fail", error: "Error registrering user" })
  }
});

router.delete("/delete", isAuth, isAdmin, jsonParser, async (req, res, next) => {
  // #swagger.tags = ['Auth']
    // #swagger.description = "Deletes user, needs to be signed in"
    // #swagger.produces = ['text/html']
    try {
  let userEmail = req.body.email;
  console.log(userEmail);
  if (userEmail == null) {
    return res.status(400).json({status: "error", error: "Email is required."});
  }
  var user = await userService.getOne(userEmail);
  if (user == null) {
    return res.status(400).json({status: "error", error: "No such user in the database"})
  }
  const role = await roleService.get(user.dataValues.RoleId)
  if ( role[0].Name == "Admin" ) {
    return res.status(400).json({status: "error", error: "Cannot delete Admin"})
  }
  await userService.deleteUser(userEmail);
  res.status(200).json({result: "You deleted account " + userEmail +  "."});
} catch (err) {
  console.error(err);
  res.status(500).json({ result: "Fail", error: "Error deleting user" })
}
})


module.exports = router;

