var express = require('express');
var router = express.Router();
const db = require('../models');
var StatusService = require('../services/StatusService');
var statusService = new StatusService(db);


/* GET status page. */
router.get('/', async function (req, res, next) {
  // #swagger.tags = ['Status']
    // #swagger.description = "Gets all the statuses"
    // #swagger.produces = ['text/html']
  try {
    let status = await statusService.get();
    res.status(200).json({ result: "Success", status: status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: "Error", error: "Error getting status" })
  }
});


module.exports = router;
