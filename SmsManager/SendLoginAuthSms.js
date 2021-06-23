var DbActions = require("../model/DbActions");
var AuthenticationCode = require("../helpers/AuthenticationCode");
var User = require("../model/User");
const twilio = require("twilio");
DbActions = new DbActions();

class SendLoginAuthSms {
  constructor() {
    this.AuthenticationCode = new AuthenticationCode();
    this.User = new User();
  }
  async sendPhone(userObject, token) {
    try {
      let settingsDetails = await DbActions.selectSingleRow("settings", {
        filteringConditions: [["id", "=", 1]],
      });

      var accountSid = process.env.TWILIO_ACCOUNT_SID;
      var authToken = process.env.TWILIO_AUTH_TOKEN;

      var client = new twilio(accountSid, authToken);

      client.messages
        .create({
          body:
            "Your " +
            settingsDetails.site_name +
            " Login Authentication Code: " +
            token +
            ". Expires in " +
            AuthenticationCode.code_expiration_time +
            " minutes",
          to: userObject.phone,
          from: "+12242035261",
        })
        .then((message) => console.log(message));
    } catch (err) {
      return {
        status: false,
        message: err,
      };
    }
  }
}

module.exports = SendLoginAuthSms;
