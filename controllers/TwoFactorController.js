var speakeasy = require("speakeasy");
var QRCode = require("qrcode");
const responseObject = require("./ViewController");
const authData = require("../helpers/AuthenticateLogin");
const AuthenticationCode = require("../helpers/AuthenticationCode");
const ErrorHandler = require("../helpers/ErrorHandler");
const User = require("../model/User");
const Settings = require("../model/Settings");
const validator = require("../helpers/validator");
const AccountAuthForTwoFactorDeactivation = require("../Emails/EmailTemplates/AccountAuthForTwoFactorDeactivation");

class TwoFactorController {
  constructor() {
    this.responseObject = new responseObject();
    this.User = new User();
    this.Settings = new Settings();
    this.AuthenticationCode = new AuthenticationCode();
  }

  valdateFunction(req, ValidationRule){

    validator(req.body, ValidationRule, {}, (err, status) => {
      if (status === false) {
        this.errorMessage = err;
      }
      this.errorStatus = status;
    })
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
          message_type: "normal"
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

  //disable the 2-factor auth using th auth app
  async disableTwoFactorAuthUsingAuthApp(req, res) {
    try {
      let email = req.body.email;
      let userObject = await this.User.selectOneUser([["email", "=", email]]);
      if (userObject === false) {
        throw new Error("Invalid User details supplied");
      }

      let verifyUser = await this.User.verifyAToken(req, userObject);
      if (verifyUser.status === false) {
        throw new Error(verifyUser.message);
      }

      //diable the two factor authentication and remove authentication from user account
      let updateUserObject = await this.User.updateUser({
        unique_id:userObject.unique_id,
        auth_type:null
      });

      this.responseObject.setMesageType("normal");
      let userObjectForView = await this.User.returnUserForView(updateUserObject);
      this.responseObject.setData({user: userObjectForView});
      this.responseObject.setStatus(true);
      this.responseObject.setMessage("you have successfully disabled 2-factor Authentication for your application");
      res.status(200).json(this.responseObject.sendToView());

    } catch (e) {
      //send tthe error to the views
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({ general_error: [ErrorHandler(e)] });
      res.json(this.responseObject.sendToView());
    }
  }

  //generate a token based on current timestamp
  generateToken(req, res) {
    this.User.generateToken(req);
  }

  //disable 2-factor for non-logged in user
  //disable two factor authentication using OTP from APP
  //identify user email and send otp
  //identify user phone and send otp
  //if user has id make user supply his id number
  async disableTwoFactorAuthForNoneLoggedInUsersFirstStep(req, res){

    try{
      //validation
      let validationRule = {
        email: "required|string"
      };

      this.valdateFunction(req, validationRule);
      if(this.errorStatus === false){
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      //get the user email
      let email = req.body.email;

      //select the user with the email from the db
      let userObject = await this.User.selectOneUser([
        ['email', '=', email]
      ]);
      if(userObject === false){
        throw new Error('Email Address Does not exist');
      }

      //create the token to be sent
      let token = await this.AuthenticationCode.createActivationCode(userObject, this.AuthenticationCode.disable_two_factor_type);

      //send token to email
      let sendMail = await this.sendEmailForAccountValidation(userObject, token);
      if(sendMail.status === true){
        this.responseObject.setData({ email: email });
        this.responseObject.setStatus(true);
        this.responseObject.setMessage(
            "An authentication token has been sent to the email address provided. please provide token to continue"
        );
        res.status(200).json(this.responseObject.sendToView());
      }


    }catch(err){
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }

  }

  async confirmTokenForTwoFactorDeactivation(req, res){

    //validation
    let validationRule = {
      email: "required|email"
    };

    this.valdateFunction(req, validationRule);
    if(this.errorStatus === false){
      this.responseObject.setStatus(false);
      this.responseObject.setMessage(this.errorMessage.errors);
      return res.json(this.responseObject.sendToView());
    }

  }

  //do the actual mail sending to the users account
  async sendEmailForAccountValidation(userObject, token, count = 0){

    let settingsDetails = await this.DbActions.selectSingleRow("settings", {
      filteringConditions: [["id", "=", 1]],
    });

    //get the template for the mail
    let emailSubject = 'Account Validation for 2-Factor Deactivation';
    let fullName = this.User.returnFullName(userObject);
    let emailTemplate = AccountAuthForTwoFactorDeactivation(fullName,emailSubject,settingsDetails,token);

    //send a welcome/activation email to the user
    settingsDetails.expiration_time = this.AuthenticationCode.code_expiration_time;
    let mailSetup = MailSetups(userObject.email,emailSubject,emailTemplate,settingsDetails);

    let mailSender = await mailler(mailSetup);
    count++//increment the count
    if(mailSender.status === false && count < 3){
      return await this.sendEmailForAccountValidation(userObject, token);
    }
    return mailSender
  }

}
module.exports = TwoFactorController;
