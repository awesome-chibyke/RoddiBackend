const responseObject = require("./ViewController");
const authData = require("../helpers/AuthenticateLogin");
const ErrorHandler = require("../helpers/ErrorHandler");
const User = require("../model/User");

class EditController {
  constructor() {
    this.responseObject = new responseObject();
    this.User = new User();
    this.now = new Date();
  }

  async edit(req, res) {
    try {
      //authenticate user
      let userObject = await authData(req);
      userObject = userObject.user;

      //update the user
      userObject.first_name = req.body.first_name;
      userObject.description = req.body.description;
      //userObject.email = req.body.email;
      userObject.email_verification = req.body.email_verification;
      userObject.middle_name = req.body.middle_name;
      userObject.country_code = req.body.country_code;
      userObject.status = req.body.status;
      userObject.passport = req.body.passport;
      userObject.id_upload_status = req.body.id_upload_status;
      userObject.id_name = req.body.id_name;
      userObject.face_upload_status = req.body.face_upload_status;
      userObject.face_picture_name = req.body.face_picture_name;
      userObject.face_pic_upload_date = req.body.face_pic_upload_date;
      userObject.account_verification_level =
        req.body.account_verification_level;
      userObject.wallet_public_key = req.body.wallet_public_key;
      userObject.wallet_primary_key = req.body.wallet_primary_key;
      userObject.wallet_id = req.body.wallet_id;
      userObject.start_date = req.body.start_date;
      userObject.due_date = req.body.due_date;
      userObject.password = req.body.password;
      userObject.phone = req.body.phone;
      userObject.auth_type = req.body.auth_type;
      userObject.address = req.body.address;
      userObject.state = req.body.state;
      userObject.country = req.body.country;
      userObject.preferred_currency = req.body.preferred_currency;
      userObject.type_of_user = req.body.type_of_user;
      userObject.referral_id = req.body.referral_id;
      userObject.referrer_id = req.body.referrer_id;
      userObject.status = req.body.status;

      let updatedUserObject = this.User.updateUser(userObject);

      //return value to view
      this.responseObject.setStatus(true);
      this.responseObject.setData(updatedUserObject);
      this.responseObject.setMessage("Update was a success");
      res.json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(e)],
      });
      res.json(this.responseObject.sendToView());
    }
  }

}

module.exports = EditController;
