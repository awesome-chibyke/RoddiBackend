const responseObject = require("./ViewController");
const Settings = require("../model/Settings");
const authData = require("../helpers/AuthenticateLogin");
const ErrorHandler = require("../helpers/ErrorHandler");
const AccountVerificationLevels = require("../helpers/AccountVerificationLevels");
const IdUploadSuccessTemplate = require("../Emails/EmailTemplates/IdUploadSuccessTemplate");
const User = require("../model/User");
const date = require("date-and-time");
const validator = require("../helpers/validator");
const ErrorMessages = require("../helpers/ErrorMessages");
const {SendGenericSms} = require("../helpers/SendGenericSms");
const {sendGenericMails} = require("../Emails/GenericMailSender");
const {moveFile} = require("../helpers/FileMover");

//import the mail managers
var mailler = require("../Emails/MailAccount");
const MailSetups = require("../Emails/MailSetups");
const twilio = require("twilio");

//file manager
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

class IdentityUploadController {

    constructor() {
        this.responseObject = new responseObject();
        this.User = new User();
        this.now = new Date();
        this.AccountVerificationLevels = new AccountVerificationLevels();
        this.Settings = new Settings();
        this.ErrorMessages = new ErrorMessages();
        this.errorMessage = '';
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

    async uploadIdCard(req, res){
        try{

            let filenameForBackDisplay = req.files['upload_id_card_back'][0].filename;
            let filenameForFrontDisplay = req.files['upload_id_card_front'][0].filename;

            let oldPathForBackDisplay = req.files['upload_id_card_back'][0].destination+'/'+filenameForBackDisplay;
            let oldPathForFrontDisplay = req.files['upload_id_card_front'][0].destination+'/'+filenameForFrontDisplay;

            let newPathForBackDisplay = './files/government_id_back/'+filenameForBackDisplay;
            let newPathForFrontDisplay = './files/government_id_front/'+filenameForFrontDisplay;

            //validation
            let validationRule = {
                document_number: "required|string"
            };
            this.valdateFunction(req, validationRule);
            if(this.errorStatus === false){
                //unlink the files
                await unlinkAsync(oldPathForFrontDisplay);
                await unlinkAsync(oldPathForBackDisplay);

                this.responseObject.setStatus(false);
                this.responseObject.setMessage(this.errorMessage.errors);
                return res.json(this.responseObject.sendToView());
            }

            //get the document number
            let documentNumber = req.body.document_number;

            let userObject = await authData(req);
            userObject = await this.User.selectOneUser([["unique_id", "=", userObject.user.unique_id]]);
            if(userObject === false){
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.authentication_failed;
                throw new Error(ErrorMessage);
            }

            if(userObject.face_upload_status === 'none'){
                throw new Error('Please carry out your face verification step first');
              }

            if(userObject.id_upload_status === this.AccountVerificationLevels.id_upload_pending){
                //unlink the files
                await unlinkAsync(oldPathForFrontDisplay);
                await unlinkAsync(oldPathForBackDisplay);
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.document_under_review;
                throw new Error(ErrorMessage);
            }

            if(userObject.id_upload_status === this.AccountVerificationLevels.id_upload_confirmed){
                //unlink the files
                await unlinkAsync(oldPathForFrontDisplay);
                await unlinkAsync(oldPathForBackDisplay);
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.id_confirmed;
                throw new Error(ErrorMessage);
            }

            //show the user that file upload failed
            if(typeof req.files === "undefined"){
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.file_upload_failed;
                throw new Error(ErrorMessage);
            }

            //move the files to the new path
            await moveFile(oldPathForBackDisplay, newPathForBackDisplay);
            await moveFile(oldPathForFrontDisplay, newPathForFrontDisplay);

            //add the file to the db
            let currenctDate = date.format(this.now, "YYYY-MM-DD HH:mm:ss");
            let updatedUserData = await this.User.updateUser({
                unique_id: userObject.unique_id,
                id_upload_status: this.AccountVerificationLevels.id_upload_pending,
                account_verification_step:this.AccountVerificationLevels.id_verification_step,
                id_name:filenameForFrontDisplay,
                id_back_name: filenameForBackDisplay,
                document_number:documentNumber,
                updated_at: currenctDate,
            });

            //send an email to the user that his
            let response = await this.sendEmailANDPhoneMessageForSuccessfulIDUpload(userObject);

            //send response to the view
            this.responseObject.setStatus(true);
            let userDataForView = await this.User.returnUserForView(updatedUserData);
            this.responseObject.setData({user:userDataForView});
            this.responseObject.setMessage("You have successfully uploaded your ID, please wait while we review the document");
            res.json(this.responseObject.sendToView());

        }catch(err){
            this.responseObject.setStatus(false);
            this.responseObject.setMessage({
                general_error: [ErrorHandler(err)],
            });
            res.json(this.responseObject.sendToView());
        }

    }

  //mail sending function
  async sendEmailANDPhoneMessageForSuccessfulIDUpload(userObject) {

    try {
        //select the system settings
        let systemSettings = await this.Settings.selectSettings([["id", "=", 1]]);

      let fullName = this.User.returnFullName(userObject);

        let emailSubject = "Successful Upload of Identification Document";
        let message = `You have successfully uploaded your form of Identification Document to ${systemSettings.site_name.toUpperCase()}. Please wait for a while as this document is under review. We will get back to you once we are done with the review.`;
        let mailSender = await sendGenericMails(userObject, fullName, systemSettings, emailSubject, message);

      //send sms to verified user phone number
    message = "You have successfully uploaded your Identification document to " +
        systemSettings.site_name.toUpperCase() +
        ". Please wait while we review your document. Thanks";
    if(userObject.phone_verification !== null){
        SendGenericSms(systemSettings, message, userObject);
    }

      return {
        status: true,
        message: "Email was successfully sent",
        data: mailSender,
      };
    } catch (err) {
      return {
        status: false,
        message: err,
        data: [],
      };
    }
  }
}

module.exports = IdentityUploadController;
