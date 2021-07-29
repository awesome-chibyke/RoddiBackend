const DbActions = require("../model/DbActions");
const User = require("../model/User");
const Settings = require("../model/Settings");
const Generics = require("../helpers/Generics");
const PasswordHasher = require("../helpers/PasswordHasher");
const date = require("date-and-time");
const jwt = require("jsonwebtoken");
const { SendGenericSms } = require("../helpers/SendGenericSms");
const { sendGenericMails } = require("../Emails/GenericMailSender");

class LoginAuthModel {
  constructor() {
    this.DbActions = new DbActions();
    this.Generics = new Generics();
    this.User = new User();
    this.PasswordHasher = new PasswordHasher();
    this.Settings = new Settings();
  }
  async updateLoginAuth(requestObject) {
    //update the settings object
    await this.DbActions.updateData("login_table", {
      fields: requestObject,
      filteringConditions: [["unique_id", "=", requestObject.unique_id]],
    });
    //fetch the settings object
    let settings = await this.DbActions.selectSingleRow("login_table", {
      filteringConditions: [["unique_id", "=", requestObject.unique_id]],
    });
    return settings;
  }

  async selectOneLogin(conditions) {
    //conditions = [["email", "=", email]];
    let loginAuthObject = await this.DbActions.selectSingleRow("login_table", {
      filteringConditions: conditions,
    });
    
    if (typeof loginAuthObject === "undefined") {
      return false;
    }
    return loginAuthObject;
  }

  async selectAllLoginAuthWhere(
    conditions,
    filterDeletedRow = "yes",
    destroy = "no",
    orderByColumns = "id",
    orderByDirection = "desc"
  ) {
    ////[["unique_id", "=", Currency]]
    let allUsers = await this.DbActions.selectBulkData(
      "login_table",
      { filteringConditions: conditions },
      filterDeletedRow,
      destroy,
      orderByColumns,
      orderByDirection
    );
    return allUsers;
  }

  async selectAllLoginAuth(
    conditions = [],
    filterDeletedRows = "yes",
    destroy = "no",
    orderByColumns = "id",
    orderByDirection = "desc"
  ) {
    ////[["unique_id", "=", Currency]]
    let allUsers = await this.DbActions.selectAllData(
      "login_table",
      {
        filteringConditions: conditions,
      },
      filterDeletedRows,
      destroy,
      orderByColumns,
      orderByDirection
    );
    return allUsers;
  }

  secondLayerAuth(userObject) {
    return new Promise(function (resolve, reject) {
      //create the jwt token and send to the view
      jwt.sign({ user: userObject }, "secretkey", async (err, token) => {
        if (err) {
          reject(err);
        } else {
          //
          resolve(token);
        }
      });
    });
  }

  async generateToken(userObject, ip_address, device_name, Token, location) {
    const now = new Date();
    let currentDate = date.format(now, "YYYY-MM-DD HH:mm:ss");
    let expirationTimeFromCreatedTime = date.addDays(now, 2);
    expirationTimeFromCreatedTime = date.format(
        expirationTimeFromCreatedTime,
        "YYYY-MM-DD HH:mm:ss"
    );
    let uniqueIdDetails = await this.Generics.createUniqueId(
        "login_table",
        "unique_id"
    );
    if (uniqueIdDetails.status === false) {
      throw new Error(uniqueIdDetails.message);
    }

    //check if the incoming device has been stored before
    let loginAuthDetails = await this.selectAllLoginAuthWhere([
      ["device_name", "=", device_name],
    ]);
    if (loginAuthDetails.length == 0) {
      //that means that the user has not logged in with the device before

      let settingsDetails = await this.Settings.selectSettings();

      //send an email to the user that his/her account has been logged into from an unknown position
      let emailSubject = "Account login Activity from an unknown device";
      let message = `A login activity just occurred on your account with ${settingsDetails.site_name}. Details are listed below: <br> <strong>Email</strong>: userObject.email. <br> <strong>Device Name</strong>: ${device_name}. <br> <strong>Login Time</strong>: ${currentDate}. <br> <strong>IP Address</strong>: ${ip_address}. <br><strong>Location</strong>: ${location}. <br> Please click the link if you did not authorize this action.${settingsDetails.site_url}/login/disable_login/${uniqueIdDetails.data}`;
      let fullName = this.User.returnFullName(userObject);

      await sendGenericMails(
          userObject,
          fullName,
          settingsDetails,
          emailSubject,
          message
      );
    }

    if (loginAuthDetails.length > 0) {
      //a situation where the user has loged in with the device

      //loop through the devices and check the already existing device as off
      for (let u in loginAuthDetails) {
        if (loginAuthDetails[u].logged_out === "none") {
          await this.updateLoginAuth({
            unique_id: loginAuthDetails[u].unique_id,
            logged_out: "yes",
          });
        }
      }
    }

    let hashedToken = await this.PasswordHasher.hashPassword(Token);

    //add the login details to login auth db
    await this.DbActions.insertData("login_table", {
      unique_id: uniqueIdDetails.data,
      user_unique_id: userObject.unique_id,
      logged_out: "none",
      ip_address: ip_address,
      token_secret: hashedToken,
      due_date: expirationTimeFromCreatedTime,
      device_name: device_name,
      location: location,
      created_at: currentDate,
      updated_at: currentDate,
    });
  }

}

module.exports = LoginAuthModel;
