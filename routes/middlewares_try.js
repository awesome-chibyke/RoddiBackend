var express = require("express");
//contollers
var testController = require("../modules/TestController");

var router = express();
var router = express.Router();

var testObj = new testController();

const checkOption = function (req, res, next) {
  if (req.params.option === "yes") {
    throw new Error("It actually worked");
  }
  next();
};

router.use("/test/:option", checkOption);

router.get("/", function (req, res) {
  res.send("main entry point");
});

router.get("/test/:option", async function (req, res) {
  let value = await testObj.getReal();
  res.json(value);
});

router.get("/store", async function (req, res) {
  ///middle_test/store
  let value = await testObj.store();
  res.json(value);
});

router.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = router; //
