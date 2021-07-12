const responseObject = require("../ViewController");
const authData = require("../../helpers/AuthenticateLogin");
const AuthenticationCode = require("../../helpers/AuthenticationCode");
const AccountVerificationLevels = require("../../helpers/AccountVerificationLevels");
const ErrorHandler = require("../../helpers/ErrorHandler");
const User = require("../../model/User");
const date = require("date-and-time");
const validator = require("../../helpers/validator");
const Settings = require("../../model/Settings");
const twilio = require("twilio");
const {sendGenericMails} = require("../../Emails/GenericMailSender");
const ErrorMessages = require("../../helpers/ErrorMessages");
const DbActions = require("../../model/DbActions");

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
        this.ErrorMessages = new ErrorMessages();
        this.DbActions = new DbActions();
    }

    valdateFunction(req, ValidationRule) {
        validator(req.body, ValidationRule, {}, (err, status) => {
            if (status === false) {
                this.errorMessage = err;
            }
            this.errorStatus = status;
        });
    }

    //select all user for admin view
    async SelectAllUserForAdminView(req, res){
        try{
            //authenticate user
            let userObject = await authData(req);
            userObject = await this.User.selectOneUser([['unique_id', '=', userObject.user.unique_id]]);
            if(userObject === false){
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user;
                throw new Error(ErrorMessage);
            }

            let type_of_user = req.params.type_of_user;

            let allUsers = await this.User.selectAllUsersWhere([
                ['type_of_user', '=', type_of_user]
            ],'no');

            //return value to view
            this.responseObject.setStatus(true);
            this.responseObject.setData({all_users:allUsers});
            this.responseObject.setMessage("User have been successfully returned");
            res.json(this.responseObject.sendToView());
        }catch(err){
            this.responseObject.setStatus(false);
            this.responseObject.setMessage({
                general_error: [ErrorHandler(err)],
            });
            res.json(this.responseObject.sendToView());
        }
    }

    //select all user for admin view
    async SelectOneUserForAdminView(req, res){
        try{
            //authenticate user
            let userObject = await authData(req);
            userObject = await this.User.selectOneUser([['unique_id', '=', userObject.user.unique_id]]);
            if(userObject === false){
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user;
                throw new Error(ErrorMessage);
            }

            let unique_id = req.params.unique_id;
            let UserObject = await this.User.selectOneUser([
                ['unique_id', '=', unique_id]
            ],'no');
            if(UserObject === false){
                UserObject = null;
            }

            //return value to view
            this.responseObject.setStatus(true);
            this.responseObject.setData({single_user:UserObject});
            this.responseObject.setMessage("User have been successfully returned");
            res.json(this.responseObject.sendToView());
        }catch(err){
            this.responseObject.setStatus(false);
            this.responseObject.setMessage({
                general_error: [ErrorHandler(err)],
            });
            res.json(this.responseObject.sendToView());
        }
    }

    //select all user for admin view
    async deleteUser(req, res){
        try{
            //the details fromm param
            let type_of_user = req.params.type_of_user;
            let unique_id = req.params.unique_id;

            //authenticate user
            let userObject = await authData(req);
            userObject = await this.User.selectOneUser([['unique_id', '=', userObject.user.unique_id]]);
            if(userObject === false){
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user;
                throw new Error(ErrorMessage);
            }

            let UserToDelete = await this.User.selectOneUser([
                ['unique_id', '=', unique_id],['type_of_user', '=', type_of_user]
            ],'no');
            if(UserToDelete === false){
                throw new Error('Id supplied does not match that of any user');
            }

            //delete the user
            await this.DbActions.deleteDataFromTable('users', 'unique_id', unique_id, ['code_table'], 'user_unique_id');

            let allUsers = await this.User.selectAllUsersWhere([
                ['type_of_user', '=', type_of_user]
            ],'no');

            //return value to view
            this.responseObject.setStatus(true);
            this.responseObject.setData({all_users:allUsers});
            this.responseObject.setMessage("User have been successfully deleted");
            res.json(this.responseObject.sendToView());

        }catch(err){
            this.responseObject.setStatus(false);
            this.responseObject.setMessage({
                general_error: [ErrorHandler(err)],
            });
            res.json(this.responseObject.sendToView());
        }
    }

    async edit(req, res) {
        try {
            //validation
            let validationRule = {
                first_name: "required|string",
                last_name: "required|string",
                middle_name: "required|string",
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

    async manageUserAccount(req, res){

        try{

            let actionKeyword = req.body.action;//the action from the user side, it can be any of the values in the actionArray
            let unique_id = req.body.unique_id;//the unique_id of the user that the action is being performed on his/her account

            let loggedUser = await authData(req);//authenticate the logged in admin
            loggedUser = await this.User.selectOneUser([["unique_id", "=", loggedUser.user.unique_id]]);
            if(loggedUser === false){
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.authentication_failed;
                throw new Error(ErrorMessage);
            }

            let actionArray = ['make_admin', 'make_super_admin', 'make_user', 'make_publisher', 'make_accountant'];//action array
            let columnName = ['user_type','user_type','user_type','user_type', 'user_type'];//column name where the action will be perform
            let valueArray = ['admin', 'super_admin', 'user', 'publisher', 'accountant'];//value that will inserted into the column

            if(actionArray.includes(actionKeyword)){//check if the action exists in the action array
                let key = actionArray.indexOf(actionKeyword);//get the action index from the array
                let column = columnName[key];//get the column name
                let $value = valueArray[key];//get the value to be inserted

                let objectsForUpdate = {unique_id:unique_id};
                objectsForUpdate[column] = $value;//created the update object

                let updatedUserObject = await this.User.updateUser(objectsForUpdate);//update the user

                //u can extend the funtion from this point

                //send response to the view
                this.responseObject.setStatus(true);
                let userDataForView = await this.User.returnUserForView(updatedUserObject, loggedUser.type_of_user);
                this.responseObject.setData({user:userDataForView});
                this.responseObject.setMessage("Update was successful");
                res.json(this.responseObject.sendToView());

            }else{
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_action;
                throw new Error(ErrorMessage);
            }
        }catch (err) {
            this.responseObject.setStatus(false);
            this.responseObject.setMessage({
                general_error: [ErrorHandler(err)],
            });
            res.json(this.responseObject.sendToView());
        }

    }

}

module.exports = EditController;
