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
router.post("/disable_two_factor_using_auth_app", verifyToken, async (req, res) => {
    await TwoFactorController.disableTwoFactorAuthUsingAuthApp(req, res);
});

//disable the 2-factor activation with code from the Email auth for none logged in users (first step)
router.post("/disable_two_factor_email_auth", async (req, res) => {
    await TwoFactorController.disableTwoFactorAuthForNoneLoggedInUsersFirstStep(req, res);
});

//verify the token entered by the user
router.post("/verify_email_token_for_two_factor_deactivation", async (req, res) => {
    await TwoFactorController.confirmEmailTokenForTwoFactorDeactivation(req, res);
});

//send token to phone provided by the user
router.post("/send_token_by_sms_for_two_factor_deactivation", async (req, res) => {
    await TwoFactorController.sendSmsForTwoFactorDeactivation(req, res);
});

//verify the token for phone provided by the user
router.post("/verify_token_for_phone", async (req, res) => {
    await TwoFactorController.confirmPhoneTokenForTwoFactorDeactivation(req, res);
});

//disable the two-factor de-activation request on an account, this route is authenticated
router.get("/initialize_disable_of_two_factor_deactivation_request", verifyToken, async (req, res) => {
    await TwoFactorController.initializeRequestToCancelTwoFactorDisableRequest(req, res);
});


//remove the 2-factor deactivation request on a users account, this route is authenticated
router.post("/initialize_disable_of_two_factor_deactivation_request", verifyToken, async (req, res) => {
    await TwoFactorController.cancelTwoFactorDisableRequest(req, res);
});

//this route is for admin nly
router.get("/initiate_deactivation_of_two_factor_on_accounts_with_two_factor_disable_request", verifyToken, async (req, res) => {
    await TwoFactorController.adminCallForTwoFactorDisableOnAccounts(req, res);
});

module.exports = router;