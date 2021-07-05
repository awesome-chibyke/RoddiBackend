const responseObject = require("./ViewController");
const authData = require("../helpers/AuthenticateLogin");
const AuthenticationCode = require("../helpers/AuthenticationCode");
const AccountVerificationLevels = require("../helpers/AccountVerificationLevels");
const ErrorHandler = require("../helpers/ErrorHandler");
const User = require("../model/User");
const date = require("date-and-time");
const validator = require("../helpers/validator");
const Settings = require("../model/Settings");
const twilio = require("twilio");
const {sendGenericMails} = require("../Emails/GenericMailSender");

class EditController {
  constructor() {
    this.responseObject = new responseObject();
    this.User = new User();
    this.AuthenticationCode = new AuthenticationCode();
    this.now = new Date();
    this.Settings = new Settings();
    this.AccountVerificationLevels = new AccountVerificationLevels();
    this.errorMessage = "";
    this.errorStatus = true;
  }

  valdateFunction(req, ValidationRule) {
    validator(req.body, ValidationRule, {}, (err, status) => {
      if (status === false) {
        this.errorMessage = err;
      }
      this.errorStatus = status;
    });
  }

  async edit(req, res) {
    try {
      //validation
      let validationRule = {
        first_name: "required|string",
        last_name: "required|string",
        //middle_name: "required|string",
        address: "required|string",
        state: "required|string",
        country: "required|string",
        city: "required|string",
        zip_code: "required|numeric",
      };

      //validate the user
      this.valdateFunction(req, validationRule);
      if (this.errorStatus === false) {
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      //authenticate user
      let userObject = await authData(req);
      userObject = await this.User.selectOneUser([
          ['unique_id', '=', userObject.user.unique_id]
      ]);
      if(userObject === false){
        throw  new Error('User does not exist');
      }

      if(userObject.profile_update_watch !== 'none'){
        throw new Error('You have used up your chances for profile, please contact admin for further explanations');
      }

      //get the current date
      let currentDateTime = date.format(this.now, "YYYY-MM-DD HH:mm:ss");

      //update the user
      userObject.first_name = req.body.first_name;
      userObject.middle_name = req.body.middle_name;
      userObject.last_name = req.body.last_name;
      userObject.address = req.body.address;
      userObject.state = req.body.state;
      userObject.country = req.body.country;
      userObject.city = req.body.city;
      userObject.zip_code = req.body.zip_code;
      userObject.account_verification_level = parseFloat(userObject.account_verification_level) + parseFloat(this.AccountVerificationLevels.profile_update_verification_level);//bring the profile update level
      userObject.profile_update_watch = currentDateTime;//bring the profile update level
      userObject.account_verification_step = this.AccountVerificationLevels.profile_update_verification_step;//bring the profile update level

      let updatedUserObject = await this.User.updateUser(userObject);

      let settingsDetails = await this.Settings.selectSettings([
        ["id", "=", 1]
      ]);
      let message = 'Your have successfully updated your profile. Please note that further update of your profile can only be done by contacting the '+settingsDetails.site_name+' Support';

      //send an email to the user
      await this.sendEmailForForSuccessfulProfileEdit(userObject, message, settingsDetails);

      //send sms to the user
      await this.sendSmsForUser(userObject, message);

      //return value to view
      this.responseObject.setStatus(true);
      let userObjectForView = await this.User.returnUserForView(updatedUserObject);
      this.responseObject.setData({user:userObjectForView});
      this.responseObject.setMessage("User Update was Successful");
      res.json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(e)],
      });
      res.json(this.responseObject.sendToView());
    }
  }

  //do the actual mail sending to the users account
  async sendEmailForForSuccessfulProfileEdit(userObject, message, settingsDetails){

    //get the template for the mail
    let emailSubject = 'Successful Update of Profile';
    let fullName = this.User.returnFullName(userObject);
    let mailSender = sendGenericMails(userObject, fullName, settingsDetails, emailSubject, message);
    return mailSender;

  }

  //send the sms to the user
  async sendSmsForUser(userObject, message){
    var accountSid = process.env.TWILIO_ACCOUNT_SID;//twillo accoun details
    var authToken = process.env.TWILIO_AUTH_TOKEN;

    var client = new twilio(accountSid, authToken);

    client.messages
        .create({
          body:
          message,
          to: userObject.phone,
          from: process.env.TWILIO_PHONE_NUMBER,
        })
        .then((message) => {return message; });
  }

}

module.exports = EditController;
