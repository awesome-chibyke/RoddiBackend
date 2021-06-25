var DbActions = require("../model/DbActions");
var AuthenticationCode = require("../helpers/AuthenticationCode");
var LoginAuthEmailTemplate = require("../Emails/EmailTemplates/LoginAuthMailTemplate");
var mailler = require("../Emails/MailAccount");
const MailSetups = require("../Emails/MailSetups");
const User = require("../model/User");
DbActions = new DbActions();

class SendLoginAuthEmail {
  constructor() {
    this.AuthenticationCode = new AuthenticationCode();
    this.User = new User();
  }

  async sendMail(userObject, token) {
    try {
      let settingsDetails = await DbActions.selectSingleRow("settings", {
        filteringConditions: [["id", "=", 1]],
      });

      //get the template for the mail
      let fullName = this.User.returnFullName(userObject);
      let emailTemplate = LoginAuthEmailTemplate(
        settingsDetails.logo_url,
        settingsDetails.site_name,
        fullName,
        token,
        settingsDetails.address1,
        settingsDetails.site_url
      );

      let mailSetup = MailSetups(
        userObject.email,
        "Login Authentication",
        emailTemplate,
        settingsDetails
      );

      let mailSender = await mailler(mailSetup);

      return {
        status: true,
        message:
          "Authentication Code was successfully sent to your email address",
        data: mailSender,
      };
    } catch (err) {
      return {
        status: false,
        message: err,
      };
    }
  }
}

module.exports = SendLoginAuthEmail;
