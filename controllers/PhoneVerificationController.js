const responseObject = require("./ViewController");
const AuthenticationCode = require("../helpers/AuthenticationCode");
const AccountVerificationLevels = require("../helpers/AccountVerificationLevels");
const ErrorHandler = require("../helpers/ErrorHandler");
const ErrorMessages = require("../helpers/ErrorMessages");
const User = require("../model/User");
const Settings = require("../model/Settings");
const date = require("date-and-time");
const SendVerificationCode = require("../SmsManager/SendVerificationCode");
const authData = require("../helpers/AuthenticateLogin");
const DbActions = require("../model/DbActions");
const {SendGenericSms} = require("../helpers/SendGenericSms");
const validator = require("../helpers/validator");
const MessageType = require("../helpers/MessageType");

class PhoneVerifyController {
  constructor() {
    this.now = new Date();
    this.responseObject = new responseObject();
    this.AuthenticationCode = new AuthenticationCode();
    this.SendVerificationCode = new SendVerificationCode();
    this.User = new User();
    this.DbActions = new DbActions();
    this.ErrorMessages = new ErrorMessages();
    this.Settings = new Settings();
    this.MessageType = new MessageType();
    this.AccountVerificationLevels = new AccountVerificationLevels();
  }

  valdateFunction(req, ValidationRule){

    validator(req.body, ValidationRule, {}, (err, status) => {
      if (status === false) {
        this.errorMessage = err;
      }
      this.errorStatus = status;
    })
  }

  //Verify user phone number
  async saveUserPhoneNumberANdSendVerificationCode(req, res) {
    try {

      const PhoneNumberVerificationRule = {//validate the datas for the verification
        phone: "required|numeric",
        country_code: "required|numeric"
      };
      this.valdateFunction(req, PhoneNumberVerificationRule);//call the validation function
      if(this.errorStatus === false){
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      // Collect phone and country code
      let phone = Number(req.body.phone);
      let country_code = req.body.country_code;

      //check if the phone number already exist
      let phoneNumberExistence = await this.User.selectOneUser([["phone", "=", phone], ['country_code', '=', country_code]]);
      if (phoneNumberExistence !== false) {
        if(phoneNumberExistence.phone !== null && phoneNumberExistence.phone_verification === null){
          // send verification sms
          await this.SendVerificationCode.sendSms(phoneNumberExistence);
          //set message type
          let messageType = this.MessageType.returnMessageType('phone_number_exists');
          this.responseObject.setMesageType(messageType);
        }

        let errorMessage = this.ErrorMessages.ErrorMessageObjects.phone_number_exists;
        throw new Error(errorMessage);
      }

      //authenticate user
      let userObject = await authData(req);
      userObject = await this.User.selectOneUser([['unique_id', '=', userObject.user.unique_id]]);
      if (userObject === false) {
        let errorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user;
        throw new Error(errorMessage);
      }

      const now = new Date();//get the current date and format it
      let currentDate = date.format(now, "YYYY-MM-DD HH:mm:ss");

      let phoneDetails = {
        phone: phone,
        country_code: country_code,
        created_at: currentDate,
        updated_at: currentDate,
        unique_id: userObject.unique_id,
      };

      //update the user details to add phone number
      let updatedUserObject = await this.User.updateUser(phoneDetails);

      // send verification sms
      let sendSms = await this.SendVerificationCode.sendSms(updatedUserObject);

      this.responseObject.setStatus(true);
      let messageType = this.MessageType.returnMessageType('phone_verification');//return the message type
      this.responseObject.setMesageType(messageType);
      this.responseObject.setMessage(
        "A verification code has been sent to the phone number provided, please provide code to verify your phone number"
      );
      this.responseObject.setData({phone:phone, country_code:country_code});
      res.json(this.responseObject.sendToView());

      //send the
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({ general_error: [ErrorHandler(e)] });
      res.json(this.responseObject.sendToView());
    }
  }

  //Verify user phone number
  async ResendVerificationCode(req, res) {
    try {

      const PhoneNumberVerificationRule = {//validate the datas for the verification
        phone: "required|numeric",
        country_code: "required|numeric"
      };

      this.valdateFunction(req, PhoneNumberVerificationRule);//call the validation function
      if(this.errorStatus === false){
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      // Collect phone and country code
      let phone = Number(req.body.phone);
      let country_code = req.body.country_code;

      //authenticate user
      let userObject = await authData(req);
      userObject = await this.User.selectOneUser([['unique_id', '=', userObject.user.unique_id]]);
      if (userObject === false) {
        let errorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user;
        throw new Error(errorMessage);
      }

      let phoneNumberExistence = await this.User.selectOneUser([ ["phone", "=", phone], ['country_code', '=', country_code], ["unique_id", "=", userObject.unique_id] ]);
      if (phoneNumberExistence === false) {
        let errorMessage = this.ErrorMessages.ErrorMessageObjects.phone_number_does_not_match;
        throw new Error(errorMessage);
      }

      // send verification sms
      let sendSms = await this.SendVerificationCode.sendSms(userObject);

      this.responseObject.setStatus(true);
      let messageType = this.MessageType.returnMessageType('phone_verification');//return the message type
      this.responseObject.setMesageType(messageType);
      this.responseObject.setMessage(
          "Phone number verification token has been sent to your phone number, provide code to verify phone number"
      );
      this.responseObject.setData({phone:phone, country_code:country_code});
      res.json(this.responseObject.sendToView());

      //send the
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({ general_error: [ErrorHandler(e)] });
      res.json(this.responseObject.sendToView());
    }
  }

  //activate the user account
  async verifyPhoneNumber(req, res) {
    try {

      const PhoneNumberVerificationRule = {//validate the datas for the verification
        phone: "required|numeric",
        country_code: "required|numeric",
        token: "required|numeric",
      };
      this.valdateFunction(req, PhoneNumberVerificationRule);//call the validation function
      if(this.errorStatus === false){
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      //get values from the body
      const phone = Number(req.body.phone);
      const country_code = req.body.country_code;
      const token = req.body.token;

      //authenticate user
      let userObject = await authData(req);
      userObject = await this.User.selectOneUser([["phone", "=", phone], ['country_code', '=', country_code], ['unique_id', '=', userObject.user.unique_id]]);
      if (userObject === false) {
        let errorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_phone_number;
        throw new Error(errorMessage);
      }
      if(userObject.phone_verification !== null){
        let errorMessage = this.ErrorMessages.ErrorMessageObjects.phone_already_verified;
        throw new Error(errorMessage);
      }

      let tokenAuthentication =
          await this.AuthenticationCode.verifyTokenValidity(
              token,
              this.AuthenticationCode.phone_verification_type,
              userObject
          );
      if (tokenAuthentication.status === false) {
        this.responseObject.setMesageType(tokenAuthentication.message_type);
        throw new Error(tokenAuthentication.message);
      }

      //confirm the user account
      let currenctDate = date.format(this.now, "YYYY-MM-DD HH:mm:ss");
      let updateUserObject = await this.User.updateUser({
        unique_id: userObject.unique_id,
        phone_verification: currenctDate,
        updated_at: currenctDate,
        account_verification_level: parseFloat(userObject.account_verification_level) + parseFloat(this.AccountVerificationLevels.phone_verification_level),//this is is the current verification level for a particular user account
        account_verification_step: this.AccountVerificationLevels.phone_verification_step
      });

      let settingsDetails = this.Settings.selectSettings([["id", "=", 1]]);//get the account settings

      //send an sms to the user
      let message = "You Phone Number has successfully verified.";
      if(updateUserObject.phone_verification !== null){
        SendGenericSms(settingsDetails, message, userObject);
      }

      this.responseObject.setStatus(true);
      let userObjectForView = await this.User.returnUserForView(updateUserObject);
      this.responseObject.setData({user:userObjectForView});
      this.responseObject.setMessage("Phone Number verification was successful");
      res.json(this.responseObject.sendToView());

      //send the
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({ general_error: [ErrorHandler(e)] });
      res.json(this.responseObject.sendToView());
    }
  }
}

module.exports = PhoneVerifyController;
