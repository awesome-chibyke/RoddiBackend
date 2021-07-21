const DbActions = require("../model/DbActions");
const LoginAuthModel = require("../model/LoginAuthModel");
const PasswordHasher = require("../helpers/PasswordHasher");
const SendWelcomeEmail = require("../Emails/SendWelcomeEmail");
var AuthenticationCode = require("../helpers/AuthenticationCode");
var SendLoginAuthMail = require("../Emails/SendLoginAuthMail");
var SendLoginAuthSms = require("../SmsManager/SendLoginAuthSms");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../helpers/ErrorHandler");
const Generics = require("../helpers/Generics");
const User = require("../model/User");
const Settings = require("../model/Settings");
const responseObject = require("../controllers/ViewController");
const MessageType = require("../helpers/MessageType");
const date = require("date-and-time");
const validator = require("../helpers/validator");
const { GetRequest, PostRequest } = require("../helpers/ExternalRequest");
const { SendGenericSms } = require("../helpers/SendGenericSms");
const { sendGenericMails } = require("../Emails/GenericMailSender");
const authData = require("../helpers/AuthenticateLogin");
const Login = require("../model/LoginAuthModel");

class LoginController {
  constructor() {
    this.responseObject = new responseObject();
    this.SendWelcomeEmail = new SendWelcomeEmail();
    this.DbActions = new DbActions();
    this.PasswordHasher = new PasswordHasher();
    this.AuthenticationCode = new AuthenticationCode();
    this.SendLoginAuthMail = new SendLoginAuthMail();
    this.SendLoginAuthSms = new SendLoginAuthSms();
    this.LoginAuthModel = new LoginAuthModel();
    this.User = new User();
    this.MessageType = new MessageType();
    this.Settings = new Settings();
    this.Generics = new Generics();
    this.Login = new Login();
  }

  async loginAction(req, res) {
    let email = req.body.email;
    let password = req.body.password;

    //check for the existence of the values
    let messageType = "";

    try {
      let user = await this.DbActions.selectSingleRow("users", {
        filteringConditions: [["email", "=", email]],
      });

      if (typeof user === "undefined") {
        this.responseObject.setMesageType("normal");
        throw new Error("Incorrect Email / Password");
      }

      if (
        !(await this.PasswordHasher.comparePassword(password, user.password))
      ) {
        this.responseObject.setMesageType("normal");
        throw new Error("Incorrect Email/Password");
      }

      if (user.email_verification === null) {
        //check if the eamil has been verified
        await this.SendWelcomeEmail.sendMail(user); //resend email to the user

        //if (sendMail.status === true) {
        //get the message type for the view
        messageType = this.MessageType.returnMessageType("account_activation");
        this.responseObject.setMesageType(messageType);
        this.responseObject.setData({
          email: user.email,
        });
        throw new Error(
          "An activation email was successfully sent to your email, please activate your account by providing the code in the mail"
        );
        //}
      }

      //check if the user account status is active
      if (user.status === "inactive") {
        //get the message type for the view
        messageType = this.MessageType.returnMessageType("blocked_account");
        this.responseObject.setMesageType(messageType);
        throw new Error(
          "Your account is inactive, please contact support for more details"
        );
      }

      //check if the authentication type the user have selected
      if (user.auth_type === "email") {
        //create the activation code
        let activationCode = await this.AuthenticationCode.createActivationCode(
          user,
          this.AuthenticationCode.login_auth_type
        );
        if (activationCode.status === false) {
          throw new Error(activationCode.message);
        }
        let token = activationCode.data;
        let sendMail = await this.SendLoginAuthMail.sendMail(user, token); //token
        if (sendMail.status === false) {
          throw new Error(sendMail.message);
        }
        // check if the user has verified phone to send login code to phone
        let successMessage =
          "A login authentication code was sent to your email address, please provide code to proceed with login";
        // check if the user has verified phone to send login code to phone
        if (user.phone_verification !== null) {
          //send the code to the user phone number
          let sendSms = await this.SendLoginAuthSms.sendPhone(user, token);
          successMessage =
            "A login authentication code was sent to your email address and phone number, please provide code to proceed with login";
        }

        this.responseObject.setMessage(successMessage);
        messageType = this.MessageType.returnMessageType(
          "login_auth_email_phone"
        ); //get the message type
        this.responseObject.setMesageType(messageType);
        this.responseObject.setStatus(true);
        this.responseObject.setData({
          email: user.email,
        });
      } else {
        //google auth
        this.responseObject.setMessage(
          "Please Enter Code Generated By Your Authentication App"
        );
        messageType = this.MessageType.returnMessageType("login_auth_app");
        this.responseObject.setMesageType(messageType);
        this.responseObject.setStatus(true);
        this.responseObject.setData({
          email: user.email,
          token_type: this.AuthenticationCode.login_auth_type,
        });
      }

      //send response to view
      res.json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setMessage({
        general_error: [ErrorHandler(e)],
      });
      this.responseObject.setStatus(false);
      res.json(this.responseObject.sendToView());
    }
  }

  valdateFunction(req, ValidationRule) {
    validator(req.body, ValidationRule, {}, (err, status) => {
      if (status === false) {
        this.errorMessage = err;
      }
      this.errorStatus = status;
    });
  }

  //activate the user account
  async AuthenticateLoginCode(req, res) {
    try {
      //authenticate if the user is logged in
      const email = req.body.email;
      let IpInformation = await this.User.returnIpDetails(req);
      let ip_address = IpInformation.query;
      let location = `${IpInformation.city} ${IpInformation.regionName}, ${IpInformation.country}`;
      let device_name = req.body.device_name;
      let the_token = req.body.token;

      //validation
      let validationRule = {
        token: "required|numeric",
        email: "required|email",
        device_name: "required|string",
      };

      this.valdateFunction(req, validationRule);
      if (this.errorStatus === false) {
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      //select the user involved
      let userObject = await this.User.selectOneUser([["email", "=", email]]);
      if (userObject === false) {
        throw new Error("Invalid User details supplied");
      }

      //verify the token provided
      let tokenAuthentication =
        await this.AuthenticationCode.verifyTokenValidity(
          the_token,
          this.AuthenticationCode.login_auth_type,
          userObject
        );
      if (tokenAuthentication.status === false) {
        throw new Error(tokenAuthentication.message);
      }

      //create the jwt token
      let createdToken = await this.secondLayerAuth(userObject);
      await this.generateToken(
        userObject,
        ip_address,
        device_name,
        createdToken,
        location
      );

      this.responseObject.setMesageType("normal");
      //delete the properties that is not supposed t be sent to view
      let userObjectForView = await this.User.returnUserForView(userObject);
      this.responseObject.setData({
        token: createdToken,
        user: userObjectForView,
      });
      this.responseObject.setStatus(true);
      this.responseObject.setMessage("you have been successfully logged in");
      res.status(200).json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({ general_error: [ErrorHandler(e)] });
      res.json(this.responseObject.sendToView());
      console.log(e);
    }
  }

  //for the users that make use of auth
  async authenticateLoginWithTwoFactor(req, res) {
    try {
      const email = req.body.email;
      let IpInformation = await this.User.returnIpDetails(req);
      let ip_address = IpInformation.query;
      let location = `${IpInformation.city} ${IpInformation.regionName}, ${IpInformation.country}`;
      let device_name = req.body.device_name;

      //validation
      let validationRule = {
        token: "required|numeric",
        email: "required|email",
        //ip_address:"required|string",
        device_name: "required|string",
      };

      this.valdateFunction(req, validationRule);
      if (this.errorStatus === false) {
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      let userObject = await this.User.selectOneUser([["email", "=", email]]);
      if (userObject === false) {
        throw new Error("Invalid User details supplied");
      }

      let verifyUser = await this.User.verifyAToken(req, userObject);
      if (verifyUser.status === false) {
        throw new Error(verifyUser.message);
      }

      //create the jwt token
      let createdToken = await this.secondLayerAuth(userObject);
      await this.generateToken(
        userObject,
        ip_address,
        device_name,
        createdToken,
        location
      );

      this.responseObject.setMesageType("normal");
      //delete the properties that is not supposed t be sent to view
      let userObjectForView = await this.User.returnUserForView(userObject);
      this.responseObject.setData({
        token: createdToken,
        user: userObjectForView,
      });
      this.responseObject.setStatus(true);
      this.responseObject.setMessage("you have been successfully logged in");
      res.status(200).json(this.responseObject.sendToView());
    } catch (e) {
      //send the error to the views
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({ general_error: [ErrorHandler(e)] });
      res.json(this.responseObject.sendToView());
    }
  }

  //resend an email auth code for login
  async resendEmailAuthCode(req, res) {
    try {
      let email = req.body.email;

      //select the user from the db using the supplied email address
      let userObject = await this.User.selectOneUser([["email", "=", email]]);
      if (userObject === false) {
        throw new Error("User does not exist");
      }

      let activationCode = await this.AuthenticationCode.createActivationCode(
        userObject,
        this.AuthenticationCode.login_auth_type
      );
      if (activationCode.status === false) {
        throw new Error(activationCode.message);
      }
      let token = activationCode.data; //get the token
      let sendMail = await this.SendLoginAuthMail.sendMail(userObject, token); //token
      if (sendMail.status === false) {
        throw new Error(sendMail.message);
      }
      // check if the user has verified phone to send login code to phone
      let successMessage =
        "A login authentication code was sent to your email address, please provide code to proceed with login";
      if (userObject.phone_verification !== null) {
        //send the code to the user phone number
        let sendSms = await this.SendLoginAuthSms.sendPhone(user, token);
        successMessage =
          "A login authentication code was sent to your email address and phone number, please provide code to proceed with login";
      } //...........................

      //resend the auth email to the user email address
      this.responseObject.setMessage(successMessage);
      this.responseObject.setStatus(true);
      this.responseObject.setData({
        email: userObject.email,
      });
      //send response to view
      res.json(this.responseObject.sendToView());
    } catch (err) {
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      this.responseObject.setStatus(false);
      res.json(this.responseObject.sendToView());
    }
  }

  secondLayerAuth(userObject) {
    return new Promise(function (resolve, reject) {
      //create the jwt token and send to the view
      jwt.sign({ user: userObject }, "secretkey", async (err, token) => {
        if (err) {
          reject(err);
        } else {
          //
          resolve(token);
        }
      });
    });
  }

  async generateToken(userObject, ip_address, device_name, Token, location) {
    const now = new Date();
    let currentDate = date.format(now, "YYYY-MM-DD HH:mm:ss");
    let expirationTimeFromCreatedTime = date.addDays(now, 2);
    expirationTimeFromCreatedTime = date.format(
      expirationTimeFromCreatedTime,
      "YYYY-MM-DD HH:mm:ss"
    );
    let uniqueIdDetails = await this.Generics.createUniqueId(
      "login_table",
      "unique_id"
    );
    if (uniqueIdDetails.status === false) {
      throw new Error(uniqueIdDetails.message);
    }

    //check if the incoming device has been stored before
    let loginAuthDetails = await this.LoginAuthModel.selectAllLoginAuthWhere([
      ["device_name", "=", device_name],
    ]);
    if (loginAuthDetails.length == 0) {
      //that means that the user has not logged in with the device before

      let settingsDetails = await this.Settings.selectSettings();

      //send an email to the user that his/her account has been logged into from an unknown position
      let emailSubject = "Account login Activity from an unknown device";
      let message = `A login activity just occurred on your account with ${settingsDetails.site_name}. Details are listed below: <br> <strong>Email</strong>: userObject.email. <br> <strong>Device Name</strong>: ${device_name}. <br> <strong>Login Time</strong>: ${currentDate}. <br> <strong>IP Address</strong>: ${ip_address}. <br><strong>Location</strong>: ${location}. <br> Please click the link if you did not authorize this action.${settingsDetails.site_url}/login/disable_login/${uniqueIdDetails.data}`;
      let fullName = this.User.returnFullName(userObject);

      await sendGenericMails(
        userObject,
        fullName,
        settingsDetails,
        emailSubject,
        message
      );
    }

    if (loginAuthDetails.length > 0) {
      //a situation where the user has loged in with the device

      //loop through the devices and check the already existing device as off
      for (let u in loginAuthDetails) {
        if (loginAuthDetails[u].logged_out === "none") {
          await this.LoginAuthModel.updateLoginAuth({
            unique_id: loginAuthDetails[u].unique_id,
            logged_out: "yes",
          });
        }
      }
    }

    let hashedToken = await this.PasswordHasher.hashPassword(Token);

    //add the login details to login auth db
    await this.DbActions.insertData("login_table", {
      unique_id: uniqueIdDetails.data,
      user_unique_id: userObject.unique_id,
      logged_out: "none",
      ip_address: ip_address,
      token_secret: hashedToken,
      due_date: expirationTimeFromCreatedTime,
      device_name: device_name,
      location: location,
      created_at: currentDate,
      updated_at: currentDate,
    });
  }

  async disableAccount(req, res) {
    try {

      let unique_id = req.params.unique_id;
      let LoginObject = await this.LoginAuthModel.selectOneLogin(
        [["unique_id", "=", unique_id]]
      );
      
      if (LoginObject === false) {
        // UserObject = null;
        throw new Error("Loged in user not found");
      }
      LoginObject.logged_out = "logged_out";
      let updatedLoginObject = await this.Login.updateLoginAuth(LoginObject);

      //return value to view
      this.responseObject.setStatus(true);
      this.responseObject.setMessage("Login has been deactivated");
      res.json(this.responseObject.sendToView());
    } catch (err) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }
  }
}

module.exports = LoginController;
