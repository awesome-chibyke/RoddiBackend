var express = require("express");
var router = express.Router();

//middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

let checkWhat = function (req, res) {
  if (req.params.love === "what") {
    throw new Error("It got here");
  }
  next();
};

router.use("/about/:love", checkWhat);

// define the home page route
router.get("/", function (req, res) {
  res.send("main side");
});
// define the about route
router.get("/about", function (req, res) {
  res.send("About birds");
});

router.get("/about/:love", function (req, res) {
  res.send("About " + req.params.love);
});

router.use(function (err, req, res, next) {
  //console.log(err);
  res.status(500).send(err);
});

module.exports = router;
