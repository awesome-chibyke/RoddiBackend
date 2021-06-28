const DbActions = require("../model/DbActions");
const Settings = require("./Settings");
const speakeasy = require("speakeasy");
var QRCode = require("qrcode");
const ErrorHandler = require("../helpers/ErrorHandler");
class User {
  constructor() {
    this.DbActions = new DbActions();
    this.Settings = new Settings();
  }

  async updateUser(userObject) {
    //fetch the user
    let user = await this.DbActions.selectSingleRow("users", {
      filteringConditions: [["unique_id", "=", userObject.unique_id]],
    });
    user.first_name = userObject.first_name ?? user.first_name;
    user.description = userObject.description ?? user.description;
    user.last_name = userObject.last_name ?? user.last_name;
    user.email = userObject.email ?? user.email;
    user.email_verification =
      userObject.email_verification ?? user.email_verification;
    user.middle_name = userObject.middle_name ?? user.middle_name;
    user.country_code = userObject.country_code ?? user.country_code;
    user.status = userObject.status ?? user.status;
    user.passport = userObject.passport ?? user.passport;
    user.id_upload_status =
      userObject.id_upload_status ?? user.id_upload_status;
    user.id_name = userObject.id_name ?? user.id_name;
    user.face_upload_status =
      userObject.face_upload_status ?? user.face_upload_status;
    user.face_picture_name =
      userObject.face_picture_name ?? user.face_picture_name;
    user.face_pic_upload_date =
      userObject.face_pic_upload_date ?? user.face_pic_upload_date;
    user.account_verification_level =
      userObject.account_verification_level ?? user.account_verification_level;
    user.wallet_public_key =
      userObject.wallet_public_key ?? user.wallet_public_key;
    user.wallet_primary_key =
      userObject.wallet_primary_key ?? user.wallet_primary_key;
    user.wallet_id = userObject.wallet_id ?? user.wallet_id;
    user.start_date = userObject.start_date ?? user.start_date;
    user.due_date = userObject.due_date ?? user.due_date;
    user.password = userObject.password ?? user.password;
    user.phone = userObject.phone ?? user.phone;
    user.auth_type = userObject.auth_type ?? user.auth_type;
    user.address = userObject.address ?? user.address;
    user.state = userObject.state ?? user.state;
    user.country = userObject.country ?? user.country;
    user.preferred_currency =
      userObject.preferred_currency ?? user.preferred_currency;
    user.type_of_user = userObject.type_of_user ?? user.type_of_user;
    user.referral_id = userObject.referral_id ?? user.referral_id;
    user.referrer_id = userObject.referrer_id ?? user.referrer_id;
    user.status = userObject.status ?? user.status;
    user.created_at = userObject.created_at ?? user.created_at;
    user.updated_at = userObject.updated_at ?? user.updated_at;
    user.two_factor_temp_secret =
      userObject.two_factor_temp_secret ?? user.two_factor_temp_secret;
    user.two_factor_secret =
      userObject.two_factor_secret ?? user.two_factor_secret;

    //update the user
    await this.DbActions.updateData("users", {
      fields: userObject,
      filteringConditions: [["unique_id", "=", userObject.unique_id]],
    });
    return user;
  }

  returnFullName(userObject){//returns the fullname of a user from the user object
    let firstName = userObject.first_name === null || userObject.first_name === '' ? '' : userObject.first_name;
    let middleName = userObject.middle_name === null || userObject.middle_name === '' ? '' : userObject.middle_name;
    let lastName = userObject.last_name === null || userObject.last_name === '' ? '' : userObject.last_name;
    let fullName = firstName+' '+middleName+' '+lastName;
    console.log(fullName);
    return fullName;
  }

  async selectOneUser(conditions) {
    //conditions = [["email", "=", email]];
    let userObject = await this.DbActions.selectSingleRow("users", {
      filteringConditions: conditions,
    });
    if (typeof userObject === "undefined") {
      return false;
    }
    return userObject;
  }

  async returnUserForView(userObj) {
    delete userObj.password;
    delete userObj.password;
    delete userObj.two_factor_temp_secret;
    delete userObj.two_factor_secret;
    userObj.currency_details = await this.fetchUserCurrency(userObj.preferred_currency);
    return userObj;
  }

  //generate token
  async generateToken(userObject) {
    try {
      let settings = this.Settings.selectSettings([["id", "=", 1]]); //console.log(this.DbActions);
      if (settings === false) {
        throw new Error("Settings can not be accessed at this time");
      }
      var secret = speakeasy.generateSecret({ length: 20 });
      //create the secret for the transaction
      var secret = speakeasy.generateSecret({
        name: settings.site_name,
        length: 20,
      });

      // Example for storing the secret key somewhere (varies by implementation):
      let two_factor_temp_secret = secret.base32;

      var token = speakeasy.totp({
        secret: secret.base32,
        encoding: "base32",
      });

      //update the user with the new key provided
      let updatedUserObject = await this.updateUser({
        two_factor_temp_secret: two_factor_temp_secret,
        unique_id: userObject.unique_id,
      });
      // Get the data URL of the authenticator URL
      return true;
    } catch (e) {
      return e;
    }
  }

  //final activation of the user for two factor authentication
  async verifyAToken(req, userObject) {
    try {
      //get the token from the request body
      let tokenSupplied = req.body.token;
      //select the temporal key that was saved for  the two factor
      //select the user involved
      let selectedUserObject = await this.selectOneUser([
        ["unique_id", "=", userObject.unique_id],
      ]);
      if (selectedUserObject === false) {
        throw new Error("Invalid User details supplied");
      }
      let base32secret = selectedUserObject.two_factor_secret;

      //check the token supplied to make sure its validate
      var verified = speakeasy.totp.verify({
        secret: base32secret,
        encoding: "base32",
        token: tokenSupplied,
      });
      if (verified === false) {
        throw new Error("Invalid Token");
      }

      return {
        status: true,
        message: "token validation was successful",
        message_type: "normal",
        data: [],
      };
    } catch (e) {
      return {
        status: false,
        message: ErrorHandler(e),
        message_type: "normal",
        data: [],
      };
    }
  }

  async fetchUserCurrency(CurrencyId){

    return await this.DbActions.selectSingleRow("currency_rates_models", {
      filteringConditions: [["unique_id", "=", CurrencyId]],
    });
  }
}

module.exports = User;
