var express = require("express");
let responseObject = require("../controllers/ViewController");
let EditProfileController = require("../controllers/EditProfileController");
let TwoFactorController = require("../controllers/TwoFactorController");
let UserController = require("../controllers/UserController");
const ErrorHandler = require("../helpers/ErrorHandler");
const verifyToken = require("../helpers/CheckTokenExistense");
let PhoneVerifyController = require("../controllers/PhoneVerifyController");
const validator = require("../helpers/validator");
const {storage, fileFilter, limits} = require('../helpers/FileUploadHelpers')
let multer = require("multer");

// Instantiate Functions
EditProfileController = new EditProfileController();
UserController = new UserController();
responseObject = new responseObject();
TwoFactorController = new TwoFactorController();
PhoneVerifyController = new PhoneVerifyController();

// Call Express
var router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

//validate the datas for phone verification
const PhoneNumberValidation = {
  phone: "required|numeric",
  country_code: "required|numeric",
  token: "required|numeric",
  token_type: "required|string",
};

const validatePhones = (req, res, next) => {
  validator(req.body, PhoneNumberValidation, {}, (err, status) => {
    if (!status) {
      responseObject.setStatus(false);
      responseObject.setMessage(err.errors);
      res.json(responseObject.sendToView());
    } else {
      next();
    }
  });
};

//validate the datas for the activation
const AccountActivationValidationRule = {
  email: "required|email",
  token: "required|numeric",
  token_type: "required|string",
  //gender: "string",
};

const validate = (req, res, next) => {
  validator(req.body, AccountActivationValidationRule, {}, (err, status) => {
    if (!status) {
      responseObject.setStatus(false);
      responseObject.setMessage(err.errors);
      res.json(responseObject.sendToView());
    } else {
      next();
    }
  });
};

//validation for two factor final activation
const twoFactorAuthTokenValidation = {
  token: "required|numeric",
  //gender: "string",
};

const validateTwoFactorAuthFinaleValues = (req, res, next) => {
  // console.log(req.body);
  validator(req.body, twoFactorAuthTokenValidation, {}, (err, status) => {
    if (!status) {
      responseObject.setStatus(false);
      responseObject.setMessage(err.errors);
      res.json(responseObject.sendToView());
    } else {
      next();
    }
  });
};

router.use("/activate_account", validate);

router.use(
  "/finalise_two_factor_activation",
  validateTwoFactorAuthFinaleValues
);

router.use(function (err, req, res, next) {
  console.error(err.stack);
  //responseObject.setStatus(false);
  responseObject.setMessage({
    general_error: ["Token was not supplied, please login"],
  });
  responseObject.setMesageType("logout");
  res.json(responseObject.sendToView());
});

router.use("/validate_phone", validatePhones);

//call the edit user class
router.post("/", verifyToken, async (req, res) => {
  EditProfileController.edit(req, res);
});

router.post("/activate_account", async (req, res) => {
  UserController.ActivateAccount(req, res);
});

router.post("/validate_phone", async (req, res) => {
  PhoneVerifyController.verify(req, res);
});

//activate the use of o auth application
router.get("/activate_two_factor_auth", verifyToken, async (req, res) => {
  TwoFactorController.createSecret(req, res);
});

//generate a new token
router.get("/generate_token", verifyToken, async (req, res) => {
  TwoFactorController.generateToken(req, res);
});

//finalise two factor activation
router.post(
  "/finalise_two_factor_activation",
  verifyToken,
  async (req, res) => {
    TwoFactorController.finalActivationForTwoFactor(req, res);
  }
);

let maxSize = 1000;

var upload = multer({ storage: storage('./files/government_id/'), fileFilter:fileFilter(['png', 'jpg', 'jpeg', 'gif']), limits: { fileSize: maxSize } });

router.route("/upload_id_card")
/* replace foo-bar with your form field-name verifyToken */
    .post(upload.single("upload_id_card"), function(req, res){
      EditProfileController.uploadIdCard(req, res);
    }, (error, req, res, next) => {

  res.status(400).send({ error: error.message });

})

router.use(function (err, req, res, next) {
  //console.error(err.stack);
  //responseObject.setStatus(false);
  responseObject.setMessage({
    general_error: ["Token was not supplied, please login"],
  });
});

module.exports = router;
