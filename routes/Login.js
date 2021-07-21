var express = require("express");
let responseObject = require("../controllers/ViewController");
responseObject = new responseObject();
const verifyToken = require("../helpers/CheckTokenExistense");

//validation helper
const validator = require("../helpers/validator");

let LoginController = require("../controllers/LoginController");
LoginController = new LoginController();

var router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

//validate login details
const validationRule = {
  email: "required|email",
  password: "required|string",
  //gender: "string",
};

//validation rule for a factor authentication
const validationRuleForTwoFactor = {
  email: "required|email",
  token: "required|numeric",
};

//validate login details
const validate = (req, res, next) => {
  validator(req.body, validationRule, {}, (err, status) => {
    if (!status) {
      responseObject.setStatus(false);
      responseObject.setMessage(err.errors);
      res.json(responseObject.sendToView());
    } else {
      next();
    }
  });
};

//validate values for two factor authentication
const validateTwoFactorDetails = (req, res, next) => {
  validator(req.body, validationRuleForTwoFactor, {}, (err, status) => {
    if (!status) {
      responseObject.setStatus(false);
      responseObject.setMessage(err.errors);
      res.json(responseObject.sendToView());
    } else {
      next();
    }
  });
};

router.use("/login_action", validate);
router.use("/authenticate_login_with_two_factor", validateTwoFactorDetails);

//validation ends

router.post("/", async (req, res) => {
  await LoginController.loginAction(req, res);
});

router.post("/authenticate", async (req, res) => {
  await LoginController.AuthenticateLoginCode(req, res);
}); //email

//validate the login using 2 factor auth
router.post("/authenticate_login_with_two_factor", async (req, res) => {
  await LoginController.authenticateLoginWithTwoFactor(req, res);
});

router.post("/disable_login/:unique_id", verifyToken, async (req, res) => {
  LoginController.disableAccount(req, res);
});

module.exports = router;
