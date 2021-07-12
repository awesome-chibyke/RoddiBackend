const DbActions = require("../model/DbActions");
const Settings = require("./Settings");
const speakeasy = require("speakeasy");
const AccountVerificationLevels = require("../helpers/AccountVerificationLevels");
var QRCode = require("qrcode");
const ErrorHandler = require("../helpers/ErrorHandler");
class User {
  constructor() {
    this.DbActions = new DbActions();
    this.Settings = new Settings();
    this.AccountVerificationLevels = new AccountVerificationLevels();
    this.AccountActionDelayTimeForAdminAction = 48;
  }


  async selectAllUsersWhere(conditions, filterDeletedRow = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
    ////[["unique_id", "=", Currency]]
    let allUsers = await this.DbActions.selectBulkData("users", {filteringConditions: conditions}, filterDeletedRow, destroy, orderByColumns, orderByDirection);
    /*if (allUsers.length == 0) {
      return false;
    }*/
    return allUsers;
  }

  async selectAllUsers(conditions = [], filterDeletedRows = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
    ////[["unique_id", "=", Currency]]
    let allUsers = await this.DbActions.selectAllData("users", {
      filteringConditions: conditions}, filterDeletedRows, destroy, orderByColumns, orderByDirection);
    /*if (allUsers.length == 0) {
      return false;
    }*/
    return allUsers;
  }

  async updateUser(userObject) {

    //update the user
    await this.DbActions.updateData("users", {
      fields: userObject,
      filteringConditions: [["unique_id", "=", userObject.unique_id]],
    });
    //fetch the user
    let user = await this.DbActions.selectSingleRow("users", {
      filteringConditions: [["unique_id", "=", userObject.unique_id]],
    });

    return user;
  }

  returnFullName(userObject){//returns the fullname of a user from the user object
    let firstName = userObject.first_name === null || userObject.first_name === '' ? '' : userObject.first_name;
    let middleName = userObject.middle_name === null || userObject.middle_name === '' ? '' : userObject.middle_name;
    let lastName = userObject.last_name === null || userObject.last_name === '' ? '' : userObject.last_name;
    let fullName = firstName+' '+middleName+' '+lastName;
    return fullName;
  }

  async selectOneUser(conditions, filterDeletedRows = 'yes') {
    //conditions = [["email", "=", email]];
    let userObject = await this.DbActions.selectSingleRow("users", {
      filteringConditions: conditions,
    },filterDeletedRows);
    if (typeof userObject === "undefined") {
      return false;
    }
    return userObject;
  }

  async returnUserForView(userObj, userType = 'user') {
    if(userType === 'user'){
      delete userObj.document_number;
    }
    delete userObj.two_factor_temp_secret;
    delete userObj.two_factor_secret;
    delete userObj.password;
    userObj.currency_details = await this.fetchUserCurrency(userObj.preferred_currency);
    userObj.verifiation_details_object = this.AccountVerificationLevels.verifiation_details;
    userObj.current_verification_step = this.AccountVerificationLevels.checkUserVerificationStep(userObj);

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
