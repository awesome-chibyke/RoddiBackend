var speakeasy = require("speakeasy");
var QRCode = require("qrcode");
const responseObject = require("./ViewController");
const authData = require("../helpers/AuthenticateLogin");
const ErrorHandler = require("../helpers/ErrorHandler");
const User = require("../model/User");
const Settings = require("../model/Settings");

class TwoFactorController {
  constructor() {
    this.responseObject = new responseObject();
    this.User = new User();
    this.Settings = new Settings();
  }
  async createSecret(req, res) {
    try {
      //authenticate user
      let userObject = await authData(req);
      userObject = await this.User.selectOneUser([["unique_id", "=", userObject.user.unique_id]]);

      let settings = await this.Settings.selectSettings([["id", "=", 1]]);
      if (settings === false) {
        throw new Error("Settings can not be accessed at this time");
      }

      //create the secret for the transaction
      let fullName = this.User.returnFullName(userObject);
      var secret = speakeasy.generateSecret({ name: settings.site_name+' ('+fullName+')' });

      // Example for storing the secret key somewhere (varies by implementation):
      let two_factor_temp_secret = secret.base32;

      //update the user with the new key provided
      let updatedUserObject = await this.User.updateUser({
        two_factor_temp_secret: two_factor_temp_secret,
        unique_id: userObject.unique_id,
      });

      // Get the data URL of the authenticator URL
      QRCode.toDataURL(secret.otpauth_url, function (err, data_url) {
        // Display this data URL to the user in an <img> tag
        // Example:
        //write('<img src="' + data_url + '">');
        res.status(200).json({
          status: true,
          message: "Token was successfully created",
          data: { bar_code_data: data_url },
          message_type: "normal",
          all_ibj:secret
        });
      });
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(e)],
      });
      res.json(this.responseObject.sendToView());
    }
  }

  //final activation of the user for two factor authentication
  async finalActivationForTwoFactor(req, res) {
    try {
      //authenticate user
      let userObject = await authData(req);

      //get the token from the request body
      let tokenSupplied = req.body.token;

      //select the temporal key that was saved for  the two factor
      //select the user involved
      let selectedUserObject = await this.User.selectOneUser([
        ["unique_id", "=", userObject.user.unique_id],
      ]);
      if (selectedUserObject === false) {
        throw new Error("Invalid User details supplied");
      }
      let base32secret = selectedUserObject.two_factor_temp_secret;

      //check the token supplied to make sure its validate
      // Use verify() to check the token against the secret
      var verified = speakeasy.totp.verify({
        secret: base32secret,
        encoding: "base32",
        token: tokenSupplied,
      });
      if (verified === false) {
        throw new Error("Invalid Token");
      }

      //show the success message and save the secret as main key\
      let updatedUserObject = this.User.updateUser({
        two_factor_temp_secret: null,
        two_factor_secret: selectedUserObject.two_factor_temp_secret,
        auth_type: "google_auth",
        unique_id: selectedUserObject.unique_id,
      });

      //send a meesage success message to the view
      this.responseObject.setMesageType("normal");

      let userObjectForView = this.User.returnUserForView(updatedUserObject);

      this.responseObject.setData({ user: userObjectForView });
      this.responseObject.setStatus(true);
      this.responseObject.setMessage(
        "You have successfully activated Two Factor Authentication"
      );
      res.status(200).json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(e)],
      });
      res.json(this.responseObject.sendToView());
    }
  }

  //disable two factor authentication using OTP from APP
  //identify user email and send otp
  //identify user phone and send otp
  //if user has id make user supply his id number
  async disableTwoFactorAuthUsingOTP(req, res) {
    try {
      //authenticate user
      let userObject = await authData(req);

      //get the token from the request body
      let tokenSupplied = req.body.token;

      //select the temporal key that was saved for  the two factor
      //select the user involved
      let selectedUserObject = await this.User.selectOneUser([
        ["unique_id", "=", userObject.user.unique_id],
      ]);
      if (selectedUserObject === false) {
        throw new Error("Invalid User details supplied");
      }
      let base32secret = selectedUserObject.two_factor_temp_secret;

      //check the token supplied to make sure its validate
      // Use verify() to check the token against the secret
      var verified = speakeasy.totp.verify({
        secret: base32secret,
        encoding: "base32",
        token: tokenSupplied,
      });
      if (verified === false) {
        throw new Error("Invalid Token");
      }

      //show the success message and save the secret as main key\
      let updatedUserObject = this.User.updateUser({
        two_factor_temp_secret: null,
        two_factor_secret: null,
        auth_type: "email",
        unique_id: selectedUserObject.unique_id,
      });

      //send a meesage success message to the view
      this.responseObject.setMesageType("normal");

      let userObjectForView = this.User.returnUserForView(updatedUserObject);

      this.responseObject.setData({ user: userObjectForView });
      this.responseObject.setStatus(true);
      this.responseObject.setMessage(
          "You have successfully activated Two Factor Authentication"
      );
      res.status(200).json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(e)],
      });
      res.json(this.responseObject.sendToView());
    }
  }


  //generate a token based on current timestamp
  generateToken(req, res) {
    this.User.generateToken(req);
  }
}
module.exports = TwoFactorController;
