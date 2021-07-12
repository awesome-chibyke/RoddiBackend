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
const { sendGenericMails } = require("../../Emails/GenericMailSender");
const ErrorMessages = require("../../helpers/ErrorMessages");
const DbActions = require("../../model/DbActions");
const { SendGenericSms } = require("../../helpers/SendGenericSms");

//import the mail managers
var mailler = require("../../Emails/MailAccount");
const MailSetups = require("../../Emails/MailSetups");

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
  async SelectAllUserForAdminView(req, res) {
    try {
      //authenticate user
      let userObject = await authData(req);
      userObject = await this.User.selectOneUser([
        ["unique_id", "=", userObject.user.unique_id],
      ]);
      if (userObject === false) {
        let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user;
        throw new Error(ErrorMessage);
      }

      let type_of_user = req.params.type_of_user;

      let allUsers = await this.User.selectAllUsersWhere(
        [["type_of_user", "=", type_of_user]],
        "no"
      );

      //return value to view
      this.responseObject.setStatus(true);
      this.responseObject.setData({ all_users: allUsers });
      this.responseObject.setMessage("User have been successfully returned");
      res.json(this.responseObject.sendToView());
    } catch (err) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }
  }

  //select all user for admin view
  async SelectOneUserForAdminView(req, res) {
    try {
      //authenticate user
      let userObject = await authData(req);
      userObject = await this.User.selectOneUser([
        ["unique_id", "=", userObject.user.unique_id],
      ]);
      if (userObject === false) {
        let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user;
        throw new Error(ErrorMessage);
      }

      let unique_id = req.params.unique_id;
      let UserObject = await this.User.selectOneUser(
        [["unique_id", "=", unique_id]],
        "no"
      );
      if (UserObject === false) {
        UserObject = null;
      }

      //return value to view
      this.responseObject.setStatus(true);
      this.responseObject.setData({ single_user: UserObject });
      this.responseObject.setMessage("User have been successfully returned");
      res.json(this.responseObject.sendToView());
    } catch (err) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }
  }

  //select all user for admin view
  async deleteUser(req, res) {
    try {
      //the details fromm param
      let type_of_user = req.params.type_of_user;
      let unique_id = req.params.unique_id;

      //authenticate user
      let userObject = await authData(req);
      userObject = await this.User.selectOneUser([
        ["unique_id", "=", userObject.user.unique_id],
      ]);
      if (userObject === false) {
        let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user;
        throw new Error(ErrorMessage);
      }

      let UserToDelete = await this.User.selectOneUser(
        [
          ["unique_id", "=", unique_id],
          ["type_of_user", "=", type_of_user],
        ],
        "no"
      );
      if (UserToDelete === false) {
        throw new Error("Id supplied does not match that of any user");
      }

      //delete the user
      await this.DbActions.deleteDataFromTable(
        "users",
        "unique_id",
        unique_id,
        ["code_table"],
        "user_unique_id"
      );

      let allUsers = await this.User.selectAllUsersWhere(
        [["type_of_user", "=", type_of_user]],
        "no"
      );

      //return value to view
      this.responseObject.setStatus(true);
      this.responseObject.setData({ all_users: allUsers });
      this.responseObject.setMessage("User have been successfully deleted");
      res.json(this.responseObject.sendToView());
    } catch (err) {
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
        first_name: "string",
        last_name: "string",
        middle_name: "string",
        address: "string",
        state: "string",
        country: "string",
        city: "string",
        zip_code: "numeric",
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
        ["unique_id", "=", userObject.user.unique_id],
      ]);
      if (userObject === false) {
        throw new Error("User does not exist");
      }

      //update the user
      userObject.first_name = req.body.first_name || userObject.first_name;
      userObject.middle_name = req.body.middle_name;
      userObject.last_name = req.body.last_name;
      userObject.address = req.body.address;
      userObject.state = req.body.state;
      userObject.country = req.body.country;
      userObject.city = req.body.city;
      userObject.zip_code = req.body.zip_code;
      userObject.account_verification_level =
        parseFloat(userObject.account_verification_level) +
        parseFloat(
          this.AccountVerificationLevels.profile_update_verification_level
        ); //bring the profile update level //bring the profile update level
      userObject.account_verification_step =
        this.AccountVerificationLevels.profile_update_verification_step; //bring the profile update level

      let updatedUserObject = await this.User.updateUser(userObject);

      //return value to view
      this.responseObject.setStatus(true);
      let userObjectForView = await this.User.returnUserForView(
        updatedUserObject
      );
      this.responseObject.setData({ user: userObjectForView });
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

  async manageUserAccount(req, res) {
    try {
      let updateDetails = "",
        updatedUserObject = {};

      let actionKeyword = req.body.action; //the action from the user side, it can be any of the values in the actionArray
      let unique_id = req.body.unique_id; //the unique_id of the user that the action is being performed on his/her account

      let loggedUser = await authData(req); //authenticate the logged in admin
      loggedUser = await this.User.selectOneUser([
        ["unique_id", "=", loggedUser.user.unique_id],
      ]);
      if (loggedUser === false) {
        let ErrorMessage =
          this.ErrorMessages.ErrorMessageObjects.authentication_failed;
        throw new Error(ErrorMessage);
      }

      let mainUserObject = await this.User.selectOneUser([
        ["unique_id", "=", unique_id],
      ]);
      if (mainUserObject === false) {
        let errorMessage = this.ErrorMessages.ErrorMessageObjects.invalid_user;
        throw new Error(errorMessage);
      }

      let actionArray = [
        "make_user",
        "make_admin",
        "make_mid_admin",
        "make_super_admin",
        "make_status_active",
        "make_status_inactive",
        "confirm_id_upload",
        "unconfirm_id_upload",
        "decline_id_upload",
        "confirm_face_upload",
        "unconfirm_face_upload",
        "decline_face_upload",
      ]; //action array
      let columnName = [
        "type_of_user",
        "type_of_user",
        "type_of_user",
        "type_of_user",
        "status",
        "status",
        "id_upload_status",
        "id_upload_status",
        "id_upload_status",
        "face_upload_status",
        "face_upload_status",
        "face_upload_status",
      ]; //column name where the action will be perform
      let valueArray = [
        "user",
        "admin",
        "mid_admin",
        "super_admin",
        "active",
        "inactive",
        this.AccountVerificationLevels.id_upload_confirmed,
        this.AccountVerificationLevels.id_upload_unconfirmed,
        this.AccountVerificationLevels.id_upload_declined,
        this.AccountVerificationLevels.id_face_confirmed,
        this.AccountVerificationLevels.id_face_unconfirmed,
        this.AccountVerificationLevels.id_face_declined,
      ]; //value that will inserted into the column

      if (actionArray.includes(actionKeyword)) {
        //check if the action exists in the action array
        let key = actionArray.indexOf(actionKeyword); //get the action index from the array
        let column = columnName[key]; //get the column name
        let $value = valueArray[key]; //get the value to be inserted

        let objectsForUpdate = { unique_id: unique_id };
        objectsForUpdate[column] = $value; //created the update object

        //Confirm user id upload
        if (actionKeyword === "confirm_id_upload") {
          objectsForUpdate.account_verification_level =
            parseFloat(mainUserObject.account_verification_level) +
            parseFloat(this.AccountVerificationLevels.id_verification_level);
          objectsForUpdate.account_verification_step =
            this.AccountVerificationLevels.id_verification_step;

          await this.sendMessages(updatedUserObject, "confirm");
        }

        //Unconfirm user id upload
        if (actionKeyword === "unconfirm_id_upload") {
          objectsForUpdate.id_upload_status = req.body.id_upload_status;
          (objectsForUpdate.account_verification_level =
            parseFloat(mainUserObject.account_verification_level) -
            parseFloat(this.AccountVerificationLevels.id_verification_level)),
            (objectsForUpdate.account_verification_step =
              this.AccountVerificationLevels.face_verification_step);
        }

        // decline user id upload
        if (actionKeyword === "decline_id_upload") {
          (objectsForUpdate.account_verification_level =
            parseFloat(mainUserObject.account_verification_level) -
            parseFloat(this.AccountVerificationLevels.id_verification_level)),
            (objectsForUpdate.account_verification_step =
              this.AccountVerificationLevels.face_verification_step);

          updateDetails = await this.sendMessages(
            updatedUserObject,
            "declined"
          );
        }

        //Confirm user face upload
        if (actionKeyword === "confirm_face_upload") {
          objectsForUpdate.account_verification_level =
            parseFloat(mainUserObject.account_verification_level) +
            parseFloat(this.AccountVerificationLevels.face_verification_level);
          objectsForUpdate.account_verification_step =
            this.AccountVerificationLevels.face_verification_step;

          await this.sendMessages(updatedUserObject, "confirm");
        }

        //Unconfirm user face upload
        if (actionKeyword === "unconfirm_face_upload") {
          objectsForUpdate.face_upload_status = req.body.face_upload_status;
          (objectsForUpdate.account_verification_level =
            parseFloat(mainUserObject.account_verification_level) -
            parseFloat(
              this.AccountVerificationLevels.phone_verification_level
            )),
            (objectsForUpdate.account_verification_step =
              this.AccountVerificationLevels.phone_verification_step);
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
              // decline user face upload
        if (actionKeyword === "decline_id_upload") {
          (objectsForUpdate.account_verification_level =
            parseFloat(mainUserObject.account_verification_level) -
            parseFloat(
              this.AccountVerificationLevels.phone_verification_level
            )),
            (objectsForUpdate.account_verification_step =
              this.AccountVerificationLevels.phone_verification_step);

          updateDetails = await this.sendMessages(
            updatedUserObject,
            "declined"
          );
          console.log(this.sendMessages)

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

        updatedUserObject = await this.User.updateUser(objectsForUpdate); //update user

        //send response to the view
        this.responseObject.setStatus(true);
        let userDataForView = await this.User.returnUserForView(
          updatedUserObject,
          loggedUser.type_of_user
        );
        this.responseObject.setData({ user: userDataForView });
        this.responseObject.setMessage(
          "You Have Successfully Updated The User Account"
        );
        res.json(this.responseObject.sendToView());
      } else {
        let ErrorMessage =
          this.ErrorMessages.ErrorMessageObjects.invalid_action;
        throw new Error(ErrorMessage);
      }
    } catch (err) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }
  }

  async sendMessages(
    userObject,
    actionConfirm = "confirm",
    actionDecline = "declined"
  ) {
    try {
      let mailSender = "";
      let systemSettings = await this.Settings.selectSettings([["id", "=", 1]]);
      // Send confirm id upload message
      if (actionConfirm === "confirm") {
        let message = "Your identity verification has been confirmed!";
        let fullName = this.User.returnFullName(userObject);
        let emailSubject = "Successful Confirmation of ID document";
        mailSender = await sendGenericMails(
          userObject,
          fullName,
          systemSettings,
          emailSubject,
          message
        );

        //send sms to verified user phone number
        if (userObject.phone_verification !== null) {
          SendGenericSms(systemSettings, message, userObject);
        }
      }
      // Send decline id upload message
      if (actionDecline === "declined") {
        let message = "Your identity verification has been declined!";
        let fullName = this.User.returnFullName(userObject);
        let emailSubject = "ID upload is declined";
        mailSender = await sendGenericMails(
          userObject,
          fullName,
          systemSettings,
          emailSubject,
          message
        );

        //send sms to verified user phone number
        if (userObject.phone_verification !== null) {
          SendGenericSms(systemSettings, message, userObject);
        }
      }

      // Send confirm face upload message
      if (actionConfirm === "confirm") {
        let message = "Your face verification has been confirmed!";
        let fullName = this.User.returnFullName(userObject);
        let emailSubject = "Successful Confirmation of ID document";
        mailSender = await sendGenericMails(
          userObject,
          fullName,
          systemSettings,
          emailSubject,
          message
        );

        //send sms to verified user phone number
        if (userObject.phone_verification !== null) {
          SendGenericSms(systemSettings, message, userObject);
        }
      }
      // Send decline face upload message
      if (actionDecline === "declined") {
        let message = "Your face verification has been declined!";
        let fullName = this.User.returnFullName(userObject);
        let emailSubject = "ID upload is declined";
        mailSender = await sendGenericMails(
          userObject,
          fullName,
          systemSettings,
          emailSubject,
          message
        );

        //send sms to verified user phone number
        if (userObject.phone_verification !== null) {
          SendGenericSms(systemSettings, message, userObject);
        }
      }

      return {
        status: true,
        message: "message was successfully sent",
      };
    } catch (e) {
      return {
        status: false,
        message: e.message,
        data: [],
      };
    }
  }
}

module.exports = EditController;
