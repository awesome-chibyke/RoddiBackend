const responseObject = require("./ViewController");
const AuthenticationCode = require("../helpers/AuthenticationCode");
const ErrorHandler = require("../helpers/ErrorHandler");
const User = require("../model/User");
const date = require("date-and-time");
const SendVerificationCode = require("../SmsManager/SendVerificationCode");
const authData = require("../helpers/AuthenticateLogin");
const DbActions = require("../model/DbActions");

class PhoneVerifyController {
  constructor() {
    this.now = new Date();
    this.responseObject = new responseObject();
    this.AuthenticationCode = new AuthenticationCode();
    this.SendVerificationCode = new SendVerificationCode();
    this.User = new User();
    this.DbActions = new DbActions();
  }

  //Verify user phone number
  async VerifyPhone(req, res) {
    try {
      //authenticate user
      let userObject = await authData(req);
      userObject = userObject.user;

      // Collect phone and country code
      let phone = req.body.phone;
      let country_code = req.body.country_code;

      const now = new Date();
      let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");

      let phoneDetails = {
        phone: phone,
        country_code: country_code,
        created_at: currenctDate,
        updated_at: currenctDate,
        unique_id: userObject.unique_id,
      };

      //update the user details to add phone number
      let updatedUserObject = this.User.updateUser(phoneDetails);

      // send verification sms
      let sendSms = await this.SendVerificationCode.sendSms(phoneDetails);

      this.responseObject.setStatus(true);
      this.responseObject.setMessage(
        "A verification code will be sent to you shortly"
      );
      delete userObject.password;
      this.responseObject.setData(updatedUserObject);
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
