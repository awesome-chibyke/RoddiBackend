const responseObject = require("./ViewController");
const Settings = require("../model/Settings");
const authData = require("../helpers/AuthenticateLogin");
const ErrorHandler = require("../helpers/ErrorHandler");
const AccountVerificationLevels = require("../helpers/AccountVerificationLevels");
const IdUploadSuccessTemplate = require("../Emails/EmailTemplates/IdUploadSuccessTemplate");
const User = require("../model/User");
const date = require("date-and-time");
const validator = require("../helpers/validator");

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
        this.errorMessage = '';
    }

    valdateFunction(req, ValidationRule){
        validator(req.body, ValidationRule, {}, (err, status) => {
            if (!status) {
                this.errorMessage = err;
                return 'failed';
            }
            return status;
        })
    }

    async uploadIdCard(req, res){
        try{

            //validation
            let validationRule = {
                document_number: "required|string"
            };
            let validateUser = this.valdateFunction(req, validationRule);
            if(validateUser === 'failed'){
                this.responseObject.setStatus(false);
                this.responseObject.setMessage(this.errorMessage.errors);
                return res.json(this.responseObject.sendToView());
            }

            //get the document number
            let documentNumber = req.body.document_number;

            let userObject = await authData(req);
            userObject = await this.User.selectOneUser([["unique_id", "=", userObject.user.unique_id]]);
            if(userObject === false){
                throw new Error('User not found');
            }

            if(userObject.id_upload_status === this.AccountVerificationLevels.id_upload_pending){
                //unlink the file
                await unlinkAsync(req.file.path);
                throw new Error('your uploaded document is still under review');
            }

            if(userObject.id_upload_status === this.AccountVerificationLevels.id_upload_confirmed){
                //unlink the file
                await unlinkAsync(req.file.path);
                throw new Error('your ID has been confirmed');
            }

            //show the user that file upload failed
            if(typeof req.file === "undefined"){
                throw new Error('File Upload failed');
            }

            //add the file to the db
            let currenctDate = date.format(this.now, "YYYY-MM-DD HH:mm:ss");
            await this.User.updateUser({
                unique_id: userObject.unique_id,
                id_upload_status: this.AccountVerificationLevels.id_upload_pending,
                id_name: req.file.filename,
                document_number:documentNumber,
                updated_at: currenctDate,
            });

            //send an email to the user that his
            let response = await this.sendEmailANDPhoneMessageForSuccessfulIDUpload(userObject);

            //send response to the view
            this.responseObject.setStatus(true);
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
      let fullName = this.User.returnFullName(userObject);

      //select the system settings
      let systemSettings = await this.Settings.selectSettings([["id", "=", 1]]);
      //title message for the mail
      const emailTitle = "Successful Upload of Identification Document";

      if (systemSettings === false) {
        throw new Error("System settings could not be retrieved");
      } //show errror if the system settings cant be returned
      let EmailTemplate = IdUploadSuccessTemplate(
        fullName,
        emailTitle,
        systemSettings
      );

      //send the email to  the user
      let mailSetup = MailSetups(
        userObject.email,
        emailTitle,
        EmailTemplate,
        systemSettings
      );

      let mailSender = await mailler(mailSetup);
      //console.log(mailSender);

      //send sms to verified user phone number
      if (userObject.phone_verification !== null) {
        var accountSid = process.env.TWILIO_ACCOUNT_SID;
        var authToken = process.env.TWILIO_AUTH_TOKEN;

        var client = new twilio(accountSid, authToken);

        client.messages
          .create({
            body:
              "You have successfully uploaded your Identification document to " +
              systemSettings.site_name.toUpperCase() +
              ". Please wait while we review your document. Thanks",
            to: userObject.phone,
            from: "+12242035261",
          })
          .then((message) => {
            return message;
          });
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
