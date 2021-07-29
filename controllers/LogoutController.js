var speakeasy = require("speakeasy");
var QRCode = require("qrcode");
const responseObject = require("./ViewController");
const authData = require("../helpers/AuthenticateLogin");
const AuthenticationCode = require("../helpers/AuthenticationCode");
const ErrorHandler = require("../helpers/ErrorHandler");
const User = require("../model/User");
const Settings = require("../model/Settings");
const validator = require("../helpers/validator");
const ErrorMessages = require("../helpers/ErrorMessages");
const {SendGenericSms} = require("../helpers/SendGenericSms");
const MessageType = require("../helpers/MessageType");
const {sendGenericMails} = require("../Emails/GenericMailSender");
const date = require("date-and-time");
const LoginAuthModel = require("../model/LoginAuthModel");
const AccountAuthForTwoFactorDeActivation = require("../Emails/EmailTemplates/AccountAuthForTwoFactorDeActivation");

//for mail sending
var mailler = require("../Emails/MailAccount");
const MailSetups = require("../Emails/MailSetups");

class TwoFactorController {
    constructor() {
        this.responseObject = new responseObject();
        this.User = new User();
        this.Settings = new Settings();
        this.AuthenticationCode = new AuthenticationCode();
        this.ErrorMessages = new ErrorMessages();
        this.MessageType = new MessageType();
        this.LoginAuthModel = new LoginAuthModel();
    }

    valdateFunction(req, ValidationRule){

        validator(req.body, ValidationRule, {}, (err, status) => {
            if (status === false) {
                this.errorMessage = err;
            }
            this.errorStatus = status;
        })
    }

    //disable the 2-factor auth using th auth app
    async logout(req, res) {
        try {

            //authenticate the user
            let userObject = await authData(req);
            let currentLoginObject = {};
            if('current_login' in userObject){
                currentLoginObject = userObject.current_login;
            }

            userObject = userObject.user;
            userObject = await this.User.selectOneUser([["unique_id", "=", userObject.unique_id]]);
            if (userObject === false) {
                let MessageType = this.MessageType.returnMessageType('logout');
                this.responseObject.setMesageType(MessageType);
                let errorMessage = this.ErrorMessages.ErrorMessageObjects.authentication_failed;
                throw new Error(errorMessage);
            }

            currentLoginObject.logged_out = 'logged_out';
            let updatedLoginObject = await this.LoginAuthModel.updateLoginAuth(currentLoginObject);

            //return value to view
            this.responseObject.setStatus(true);
            let MessageType = this.MessageType.returnMessageType('logout');
            this.responseObject.setMesageType(MessageType);
            this.responseObject.setMessage("You have been logged out successfully");
            res.json(this.responseObject.sendToView());

        } catch (e) {
            //send tthe error to the views
            this.responseObject.setStatus(false);
            this.responseObject.setMessage({ general_error: [ErrorHandler(e)] });
            res.json(this.responseObject.sendToView());
        }
    }


}

module.exports = TwoFactorController;
