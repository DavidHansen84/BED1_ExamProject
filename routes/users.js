var express = require('express');
var jsend = require('jsend');
var router = express.Router();
var db = require("../models");
var crypto = require('crypto');
var UserService = require("../services/UserService")
var userService = new UserService(db);
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
router.use(jsend.middleware);
const isAuth = require('../middleware/middleware');
var jwt = require('jsonwebtoken')


// Post for registered users to be able to login
router.post("/login", jsonParser, async (req, res, next) => {
  // #swagger.tags = ['Auth']
    // #swagger.description = "Post for registered users to be able to login"
    // #swagger.produces = ['text/html']
    const { email, password } = req.body;
    if (email == null) {
      return res.status(400).json({status: "error", error: "Email is required."});
    }
    if (password == null) {
      return res.status(400).json({status: "error", error: "Password is required."});
    }
    userService.getOne(email).then((data) => {
        if(data === null) {
            return res.status(400).json({status: "error", error: "Incorrect email or password"});
        }
        crypto.pbkdf2(password, data.Salt, 310000, 32, 'sha256', function(err, hashedPassword) {
          if (err) { return cb(err); }
          if (!crypto.timingSafeEqual(data.EncryptedPassword, hashedPassword)) {
              return res.status(400).json({status: "error", error: "Incorrect email or password"});
          }
          let token;
          try {
            token = jwt.sign(
              { id: data.id, email: data.Email },
              process.env.TOKEN_SECRET,
              { expiresIn: "2h" }
            );
          } catch (err) {
            res.status(400).json({error: "Something went wrong with creating JWT token"})
          }
          res.status(200).jsend({status: "success" , result: "You are logged in", id: data.id, email: data.Email, token: token});
        });
    });
});

//TODO need to handle error and right signup details !!! 

// Post for new users to register / signup
router.post("/signup", async (req, res, next) => {
  // #swagger.tags = ['Auth']
    // #swagger.description = "Post for new users to register / signup"
    // #swagger.produces = ['text/html']
    const { name, email, password } = req.body;
    if (name == null) {
      return res.status(400).json({status: "error", error: "Name is required."});
    }
    if (email == null) {
      return res.status(400).json({status: "error", error: "Email is required."});
    }
    if (password == null) {
      return res.status(400).json({status: "error", error: "Password is required."});
    }
    var user = await userService.getOne(email);
    if (user != null) {
      return res.status(400).json({status: "error", error: "Provided email is already in use."});
    }
    var salt = crypto.randomBytes(16);
    console.log(name +" ," + email + " ," + password + " ," + salt.toString("hex"));
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return next(err); }
      userService.create(name, email, hashedPassword, salt)
      res.jsend.success({statusCode: 200,"result": "You created an account."});
    });
});

router.delete("/delete", isAuth, jsonParser, async (req, res, next) => {
  // #swagger.tags = ['Auth']
    // #swagger.description = "Deletes user, needs to be signed in"
    // #swagger.produces = ['text/html']
  let userEmail = req.body.email;
  if (userEmail == null) {
    return res.status(400).json({status: "error", error: "Email is required."});
  }
  var user = await userService.getOne(userEmail);
  if (user == null) {
    return res.status(400).json({status: "error", error: "No such user in the database"})
  }
  await userService.deleteUser(userEmail);
  res.jsend.success({"result": "You deleted account " + userEmail +  "."});
})


router.get('/fail', (req, res) => {
	return res.status(401).jsend.error({ statusCode: 401, message: 'message', data: 'data' });
});

module.exports = router;

