const responseObject = require("../ViewController");
const Generics = require("../../helpers/Generics");
const AuthenticationCode = require("../../helpers/AuthenticationCode");
const ErrorMessages = require("../../helpers/ErrorMessages");
const date = require("date-and-time");
const DbActions = require("../../model/DbActions");
const ErrorHandler = require("../../helpers/ErrorHandler");
const MessageType = require("../../helpers/MessageType");
const User = require("../../model/User");
const RolesModel = require("../../model/RolesModel");
const authData = require("../../helpers/AuthenticateLogin");
const validator = require("../../helpers/validator");
const Privileges = require("../../model/Priviledges");
const fs = require("fs");

class RolesController {
  constructor() {
    this.errorMessage = "";
    this.errorStatus = false;
    this.responseObject = new responseObject();
    this.DbActions = new DbActions();
    this.AuthenticationCode = new AuthenticationCode();
    this.Generics = new Generics();
    this.MessageType = new MessageType();
    this.User = new User();
    this.RolesModel = new RolesModel();
    this.ErrorMessages = new ErrorMessages();
    this.RoleManagerFilePath = this.RolesModel.RoleManagerFilePath;
    this.Privileges = new Privileges();
  }

  valdateFunction(req, ValidationRule) {
    validator(req.body, ValidationRule, {}, (err, status) => {
      if (status === false) {
        this.errorMessage = err;
      }
      this.errorStatus = status;
    });

    let theObject = {
      roles: [
        {
          unique_id: "",
          role: "",
          description: "",
          deleted_at: null,
          created_at: "",
          updated_at: "",
        },
      ],
      type_of_users: [],
      privileges: [],
    };
  }

  //add new role to the database
  async storeRoles(req, res) {
    try {
      let loggedUser = await authData(req); //authenticate user
      loggedUser = await this.User.selectOneUser([
        ["unique_id", "=", loggedUser.user.unique_id],
      ]);

      if (loggedUser === false) {
        let ErrorMessage =
          this.ErrorMessages.ErrorMessageObjects.authentication_failed;
        throw new Error(ErrorMessage);
      }

        //check privilege
        let privilege = await this.Privileges.checkUserPrivilege(loggedUser, 'manage_roles');
      if(privilege === false){ throw new Error('Access Denied')}

      let role = req.body.role;
      let description = req.body.description;
      //validate the user
      const RolesValidationRule = {
        //validate the datas for the verification
        role: "required|string",
        description: "required|string|max:100",
      };
      this.valdateFunction(req, RolesValidationRule); //call the validation function
      if (this.errorStatus === false) {
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      //check for space
      if (role.includes(" ")) {
        throw new Error("spaces are not allowed, please use `Underscore`");
      }

      //select all roles from the json json file
      let RolesManagementObject = await this.RolesModel.selectOneRole();
      let allRoles = RolesManagementObject.roles;
      let checkExistence = 0;

      if (allRoles.length > 0) {
        for (let i in allRoles) {
          if (allRoles[i].role === role) {
            checkExistence = 1;
          }
        }
      }

      if (checkExistence == 1) {
        let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.role_exists;
        throw new Error(ErrorMessage);
      }

      let uniqueIdDetails = await this.Generics.createUniqueId(
        "roles",
        "unique_id"
      );
      if (uniqueIdDetails.status === false) {
        throw new Error(uniqueIdDetails.message);
      }

      const now = new Date(); //get the current date
      let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");

      //add role to the array and save
      allRoles.push({
        unique_id: uniqueIdDetails.data,
        role: role,
        description: description,
        deleted_at: null,
        created_at: currenctDate,
        updated_at: currenctDate,
      });

      RolesManagementObject.roles = allRoles;
      let data = JSON.stringify(RolesManagementObject, null, 2);
      fs.writeFileSync(this.RoleManagerFilePath, data);

      //send details to view
      this.responseObject.setStatus(true);
      this.responseObject.setMessage("Role was successfully added");
      this.responseObject.setData({
        roles: allRoles,
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

  //select all the available roles
  async selectAllRoles(req, res) {
    try {
      let thePath = this.RoleManagerFilePath;
      //select the all the roles
      let existingRoleArray = fs.readFileSync(thePath);
      existingRoleArray = JSON.parse(existingRoleArray);

      //send details to view
      this.responseObject.setStatus(true);
      this.responseObject.setMessage("Roles were successfully returned");
      this.responseObject.setData({
        roles: existingRoleArray.roles,
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

module.exports = RolesController;