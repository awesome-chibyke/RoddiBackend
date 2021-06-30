var express = require("express");
var app = express();
var router = express.Router();

let responseObject = require("../controllers/ViewController");
responseObject = new responseObject();

const verifyToken = require("../helpers/CheckTokenExistense");//middleware that detects the token and passes to req

var DbActions = require("../model/DbActions");
DbActions = new DbActions();

var TwoFactorController = require("../controllers/TwoFactorController");
TwoFactorController = new TwoFactorController();

router.use(
    express.urlencoded({
        extended: true,
    })
);

//activate the use of o auth application
router.get("/activate_two_factor_auth", verifyToken, async (req, res) => {
    TwoFactorController.createSecret(req, res);
});

//finalise two factor activation
router.post("/finalise_two_factor_activation",verifyToken,
    async (req, res) => {
        TwoFactorController.finalActivationForTwoFactor(req, res);
    }
);

//resend the activation email to the user for account activation
router.post("/disable_two_factor_using_auth_app", async (req, res) => {
    await TwoFactorController.disableTwoFactorAuthUsingAuthApp(req, res);
});

//disable the 2-factor activation with code from the auth app
router.post("/disable_two_factor_email_auth", async (req, res) => {
    await TwoFactorController.disableTwoFactorAuthUsingOTP(req, res);
});

module.exports = router;