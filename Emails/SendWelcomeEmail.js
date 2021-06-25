var DbActions = require("../model/DbActions");
var AuthenticationCode = require("../helpers/AuthenticationCode");
var welcomeEmailTemplate = require("../Emails/EmailTemplates/WelcomeEmailTemplate");
var mailler = require("../Emails/MailAccount");
const MailSetups = require("../Emails/MailSetups");
const User = require("../model/User");
const Settings = require("../model/Settings");

AuthenticationCode = new AuthenticationCode();

class SendWelcomeEmail {
  constructor() {
    this.DbActions = new DbActions();
    this.User = new User();
    this.Settings = new Settings();
  }
  async sendMail(userObject) {
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
    let fullName = this.User.returnFullName(userObject);
    //select the system settings
    let systemSettings = await this.Settings.selectSettings([["id", "=", 1]]);
    //title message for the mail
    const emailTitle = "Welcome To "+systemSettings.site_name;

    if (systemSettings === false) {
      throw new Error("System settings could not be retrieved");
    } //show errror if the system settings cant be returned

    //get the template for the mail
    let emailTemplate = welcomeEmailTemplate(
      fullName,
      emailTitle,
      systemSettings,
      activationCode.data
    );

    //send a welcome/activation email to the user
    let mailSetup = MailSetups(
      userObject.email,
      emailTitle,
      emailTemplate,
      systemSettings,
      activationCode.data
    );

    let mailSender = await mailler(mailSetup);
    return mailSender;
  }
}

module.exports = SendWelcomeEmail;
