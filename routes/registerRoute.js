var express = require("express");
var app = express();
var router = express.Router();

let responseObject = require("../controllers/ViewController");
responseObject = new responseObject();

var DbActions = require("../model/DbActions");
DbActions = new DbActions();

var RegisterController = require("../controllers/RegisterController");
RegisterController = new RegisterController();

//validation helper
const validator = require("../helpers/validator");

router.use(
  express.urlencoded({
    extended: true,
  })
);

//validate register details
const validationRule = {
  email: "required|email",
  password: "required|string|min:6",
};//confirmed

//validate the user details
const validate = (req, res, next) => {
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      responseObject.setStatus(false);//err.errors
      responseObject.setMessage(req.body);
      res.json(responseObject.sendToView());
    } else {
      next();
    }
  });
};

//check if the emaill is unique
const checkForUniqueEmail = async (req, res, next) => {
  let email = req.body.email;
  try {
    let userDetails = await DbActions.selectSingleRow("users", {
      filteringConditions: [["email", "=", email]],
    });

    if (typeof userDetails === "object") {
      throw new Error("Email address already exists");
    }

    if (typeof userDetails === "undefined") {
      next();
    }
  } catch (e) {
    responseObject.setStatus(false);
    responseObject.setMessage({ general_error: [e.message] });
    res.json(responseObject.sendToView());
  }
};

//check for the refferral id
const checkRefId = async (req, res, next) => {
  let refferralId = req.body.referral_id;
  if (refferralId === "" || refferralId === null) {
    next();
  } else {
    try {
      let userDetails = await DbActions.selectSingleRow("users", {
        filteringConditions: [["referral_id", "=", refferralId]],
      });

      if (typeof userDetails === "object") {
        next();
      }

      if (typeof userDetails === "undefined") {
        throw new Error(
          "Referral ID does not exist, please make sure the user with the ID is already registered"
        );
      }
    } catch (e) {
      responseObject.setStatus(false);
      responseObject.setMessage({ general_error: [e.message] });
      res.json(responseObject.sendToView());
    }
  }
};



//use the middleware above validate,
router.use(
  "/",
  validate,
  checkForUniqueEmail,
  checkRefId
);

//create the route that recives the incoming request
router.post("/", async (req, res) => {
  await RegisterController.register(req, res);
});

module.exports = router;
