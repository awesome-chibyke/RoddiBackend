var DbActions = require("../model/DbActions");
var AuthenticationCode = require("../helpers/AuthenticationCode");
var WelcomeMailAfterAccountActivationTemplate = require("../Emails/EmailTemplates/WelcomeEmailAfterAccountActivationTemplate");
var mailler = require("../Emails/MailAccount");
const MailSetups = require("../Emails/MailSetups");
const User = require("../model/User");
const Settings = require("../model/Settings");

AuthenticationCode = new AuthenticationCode();

class SendWelcomeEmailAfterActivation {
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
    console.log(fullName);

    //select the system settings
    let systemSettings = await this.Settings.selectSettings([["id", "=", 1]]);
    //title message for the mail
    const emailTitle = "Welcome To "+systemSettings.site_name;

    if (systemSettings === false) {
      throw new Error("System settings could not be retrieved");
    } //show errror if the system settings cant be returned

    //get the template for the mail
    let emailTemplate = WelcomeMailAfterAccountActivationTemplate(
      fullName,
      emailTitle,
      systemSettings,
    );

    //send a welcome/activation email to the user
    let mailSetup = MailSetups(
      userObject.email,
      emailTitle,
      emailTemplate,
      systemSettings,
    );
    let mailSender = await mailler(mailSetup);
    return mailSender;
  }
}

module.exports = SendWelcomeEmailAfterActivation;
