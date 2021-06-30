var DbActions = require("../model/DbActions");
var AuthenticationCode = require("../helpers/AuthenticationCode");
var LoginAuthEmailTemplate = require("../Emails/EmailTemplates/LoginAuthMailTemplate");
var mailler = require("../Emails/MailAccount");
const MailSetups = require("../Emails/MailSetups");
const User = require("../model/User");
DbActions = new DbActions();
const Settings = require("../model/Settings");

class SendLoginAuthEmail {
  constructor() {
    this.AuthenticationCode = new AuthenticationCode();
    this.User = new User();
    this.Settings = new Settings();
  }

  async sendMail(userObject, token, count = 0) {
    try {
      let fullName = this.User.returnFullName(userObject);
      //select the system settings
      let systemSettings = await this.Settings.selectSettings([["id", "=", 1]]);
      //title message for the mail
      const emailTitle = "Your Login Authentication Code To "+systemSettings.site_name;
  
      if (systemSettings === false) {
        throw new Error("System settings could not be retrieved");
      } //show errror if the system settings cant be returned


      let emailTemplate = LoginAuthEmailTemplate(
        fullName,
        emailTitle,
        systemSettings,
        token,
      );

      let mailSetup = MailSetups(
        userObject.email,
        emailTitle,
        emailTemplate,
        systemSettings,
        token
      );

      let mailSender = await mailler(mailSetup);

      count++
      if(mailSender.status === false && count < 3){
        return await this.sendMail(userObject, token, count);
      }

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
