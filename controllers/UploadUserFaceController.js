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

    async uploadFaceCard(req, res){
        try{

            //show the user that file upload failed
            if(typeof req.file === "undefined"){
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.file_upload_failed;
                throw new Error(ErrorMessage);
            }

            let filename = req.file.filename;

            let oldPathForDisplay = req.file.destination+'/'+filename;

            let userObject = await authData(req);
            userObject = await this.User.selectOneUser([["unique_id", "=", userObject.user.unique_id]]);
            if(userObject === false){
                await unlinkAsync(oldPathForDisplay);
                this.responseObject.setData([]);
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.authentication_failed;
                throw new Error(ErrorMessage);
            }

            if(userObject.face_upload_status === this.AccountVerificationLevels.id_face_pending){
                //unlink the files
                await unlinkAsync(oldPathForDisplay);
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.document_under_review;
                throw new Error(ErrorMessage);
            }

            if(userObject.face_upload_status === this.AccountVerificationLevels.id_face_confirmed){
                //unlink the files
                await unlinkAsync(oldPathForDisplay);
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.file_upload_failed;
                throw new Error(ErrorMessage);
            }

            //move the files to the new path
            //await moveFile(oldPathForDisplay, newPathForDisplay);

            //add the file to the db
            let currenctDate = date.format(this.now, "YYYY-MM-DD HH:mm:ss");
            let updatedUserData = await this.User.updateUser({
                unique_id: userObject.unique_id,
                face_upload_status:this.AccountVerificationLevels.id_face_pending,
                face_picture_name:filename,
                account_verification_step:this.AccountVerificationLevels.face_verification_step,
                face_pic_upload_date:currenctDate,
                updated_at: currenctDate,
            });

            //select the system settings
            let systemSettings = await this.Settings.selectSettings([["id", "=", 1]]);

            //send an email  and phone sms to the user
            await this.sendEmailANDPhoneMessageForSuccessfulIDUpload(userObject, systemSettings);

            //send response to the view
            this.responseObject.setStatus(true);
            let userDataForView = await this.User.returnUserForView(updatedUserData);
            this.responseObject.setData({user:userDataForView});
            this.responseObject.setMessage("You have successfully uploaded your Face ID, please wait while we review the document");
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
    async sendEmailANDPhoneMessageForSuccessfulIDUpload(userObject, systemSettings) {

        try {

            let fullName = this.User.returnFullName(userObject);

            let emailSubject = "Successful Upload of Face ID";
            let message = `You have successfully uploaded your face ID to ${systemSettings.site_name.toUpperCase()}. Please wait for a while as this document is under review. We will get back to you once we are done with the review.`;
            let mailSender = await sendGenericMails(userObject, fullName, systemSettings, emailSubject, message);

            //send sms to verified user phone number
            message = "You have successfully uploaded your face ID to " +
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