var DbActions = require("../model/DbActions");
var AuthenticationCode = require("../helpers/AuthenticationCode");
var welcomeEmailTemplate = require("../Emails/EmailTemplates/WelcomeEmailTemplate");
var mailler = require("../Emails/MailAccount");
const MailSetups = require("../Emails/MailSetups");

AuthenticationCode = new AuthenticationCode();

class SendWelcomeEmail {
  constructor() {
    this.DbActions = new DbActions();
  }
  async sendMail(userObject) {
    let settingsDetails = await this.DbActions.selectSingleRow("settings", {
      filteringConditions: [["id", "=", 1]],
    });

    //create the activation code
    let activationCode = await AuthenticationCode.createActivationCode(
      userObject,
      AuthenticationCode.account_activation_type
    );
    if (activationCode.status === false) {
      return {
        status: false,
        message: activationCode.message,
        data: [],
      };
    }

    //get the template for the mail
    let emailTemplate = welcomeEmailTemplate(
      "https://techocraft.com/img/logo.png",
      settingsDetails.site_name,
      userObject.first_name +
        " " +
        userObject.middle_name +
        " " +
        userObject.last_name,
      activationCode.data,
      settingsDetails.address1,
      settingsDetails.site_url
    );

    //send a welcome/activation email to the user
    let mailSetup = MailSetups(
      userObject.email,
      "Welcome To " + settingsDetails.site_name,
      emailTemplate,
      settingsDetails
    );

    let mailSender = await mailler(mailSetup);
    return mailSender;
  }
}

module.exports = SendWelcomeEmail;
