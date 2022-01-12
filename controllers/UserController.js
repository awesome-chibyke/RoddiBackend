const responseObject = require("./ViewController");
const AuthenticationCode = require("../helpers/AuthenticationCode");
const ErrorHandler = require("../helpers/ErrorHandler");
const verifyToken = require("../helpers/AuthenticateLogin");
const authData = require("../helpers/AuthenticateLogin");
const User = require("../model/User");
const LoginAuthModel = require("../model/LoginAuthModel");
const date = require("date-and-time");
const SendWelcomeEmailAfterActivation = require("../Emails/SendWelcomeEmailAfterActivation");
const jwt = require("jsonwebtoken");
const AccountVerificationLevels = require("../helpers/AccountVerificationLevels");

class UserController {
  constructor() {
    this.now = new Date();
    this.responseObject = new responseObject();
    this.AuthenticationCode = new AuthenticationCode();
    this.User = new User();
    this.LoginAuthModel = new LoginAuthModel();
    this.AccountVerificationLevels = new AccountVerificationLevels();
    this.SendWelcomeEmailAfterActivation =
      new SendWelcomeEmailAfterActivation();
  }

  //activate the user account
  async ActivateAccount(req, res) {
    try {
      //get values from the body
      const email = req.body.email;
      const token = req.body.token;
    let IpInformation = await this.User.returnIpDetails(req);
    let ip_address = IpInformation.query;
    let location = `${IpInformation.city} ${IpInformation.regionName}, ${IpInformation.country}`;
    let device_name = req.body.device_name;

      //select the user involved
      let userObject = await this.User.selectOneUser([["email", "=", email]]);
      if (userObject === false) {
        throw new Error("Invalid User details supplied");
      }
      // token;
      // token_type;
      //verify the token provided
      let tokenAuthentication =
        await this.AuthenticationCode.verifyTokenValidity(
          token,
          this.AuthenticationCode.account_activation_type,
          userObject
        );
      if (tokenAuthentication.status === false) {
        this.responseObject.setMesageType(tokenAuthentication.message_type);
        throw new Error(tokenAuthentication.message);
      }

      //confirm the user account
      let currenctDate = date.format(this.now, "YYYY-MM-DD HH:mm:ss");
      let updatedUserDetails = await this.User.updateUser({
        unique_id: userObject.unique_id,
        email_verification: currenctDate,
        updated_at: currenctDate,
        account_verification_level:  this.AccountVerificationLevels.account_activation_verification_level,
        account_verification_step: this.AccountVerificationLevels.account_activation_verification_step
      });


      //send a successful account activation mail to the user
      let welcomeEmail =
        this.SendWelcomeEmailAfterActivation.sendMail(userObject);

        //create the jwt token
        let createdToken = await this.LoginAuthModel.secondLayerAuth(userObject);
        await this.LoginAuthModel.generateToken(
            userObject,
            ip_address,
            device_name,
            createdToken,
            location
        );

        this.responseObject.setMesageType("normal");
        //delete the properties that is not supposed t be sent to view
        let userObjectForView = await this.User.returnUserForView(updatedUserDetails);
        this.responseObject.setData({
            token: createdToken,
            user: userObjectForView,
        });
        this.responseObject.setStatus(true);
        this.responseObject.setMessage("Account activation was successful, you have been successfully logged in");
        res.status(200).json(this.responseObject.sendToView());

      //send the
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({ general_error: [ErrorHandler(e)] });
      res.json(this.responseObject.sendToView());
    }
  }

  //pull the user object
    async returnUserProfile(req, res){

        try {
            //authenticate user
            let userObject = await authData(req);
            userObject = await this.User.selectOneUser([["unique_id", "=", userObject.user.unique_id]]);

            this.responseObject.setMesageType("normal");
            //return the user object to view
            let userObjectForView = await this.User.returnUserForView(userObject);
            this.responseObject.setData({user: userObjectForView});
            this.responseObject.setStatus(true);
            this.responseObject.setMessage("User Details has been returned");
            res.status(200).json(this.responseObject.sendToView());

        } catch (e) {
            this.responseObject.setStatus(false);
            this.responseObject.setMessage({ general_error: [ErrorHandler(e)] });
            res.json(this.responseObject.sendToView());
        }
    }

}

module.exports = UserController;

//user enters token on front end
//token gets sent to backend with user email
//with email get the user involved
//use the user unique id and token to query the db
//if null send throw an error to user that token is invalid
//if it exists, check the time scale to make sure its less than 10mins
//if its less than 10mins confirm the user and activate the account_verification_level
//send a success message to the front end and notify the user via email
