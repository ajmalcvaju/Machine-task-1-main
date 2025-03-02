const express = require("express");
const router = express.Router();
const parsingController = require("../controllers/parsingController");

router.post("/", parsingController.postData);

module.exports = router;
