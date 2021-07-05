const responseObject = require("./ViewController");
const PasswordHasher = require("../helpers/PasswordHasher");
const Generics = require("../helpers/Generics");
const AuthenticationCode = require("../helpers/AuthenticationCode");
const date = require("date-and-time");
const DbActions = require("../model/DbActions");
const SendWelcomeEmail = require("../Emails/SendWelcomeEmail");
const ErrorHandler = require("../helpers/ErrorHandler");
const MessageType = require("../helpers/MessageType");
const User = require("../model/User");

//instantiation
class RegisterController {
  constructor() {
    this.responseObject = new responseObject();
    this.SendWelcomeEmail = new SendWelcomeEmail();
    this.DbActions = new DbActions();
    this.AuthenticationCode = new AuthenticationCode();
    this.Generics = new Generics();
    this.passwordController = new PasswordHasher();
    this.MessageType = new MessageType();
    this.User = new User();
  }

  async register(req, res) {
    try {
      let email = req.body.email;
      let password = req.body.password;
      let referral_id = req.body.referral_id;
      let uniqueIdDetails = await this.Generics.createUniqueId(
        "users",
        "unique_id"
      );

      if (uniqueIdDetails.status === false) {
        throw new Error(uniqueIdDetails.message);
      }

      const now = new Date();
      let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");

      let hashedPassword = await this.passwordController.hashPassword(password);

      let userObject = {
        unique_id: uniqueIdDetails.data,
        email: email,
        password: hashedPassword,
        referral_id: referral_id,
        created_at: currenctDate,
        updated_at: currenctDate,
      };

      //insert the values into the db
      var insertValue = await this.DbActions.insertData("users", [userObject]);

      userObject = await this.User.selectOneUser([['unique_id', '=', userObject.unique_id]]);
      let sendMail = await this.SendWelcomeEmail.sendMail(userObject);

      this.responseObject.setStatus(true);
      this.responseObject.setMessage("Registration was successful. An account activation code has been sent to your email. please supply code to activate account.");
      delete userObject.password;
      //get the message type for view activate-account')
      let MessageType = this.MessageType.returnMessageType('account_activation');
      this.responseObject.setMesageType(MessageType)
      this.responseObject.setData({
        email: userObject.email
      });
      res.json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(e)],
      });
      this.responseObject.setData(insertValue);
      res.json(this.responseObject.sendToView());
    }
  }

  async resendActivationEmail(req, res){

    let email = req.body.email;

    let userObject = await this.User.selectOneUser([['email', '=', email]]);
    let sendMail = await this.SendWelcomeEmail.sendMail(userObject);

    this.responseObject.setStatus(true);
    this.responseObject.setMessage("An account activation code has been sent to your email. please supply code to activate account.");
    delete userObject.password;
    //get the message type for view activate-account')
    let MessageType = this.MessageType.returnMessageType('account_activation');
    this.responseObject.setMesageType(MessageType);
    this.responseObject.setData({
      email: userObject.email
    });
    res.json(this.responseObject.sendToView());

  }

}
module.exports = RegisterController;

//{ general_error: [e.message + " at line " + e.stack], first_name:['first is required']}
