const responseObject = require("../ViewController");
const Generics = require("../../helpers/Generics");
const AuthenticationCode = require("../../helpers/AuthenticationCode");
const date = require("date-and-time");
const DbActions = require("../../model/DbActions");
const ErrorHandler = require("../../helpers/ErrorHandler");
const MessageType = require("../../helpers/MessageType");
const User = require("../../model/User");
const TypeOfUsers = require("../../model/TypeOfUsers");
const authData = require("../../helpers/AuthenticateLogin");
const validator = require("../../helpers/validator");
const ErrorMessages = require("../../helpers/ErrorMessages");
const fs = require("fs");

class TypeOfUserController {
  constructor() {
    this.errorMessage = "";
    this.errorStatus = false;
    this.responseObject = new responseObject();
    this.DbActions = new DbActions();
    this.AuthenticationCode = new AuthenticationCode();
    this.Generics = new Generics();
    this.MessageType = new MessageType();
    this.User = new User();
    this.TypeOfUsers = new TypeOfUsers();
    this.ErrorMessages = new ErrorMessages();
    this.RoleManagerFilePath = this.TypeOfUsers.RoleManagerFilePath;
  }

  valdateFunction(req, ValidationRule) {
    validator(req.body, ValidationRule, {}, (err, status) => {
      if (status === false) {
        this.errorMessage = err;
      }
      this.errorStatus = status;
    });
  }

  async storeTypeOfUsers(req, res) {
    try {
      let loggedUser = await authData(req);
      loggedUser = await this.User.selectOneUser([
        ["unique_id", "=", loggedUser.user.unique_id],
      ]);
      if (loggedUser === false) {
        this.responseObject.setData([]);
        let ErrorMessage =
          this.ErrorMessages.ErrorMessageObjects.authentication_failed;
        throw new Error(ErrorMessage);
      }

      //validate the user
      const TypeOfUserVerificationRule = {
        //validate the datas for the verification
        type_of_user: "required|string",
        description: "required|string|max:100",
      };
      this.valdateFunction(req, TypeOfUserVerificationRule); //call the validation function
      if (this.errorStatus === false) {
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      let type_of_user = req.body.type_of_user;
      let description = req.body.description;

      //select all roles from the json json file
      let RolesManagementObject = await this.TypeOfUsers.selectOneTypeOfUser();
      let typeOfUserObject = RolesManagementObject.type_of_users;

      let checkExistence = 0;

      if (typeOfUserObject.length > 0) {
        for (let i in typeOfUserObject) {
          if (typeOfUserObject[i].type_of_user === type_of_user) {
            checkExistence = 1;
          }
        }
      }

      if (checkExistence == 1) {
        let ErrorMessage =
          this.ErrorMessages.ErrorMessageObjects.type_of_user_exist;
        throw new Error(ErrorMessage);
      }

      let uniqueIdDetails = await this.Generics.createUniqueId(
        "type_of_user_tb",
        "unique_id"
      );
      if (uniqueIdDetails.status === false) {
        throw new Error(uniqueIdDetails.message);
      }

      //insert the values to the db
      const now = new Date();
      let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");

      typeOfUserObject.push({
        unique_id: uniqueIdDetails.data,
        type_of_user: type_of_user,
        description: description,
        created_at: currenctDate,
        updated_at: currenctDate,
      });

      RolesManagementObject.type_of_users = typeOfUserObject;
      let data = JSON.stringify(RolesManagementObject, null, 2);
      fs.writeFileSync(this.RoleManagerFilePath, data);

      //send details to view
      this.responseObject.setStatus(true);
      this.responseObject.setMessage("Type of User was successfully added");
      this.responseObject.setData({
        type_of_users: typeOfUserObject,
      });
      res.json(this.responseObject.sendToView());
    } catch (err) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
      console.log(err);
    }
  }

  async selectAllTypeOfUsers(req, res) {
    try {
      let thePath = this.RoleManagerFilePath;
      //select the all the roles
      let existingTypeOfUserArray = fs.readFileSync(thePath);
      existingTypeOfUserArray = JSON.parse(existingTypeOfUserArray);

      //send details to view
      this.responseObject.setStatus(true);
      this.responseObject.setMessage("Role was successfully added");
      this.responseObject.setData({
        type_of_users: existingTypeOfUserArray.type_of_users,
      });
      res.json(this.responseObject.sendToView());
    } catch (err) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }
  }
}

module.exports = TypeOfUserController;
