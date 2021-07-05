var express = require("express");
let responseObject = require("../controllers/ViewController");
var PhoneVerificationController = require("../controllers/PhoneVerificationController");
PhoneVerificationController = new PhoneVerificationController();
var verifyToken = require("../helpers/CheckTokenExistense")
responseObject = new responseObject();
var DbActions = require("../model/DbActions");
DbActions = new DbActions();

var router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

//this route regiters a phone number and also sends a verification token to the phone number
router.post("/", verifyToken, async (req, res) => {
  PhoneVerificationController.saveUserPhoneNumberANdSendVerificationCode(req, res);
});

//resend verification token to user phone number
router.post("/resend_token_to_phone_number", verifyToken, async (req, res) => {
  PhoneVerificationController.ResendVerificationCode(req, res);
});

//phone number verification route
router.post("/verify_phone_number", verifyToken, async (req, res) => {
  PhoneVerificationController.verifyPhoneNumber(req, res);
});

module.exports = router;
