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


class RolesController {
    constructor(){
        this.errorMessage = '';
        this.errorStatus = false;
        this.responseObject = new responseObject();
        this.DbActions = new DbActions();
        this.AuthenticationCode = new AuthenticationCode();
        this.Generics = new Generics();
        this.MessageType = new MessageType();
        this.User = new User();
        this.RolesModel = new RolesModel();
        this.ErrorMessages = new ErrorMessages();
    }

    valdateFunction(req, ValidationRule) {
        validator(req.body, ValidationRule, {}, (err, status) => {
            if (status === false) {
                this.errorMessage = err;
            }
            this.errorStatus = status;
        });
    }

    //add new role to the database
    async storeRoles(req, res){

        try{

            let loggedUser = await authData(req);
            loggedUser = await this.User.selectOneUser([["unique_id", "=", loggedUser.user.unique_id]]);
            if(loggedUser === false){
                this.responseObject.setData([]);
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.authentication_failed;
                throw new Error(ErrorMessage);
            }

            let role = req.body.role;
            let description = req.body.description;

            //validate the user
            const RolesValidationRule = {//validate the datas for the verification
                role: "required|string",
                description: "required|string|max:100"
            };
            this.valdateFunction(req, RolesValidationRule);//call the validation function
            if(this.errorStatus === false){
                this.responseObject.setStatus(false);
                this.responseObject.setMessage(this.errorMessage.errors);
                return res.json(this.responseObject.sendToView());
            }

            let checkForExistence = await this.RolesModel.selectOneRole([['role', '=', role]]);
            if(checkForExistence !== false){
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.type_of_user_exist;
                throw new Error(ErrorMessage);
            }

            let uniqueIdDetails = await this.Generics.createUniqueId("roles","unique_id");
            if (uniqueIdDetails.status === false) {
                throw new Error(uniqueIdDetails.message);
            }

            //insert the values to the db
            const now = new Date();
            let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");

            let roleObject = {
                unique_id: uniqueIdDetails.data,
                role: role,
                description: description,
                created_at: currenctDate,
                updated_at: currenctDate,
            };

            //insert the values into the db
            var createRole = await this.DbActions.insertData("roles", [roleObject]);

            //select the all the roles
            let allRoles = await this.RolesModel.selectAllRoles();

            //send details to view
            this.responseObject.setStatus(true);
            this.responseObject.setMessage("Role was successfully added");
            this.responseObject.setData({
                roles: allRoles
            });
            res.json(this.responseObject.sendToView());
        }catch(err){
            this.responseObject.setStatus(false);
            this.responseObject.setMessage({
                general_error: [ErrorHandler(err)],
            });
            res.json(this.responseObject.sendToView());
        }

    }

    //select all the available roles
    async selectAllRoles(req, res){

        try{

            //select the all the roles
            let allRoles = await this.RolesModel.selectAllRoles();

            //send details to view
            this.responseObject.setStatus(true);
            this.responseObject.setMessage("Roles were successfully returned");
            this.responseObject.setData({
                roles: allRoles
            });
            res.json(this.responseObject.sendToView());

        }catch(err){

            this.responseObject.setStatus(false);
            this.responseObject.setMessage({
                general_error: [ErrorHandler(err)],
            });
            res.json(this.responseObject.sendToView());

        }

    }


}

module.exports = RolesController;