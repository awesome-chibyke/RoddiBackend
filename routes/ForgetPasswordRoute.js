var express = require("express");
var app = express();
var router = express.Router();

let responseObject = require("../controllers/ViewController");
responseObject = new responseObject();

var DbActions = require("../model/DbActions");
DbActions = new DbActions();

var ForgotPasswordController = require("../controllers/ForgotPasswordController");
ForgotPasswordController = new ForgotPasswordController();

router.use(
    express.urlencoded({
        extended: true,
    })
);

//resend the activation email to the user for account activation
router.post("/", async (req, res) => {
    await ForgotPasswordController.sendForgotPasswordMessage(req, res);
});

//confirm the password token
router.post("/confirm-forgot-password-token", async (req, res) => {
    await ForgotPasswordController.confirmForgotPasswordToken(req, res);
});


router.post("/change-password", async (req, res) => {
    await ForgotPasswordController.changeUserPassword(req, res);
});

module.exports = router;