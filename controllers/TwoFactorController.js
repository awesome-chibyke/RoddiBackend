var speakeasy = require("speakeasy");
var QRCode = require("qrcode");
const responseObject = require("./ViewController");
const authData = require("../helpers/AuthenticateLogin");
const AuthenticationCode = require("../helpers/AuthenticationCode");
const ErrorHandler = require("../helpers/ErrorHandler");
const User = require("../model/User");
const Settings = require("../model/Settings");
const validator = require("../helpers/validator");
const ErrorMessages = require("../helpers/ErrorMessages");
const {SendGenericSms} = require("../helpers/SendGenericSms");
const MessageType = require("../helpers/MessageType");
const {sendGenericMails} = require("../Emails/GenericMailSender");
const date = require("date-and-time");
const AccountAuthForTwoFactorDeActivation = require("../Emails/EmailTemplates/AccountAuthForTwoFactorDeActivation");

//for mail sending
var mailler = require("../Emails/MailAccount");
const MailSetups = require("../Emails/MailSetups");

class TwoFactorController {
  constructor() {
    this.responseObject = new responseObject();
    this.User = new User();
    this.Settings = new Settings();
    this.AuthenticationCode = new AuthenticationCode();
    this.ErrorMessages = new ErrorMessages();
    this.MessageType = new MessageType();
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
      if (userObject === false) {
        let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.authentication_failed
        throw new Error(ErrorMessage);
      }

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
          data: { bar_code_data: data_url, otpauth_url:secret.otpauth_url },
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
        let errorMessage = this.ErrorMessages.ErrorMessageObjects.authentication_failed
        throw new Error(errorMessage);
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
      let updatedUserObject = await this.User.updateUser({
        two_factor_temp_secret: null,
        two_factor_secret: selectedUserObject.two_factor_temp_secret,
        auth_type: "google_auth",
        unique_id: selectedUserObject.unique_id,
      });

        let settingsDetails = this.Settings.selectSettings([["id", "=", 1]]);

        //send an sms to the user
        let message = "You have successfully activated Two-factor authentication on your account. ";
        if(updatedUserObject.phone_verification !== null){
            SendGenericSms(settingsDetails, message, selectedUserObject);
        }

      //send an email message to the user
        let emailSubject = "Successful Activation of Two-Factor Authentication";
        let fullName = this.User.returnFullName(selectedUserObject);
        message = message+"Please note that you will always have to provide the generated token from your authentication application for validation of sensitive activities you want to perform on your account.";
        await sendGenericMails(selectedUserObject, fullName, settingsDetails, emailSubject, message);

      //send a meesage success message to the view
      this.responseObject.setMesageType("normal");
      let userObjectForView = await this.User.returnUserForView(updatedUserObject);
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

        //validation
        let validationRule = {
            token: "required|numeric"
        };

        this.valdateFunction(req, validationRule);
        if(this.errorStatus === false){
            this.responseObject.setStatus(false);
            this.responseObject.setMessage(this.errorMessage.errors);
            return res.json(this.responseObject.sendToView());
        }

      //authenticate the user
      let userObject = await authData(req);
      userObject = userObject.user;

      userObject = await this.User.selectOneUser([["email", "=", userObject.email]]);
      if (userObject === false) {
        let errorMessage = this.ErrorMessages.ErrorMessageObjects.authentication_failed;
        throw new Error(errorMessage);
      }

      let verifyUser = await this.User.verifyAToken(req, userObject);
      if (verifyUser.status === false) {
        throw new Error(verifyUser.message);
      }

      //disable the two factor authentication and remove authentication from user account
      let updateUserObject = await this.User.updateUser({
            unique_id:userObject.unique_id,
            auth_type:null,
          two_factor_temp_secret:null,
          two_factor_secret:null
      });

        let settingsDetails = this.Settings.selectSettings([["id", "=", 1]]);//select the system settings

        //send an sms to the user
        let message = "You have successfully de-activated Two-factor authentication on your account. ";
        if(updateUserObject.phone_verification !== null){
            SendGenericSms(settingsDetails, message, userObject);
        }

        //send an email message to the user
        let emailSubject = "Successful De-Activation of Two-Factor Authentication";
        let fullName = this.User.returnFullName(userObject);
        await sendGenericMails(userObject, fullName, settingsDetails, emailSubject, message);

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

 //send token to email provided by the user for account validation
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
      if(userObject.auth_type !== 'google_auth'){//make sure user enabled the two factor auth
        throw new Error('Two-Factor Authentication is not enabled on your account');
      }

      //create the token to be sent
      let tokenDetails = await this.AuthenticationCode.createActivationCode(userObject, this.AuthenticationCode.disable_two_factor_with_email_auth);
        let token = tokenDetails.data;
      //send token to email
      let sendMail = await this.sendEmailForAccountValidation(userObject, token);
      if(sendMail.status === true){
        this.responseObject.setData({ email: email});
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

    //confirm the token sent to user email for two factor deactivation
  async confirmEmailTokenForTwoFactorDeactivation(req, res){

    try{
      //validation
      let validationRule = { token: "required|numeric", email: "required|email"};
      this.valdateFunction(req, validationRule);
      if(this.errorStatus === false){
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      //select the user involved
      let userObject = await this.User.selectOneUser([["email", "=", req.body.email]]);
      if (userObject === false) {
        let errorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user;
        throw new Error(errorMessage);
      }

      //verify the token returned
      let tokenAuthentication = await this.AuthenticationCode.verifyTokenValidity(req.body.token, this.AuthenticationCode.disable_two_factor_with_email_auth, userObject);
      if (tokenAuthentication.status === false) {
        this.responseObject.setMesageType(tokenAuthentication.message_type);
        throw new Error(tokenAuthentication.message);
      }

      //update the user verification level
      const now = new Date();
      let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");
      await this.User.updateUser({
        unique_id:userObject.unique_id,
        oauth_disable_steps:'email_auth',
        updated_at: currenctDate
      });

      //send a message to the view that token is correct
      this.responseObject.setData({ email: userObject.email});
      this.responseObject.setStatus(true);
      this.responseObject.setMessage(
          "Valid token, Your email address has been successfully authenticated. Please provide your phone number for further account validation"
      );
      res.status(200).json(this.responseObject.sendToView());
    }catch(err){
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }

  }

  //send an sms authentication code to user mobile phone
  async sendSmsForTwoFactorDeactivation(req, res){

    try{
      //validation of details returned
      let validationRule = { phone: "required|numeric", country_code:"required|numeric", email: "required|email"};
      this.valdateFunction(req, validationRule);
      if(this.errorStatus === false){
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      let phone = Number(req.body.phone);
      let email = req.body.email;
      let country_code = req.body.country_code;

      //select the user involved
      let userObject = await this.User.selectOneUser([["email", "=", email], ['phone', '=', phone], ['country_code', '=', country_code]]);
      if (userObject === false) {
        let errorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user
        throw new Error(errorMessage);
      }

      //create the token to be sent
      let tokenDetails = await this.AuthenticationCode.createActivationCode(userObject, this.AuthenticationCode.disable_two_factor_with_phone_auth);
      let token = tokenDetails.data;

      //get the settings details for the web site
      let settingsDetails = await this.Settings.selectSettings([["id", "=", 1]]);

        //send an sms to the user
        let message = "Your " +settingsDetails.site_name.toUpperCase() +" account authentication token for 2-factor deactivation: "+token+". Code expires in "+this.AuthenticationCode.code_expiration_time;
        if(userObject.phone_verification !== null){
            SendGenericSms(settingsDetails, message, userObject);
        }

      //send a message to the view that token is correct
      this.responseObject.setData({ email: userObject.email, phone:phone, country_code:country_code});
      this.responseObject.setStatus(true);
      this.responseObject.setMessage(
          "An authentication token has been sent to the phone number provided. please provide token to continue"
      );
      res.status(200).json(this.responseObject.sendToView());

    }catch(err){
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }

  }

  //do the actual mail sending to the users account
  async sendEmailForAccountValidation(userObject, token, count = 0){

    let settingsDetails = await this.Settings.selectSettings([
      ["id", "=", 1]
    ]);

    //get the template for the mail
    let emailSubject = 'Account Validation for 2-Factor Deactivation';
    let fullName = this.User.returnFullName(userObject);
    let emailTemplate = AccountAuthForTwoFactorDeActivation(fullName,emailSubject,settingsDetails,token);

    //send a welcome/activation email to the user
    settingsDetails.expiration_time = this.AuthenticationCode.code_expiration_time;
    let mailSetup = MailSetups(userObject.email,emailSubject,emailTemplate,settingsDetails);

    let mailSender = await mailler(mailSetup);
    count++//increment the count
    if(mailSender.status === false && count < 3){
      return await this.sendEmailForAccountValidation(userObject, token, count);
    }
    return mailSender
  }

  //confirm the token sent to user email for two factor deactivation
  async confirmPhoneTokenForTwoFactorDeactivation(req, res){

    try{

      //validation
      let validationRule = { token: "required|numeric", email: "required|email", phone:"required|numeric", country_code:"required|numeric"};
      this.valdateFunction(req, validationRule);
      if(this.errorStatus === false){
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      let phone = Number(req.body.phone);
      let email = req.body.email;
      let country_code = req.body.country_code;

      //select the user involved
      let userObject = await this.User.selectOneUser([["email", "=", email], ["phone", "=", phone], ["country_code", "=", country_code]]);
      if (userObject === false) {
        let errorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user
        throw new Error(errorMessage);
      }

      //verify the token returned
      let tokenAuthentication = await this.AuthenticationCode.verifyTokenValidity(req.body.token, this.AuthenticationCode.disable_two_factor_with_phone_auth, userObject);
      if (tokenAuthentication.status === false) {
        this.responseObject.setMesageType(tokenAuthentication.message_type);
        throw new Error(tokenAuthentication.message);
      }

      //update the user verification level
      const now = new Date();
      let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");
      await this.User.updateUser({
        unique_id:userObject.unique_id,
        oauth_disable_steps:'phone_auth',
        oauth_disable_request:'yes',
        oauth_disable_request_time :currenctDate,
        updated_at :currenctDate
      });

      //send a mail to the user that request has been cancelled
      let fullName = this.User.returnFullName(userObject);
      let settingsDetails = await this.Settings.selectSettings([["id", "=", 1]]);
      if (settingsDetails === false) {
        throw new Error("Settings can not be accessed at this time");
      }
      let emailSubject = "Successful Placement of 2-factor Authentication Deactivation Request";
      let message = "You have have successfully placed a request for 2-factor authentication deactivation on your account. Please note that 2-factor authentication will be disabled on your account "+this.User.AccountActionDelayTimeForAdminAction+" hours from the time this request was placed."
      await sendGenericMails(userObject, fullName, settingsDetails, emailSubject, message);

      //send a message to the view that token is correct
      this.responseObject.setData({ email: userObject.email});
      this.responseObject.setStatus(true);
      this.responseObject.setMessage(
          "Valid token, Your request for de-activation of 2-factor authentication on your account have been received and will be processed in the next "+this.User.AccountActionDelayTimeForAdminAction+" hours"
      );
      res.status(200).json(this.responseObject.sendToView());
    }catch(err){
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }

  }

  //initialize the request to cancel the 2-factor deactivation placed on an account
  async initializeRequestToCancelTwoFactorDisableRequest(req, res){
    //get the user involved
    let userObject = await authData(req);

    //select the user
    userObject = await this.User.selectOneUser([["unique_id", "=", userObject.user.unique_id]]);
    if (userObject === false) {
      let errorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user;
      throw new Error(errorMessage);
    }

    //send a response to view
    this.responseObject.setData();
    this.responseObject.setStatus(true);
    let MessageType = this.MessageType.returnMessageType('cancel_request_to_disble_two_factor');
    this.responseObject.setMesageType(MessageType);
    this.responseObject.setMessage(
        "Please Enter Code Generated By Your Authentication App"
    );
    res.status(200).json(this.responseObject.sendToView());
  }

  //remove the 2-factor deactivation request on a users account
  async cancelTwoFactorDisableRequest(req, res){

    try{
        //validation
        let validationRule = { token: "required|numeric"};
        this.valdateFunction(req, validationRule);
        if(this.errorStatus === false){
            this.responseObject.setStatus(false);
            this.responseObject.setMessage(this.errorMessage.errors);
            return res.json(this.responseObject.sendToView());
        }

      //get the user involved
      let userObject = await authData(req);
      userObject = userObject.user;

      //select the user
      userObject = await this.User.selectOneUser([["email", "=", userObject.email]]);
      if (userObject === false) {
        let errorMessage = this.ErrorMessages.ErrorMessageObjects.authentication_failed;
        throw new Error(errorMessage);
      }

      let verifyUser = await this.User.verifyAToken(req, userObject);
      if (verifyUser.status === false) {
        throw new Error(verifyUser.message);
      }

      //update the user row
      const now = new Date();
      let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");
      let UpdatedUserObject = await this.User.updateUser({
        unique_id:userObject.unique_id,
        oauth_disable_steps:null,
        oauth_disable_request:null,
        oauth_disable_request_time :null,
        updated_at :currenctDate
      });

      //send a mail to the user that request has been cancelled
      let fullName = this.User.returnFullName(userObject);
      let settingsDetails = await this.Settings.selectSettings([["id", "=", 1]]);
      if (settingsDetails === false) {
        throw new Error("Settings can not be accessed at this time");
      }
      let emailSubject = "Successful removal of 2-factor Deactivation Request";
      let message = "You have successfully removed the request for 2-factor deactivation placed on your account."
      await sendGenericMails(userObject, fullName, settingsDetails, emailSubject, message);

      //send a response to view
      this.responseObject.setData({ email: UpdatedUserObject});
      this.responseObject.setStatus(true);
      this.responseObject.setMessage(
          "2-factor request deactivation was successfully removed"
      );
      res.status(200).json(this.responseObject.sendToView());

    }catch(err){
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }



  }

  //remove 2 factor on a user account
  async deactivateTwoFactorAuthOnUsersAccounts(req, res){

    try{
      let allUsers = await this.User.selectAllUsersWhere([
        ['oauth_disable_steps', '=', 'phone_auth'],
        ['oauth_disable_request', '=', 'yes']
      ]);
      if (allUsers.length == 0) {
        let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.no_data
        return {
            status:false,
            message:ErrorMessage
        };
      }
      let userAccountUpdate = 0, UpdatedUserObject = {};

      //loop through the users
      for(let i in allUsers){

        //work on getting the expiration and current time
        let userObject = allUsers[i];
        let timeOfRequest = userObject.oauth_disable_request_time;
        let currentTime = new Date();
        let setTimeForTwoFactorDeactivation = date.addHours(timeOfRequest, this.User.AccountActionDelayTimeForAdminAction);
        currentTime = date.format(currentTime, "YYYY-MM-DD HH:mm:ss");
        setTimeForTwoFactorDeactivation = date.format(setTimeForTwoFactorDeactivation,"YYYY-MM-DD HH:mm:ss");

        //compare the dates
        if (currentTime < setTimeForTwoFactorDeactivation) {
          continue;
        }

        //update the user columns for 2factor deactivation
          UpdatedUserObject = await this.User.updateUser({
          unique_id:userObject.unique_id,
          auth_type:null,
          oauth_disable_steps:null,
          oauth_disable_request:null,
          oauth_disable_request_time :null,
          updated_at :currentTime
        });
          userAccountUpdate = 1;
      }//loop stops here

        if(userAccountUpdate == 1){
            return {
                status:true,
                message:'Request was successfully Executed',
                data:{user:UpdatedUserObject}
            };
        }

        return {
            status:false,
            message:'Requests Found are not yet up to '+this.User.AccountActionDelayTimeForAdminAction+' hours'
        };

    }catch(err){
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }

  }

    //call the disable two factor function manually
    async adminCallForTwoFactorDisableOnAccounts(req, res){
        try{

            //get the user involved
            let authenticateUser = await authData(req);

            let processTwoFactorDeactivationRequest = await this.deactivateTwoFactorAuthOnUsersAccounts(req, res);
            if(processTwoFactorDeactivationRequest.status === false){
                throw new Error(processTwoFactorDeactivationRequest.message);
            }
            //send response to the view
            let userObject = processTwoFactorDeactivationRequest.data.user;
            let userObjectForView = await this.User.returnUserForView(userObject);
            this.responseObject.setData({ email: userObjectForView});
            this.responseObject.setStatus(true);
            this.responseObject.setMessage(processTwoFactorDeactivationRequest.message);
            res.status(200).json(this.responseObject.sendToView());
        }catch(err){
            this.responseObject.setStatus(false);
            this.responseObject.setMessage({
                general_error: [ErrorHandler(err)],
            });
            res.json(this.responseObject.sendToView());
        }
    }

    //call the disable two factor function manually
    async autoCallForTwoFactorDisableOnAccounts(req, res){
        let processTwoFactorDeactivationRequest = await this.deactivateTwoFactorAuthOnUsersAccounts(req, res);
    }

}

module.exports = TwoFactorController;
