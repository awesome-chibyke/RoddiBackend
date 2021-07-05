//for mail sending
var mailler = require("./MailAccount");
const MailSetups = require("./MailSetups");
let User = require("../model/User");
let AuthenticationCode = require("../helpers/AuthenticationCode");
let GenericMailTemplate = require("./EmailTemplates/GenericMailTemplate");
User = new User();
AuthenticationCode = new AuthenticationCode();

exports.sendGenericMails = async (userObject, fullName, settingsDetails, emailSubject, message, count = 0, token = '') => {

    //get the template for the mail;
    let emailTemplate = GenericMailTemplate(
        fullName,
        emailSubject,
        settingsDetails,
        message,
        token
    );

    //send a welcome/activation email to the user
    settingsDetails.expiration_time = AuthenticationCode.code_expiration_time;
    let mailSetup = MailSetups(
        userObject.email,
        emailSubject,
        emailTemplate,
        settingsDetails
    );

    let mailSender = await mailler(mailSetup);
    count++;
    if(mailSender.status === false && count < 3){
        let theClass = this;
        setTimeout(function () {
            return theClass.sendGenericMails(userObject, fullName, settingsDetails, emailSubject, message, count);
        }, 2000);
    }
    return mailSender
}