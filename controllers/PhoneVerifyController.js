const responseObject = require("./ViewController");
const AuthenticationCode = require("../helpers/AuthenticationCode");
const ErrorHandler = require("../helpers/ErrorHandler");
const User = require("../model/User");
const date = require("date-and-time");
const twilio = require("twilio");

class PhoneVerifyController {
  constructor() {
    this.now = new Date();
    this.responseObject = new responseObject();
    this.AuthenticationCode = new AuthenticationCode();
    this.User = new User();
  }

  //activate the user account
  async verify(req, res) {
    try {
      //get values from the body
      const phone = req.body.phone;
      const country_code = req.body.country_code;
      const token = req.body.token;
      const token_type = req.body.token_type;

      //select the user involved
      let userObject = await this.User.selectOneUser([["phone", "=", phone]]);
      if (userObject === false) {
        throw new Error("Invalid Phone Number");
      }

      let tokenAuthentication =
        await this.AuthenticationCode.verifyTokenValidity(
          token,
          token_type,
          userObject
        );
      if (tokenAuthentication.status === false) {
        this.responseObject.setMesageType(tokenAuthentication.message_type);
        throw new Error(tokenAuthentication.message);
      }

      //confirm the user account
      let currenctDate = date.format(this.now, "YYYY-MM-DD HH:mm:ss");
      await this.User.updateUser({
        unique_id: userObject.unique_id,
        phone_verification: currenctDate,
        updated_at: currenctDate,
      });

      //send a successful account activation mail to the user
      var accountSid = process.env.TWILIO_ACCOUNT_SID;
      var authToken = process.env.TWILIO_AUTH_TOKEN;

      var client = new twilio(accountSid, authToken);

      client.messages
        .create({
          body: "Your Roodi Phone Number Has Been Verified",
          to: userObject.phone,
          from: "+12242035261",
        })
        .then((message) => console.log(message));

      this.responseObject.setStatus(true);
      this.responseObject.setMessage("Phone Number verification was sucessful");
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
