var express = require("express");
let responseObject = require("../controllers/ViewController");
var PhoneVerificationController = require("../controllers/PhoneVerificationController");
PhoneVerificationController = new PhoneVerificationController();
var verifyToken = require("../helpers/CheckTokenExistense")
responseObject = new responseObject();
var DbActions = require("../model/DbActions");
DbActions = new DbActions();

//validation helper
const validator = require("../helpers/validator");

var router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

//validate the datas for the verification
const PhoneNumberVerification = {
  phone: "required|numeric",
  country_code: "required|numeric"
  //gender: "string",
};

const validatePhone = (req, res, next) => {
  validator(req.body, PhoneNumberVerification, {}, (err, status) => {
      
    if (!status) {
      responseObject.setStatus(false);
      responseObject.setMessage(err.errors);
      res.json(responseObject.sendToView());
    } else {
      next();
    }
  });
};

//check if the phone number is unique
const checkForUniqueNumber = async (req, res, next) => {
  let phone = req.body.phone;
  try {
    let userDetails = await DbActions.selectSingleRow("users", {
      filteringConditions: [["phone", "=", phone]],
    });

    if (typeof userDetails === "object") {
      throw new Error("Phone Number already exists");
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

router.use("/", validatePhone, verifyToken, checkForUniqueNumber);

//call the activate user class
router.post("/", verifyToken, async (req, res) => {
  PhoneVerificationController.VerifyPhone(req, res);
});

module.exports = router;
