var DbActions = require("../model/DbActions");

const date = require("date-and-time");
var ID = require("nodejs-unique-numeric-id-generator");

var Generics = require("./Generics");
//import the error handler
const ErrorHandler = require("../helpers/ErrorHandler");
const TokenManager = require("../model/TokenManager");
const ViewController = require("../controllers/ViewController");

class AuthenticationCode {
  constructor() {
    this.DbActions = new DbActions();
    this.TokenManager = new TokenManager();
    this.Generics = new Generics();
    this.responseObject = new ViewController();

    //define code types
    this.login_auth_type = "login_auth";

    this.account_activation_type = "account_activation";
    this.phone_verification_type = 'phone_verification';
    this.forgot_password_type = 'forgot_password';
    this.code_expiration_time = 5;
    this.now = new Date();
  }
  // createActivationCode(userObject, 'phone-verification');
  async createActivationCode(userObject, type = "account-activation") {
    try {
      let codeDetails = await this.DbActions.selectSingleRow("code_table", {
        filteringConditions: [
          ["user_unique_id", "=", userObject.unique_id],
          ["status", "=", "un-used"],
          ["type", "=", type],
        ],
      });

      if (typeof codeDetails !== "undefined") {
        await this.DbActions.updateData("code_table", {
          fields: {
            status: "failed",
          },
          filteringConditions: [["unique_id", "=", codeDetails.unique_id]],
        });
      }

      const now = new Date();
      let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");
      let uniqueIdDetails = await this.Generics.createUniqueId(
          "users",
          "unique_id"
      );
      //let token = ID.generate(new Date().toJSON());
      let token = this.Generics.randomStringCreator ( 'numeric', 4 );
      if (uniqueIdDetails.status === false) {
        return {
          status: false,
          message: uniqueIdDetails.message,
          data: [],
        };
      }

      //create the unique code and create a new entry to the database
      var insertValue = await this.DbActions.insertData("code_table", [
        {
          unique_id: uniqueIdDetails.data,
          user_unique_id: userObject.unique_id,
          token: token,
          type: type,
          status: "un-used",
          created_at: currenctDate,
          updated_at: currenctDate,
        },
      ]);

      return {
        status: true,
        message: "Code was successfully created",
        data: token,
      };
    } catch (e) {
      return {
        status: false,
        message: ErrorHandler(e),
        data: [],
      };
    }
  }

  //check if the token is valid
  async verifyTokenValidity(token, token_type, userObject, tokenStatus = "used") {
    try {
      let email = userObject.email;

      //select the token from token table
      let tokenDetails = await this.DbActions.selectSingleRow("code_table", {
        filteringConditions: [
          ["user_unique_id", "=", userObject.unique_id],
          ["token", "=", token],
          ["type", "=", token_type],
          ["status", "=", "un-used"],
        ],
      });

      if (typeof tokenDetails === "undefined") {
        return {
          status: false,
          message: "Invalid Token Supplied",
          message_type: "invalid_token",
        };
      }

      //check if the timescale is less than ten minute
      let currentTime = this.now;

      let TimeOfCreation = tokenDetails.created_at;

      let expirationTimeFromCreatedTime = date.addMinutes(TimeOfCreation, this.code_expiration_time);
      currentTime = date.format(currentTime, "YYYY-MM-DD HH:mm:ss");

      expirationTimeFromCreatedTime = date.format(
        expirationTimeFromCreatedTime,
        "YYYY-MM-DD HH:mm:ss"

      );

      //compare the dates
      if (currentTime > expirationTimeFromCreatedTime) {
        return {
          status: false,
          message: "Token has expired",
          message_type: "expired_token",
        };
      }

      //mark token as used
      let tokenUpdate = await this.TokenManager.updateToken({
        status: tokenStatus,
        unique_id: tokenDetails.unique_id,
      });

      //return the true status to the front end
      return {
        status: true,
        message: "Valid Token",
      };
    } catch (e) {
      return {
        status: false,
        message: ErrorHandler(e),
      };
    }
  }
}

module.exports = AuthenticationCode;
