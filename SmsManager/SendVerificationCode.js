var DbActions = require("../model/DbActions");
var AuthenticationCode = require("../helpers/AuthenticationCode");
const twilio = require("twilio");
AuthenticationCode = new AuthenticationCode();

class SendVerificationCode {
  constructor() {
    this.DbActions = new DbActions();
  }
  async sendSms(userObject) {
    let settingsDetails = await this.DbActions.selectSingleRow("settings", {
      filteringConditions: [["id", "=", 1]],
    });

    //create the activation code
    let verificationCode = await AuthenticationCode.createActivationCode(
      userObject,
      AuthenticationCode.phone_verification_type
    );
    if (verificationCode.status === false) {
      return {
        status: false,
        message: verificationCode.message,
        data: [],
      };
    }

    var accountSid = process.env.TWILIO_ACCOUNT_SID;
    var authToken = process.env.TWILIO_AUTH_TOKEN;

    var client = new twilio(accountSid, authToken);
    client.messages
      .create({
        body:
          "Your " +
          settingsDetails.site_name +
          " phone number verification code: " +
          verificationCode.data +
          ". Expires in " +
          AuthenticationCode.code_expiration_time +
          " minutes",
        to: userObject.phone,
        from: "+12242035261",
      })
      .then((message) => console.log(message));
  }
}

module.exports = SendVerificationCode;
