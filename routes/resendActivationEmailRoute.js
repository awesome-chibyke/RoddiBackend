var express = require("express");
var app = express();
var router = express.Router();

let responseObject = require("../controllers/ViewController");
responseObject = new responseObject();

var DbActions = require("../model/DbActions");
DbActions = new DbActions();

var RegisterController = require("../controllers/RegisterController");
RegisterController = new RegisterController();

var LoginController = require("../controllers/LoginController");
LoginController = new LoginController();

//validation helper
const validator = require("../helpers/validator");

router.use(
    express.urlencoded({
        extended: true,
    })
);

//validate login details
const validationRule = {
    email: "required|email",
};

//validate the user details
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

//use the middleware above validate,
router.use(
    "/resend-activation-email",
    validate
);
router.use(
    "/resend-login-auth-code",
    validate
);

//resend the activation email to the user for account activation
router.post("/resend-activation-email", async (req, res) => {
    await RegisterController.resendActivationEmail(req, res);
});

//resend the login auth code using email
router.post("/resend-login-auth-code", async (req, res) => {
    await LoginController.resendEmailAuthCode(req, res);
});

module.exports = router;