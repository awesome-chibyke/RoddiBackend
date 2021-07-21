const responseObject = require("../ViewController");
const Generics = require("../../helpers/Generics");
const AuthenticationCode = require("../../helpers/AuthenticationCode");
const date = require("date-and-time");
const DbActions = require("../../model/DbActions");
const ErrorHandler = require("../../helpers/ErrorHandler");
const ErrorMessages = require("../../helpers/ErrorMessages");
const MessageType = require("../../helpers/MessageType");
const User = require("../../model/User");
const RolesModel = require("../../model/RolesModel");
const Priviledges = require("../../model/Priviledges");
const TypeOfUsers = require("../../model/TypeOfUsers");
const authData = require("../../helpers/AuthenticateLogin");
const validator = require("../../helpers/validator");
const Privileges = require("../../model/Priviledges");
const fs = require("fs");

class PrivilegeController {
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
    this.Priviledges = new Priviledges();
    this.TypeOfUsers = new TypeOfUsers();
    this.ErrorMessages = new ErrorMessages();
    this.RoleManagerFilePath = this.Priviledges.RoleManagerFilePath;
  }

  valdateFunction(req, ValidationRule) {
    validator(req.body, ValidationRule, {}, (err, status) => {
      if (status === false) {
        this.errorMessage = err;
      }
      this.errorStatus = status;
    });
  }

    //store the privileges
    async storePrivilege(req, res){

        try{
            let loggedUser = await authData(req); //verify the logged in user
            loggedUser = await this.User.selectOneUser([["unique_id", "=", loggedUser.user.unique_id]]);
            if(loggedUser === false){
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.authentication_failed;
                throw new Error(ErrorMessage);
            }

            //check privilege
            let privilege = await this.Priviledges.checkUserPrivilege(loggedUser, 'manage_roles');
            if(privilege === false){ throw new Error('Access Denied')}

            /*//validate the user type_of_user_unique_id 	role_unique_id
            const PhoneNumberVerificationRule = {//validate the datas for the verification
                roles_management: "required|array|min",
                'roles_management.*':'required|min:1',
            };

            this.valdateFunction(req, PhoneNumberVerificationRule);//call the validation function
            if(this.errorStatus === false){
                this.responseObject.setStatus(false);
                this.responseObject.setMessage(this.errorMessage.errors);
                return res.json(this.responseObject.sendToView());
            }*/

            const filePath = this.RolesModel.RoleManagerFilePath;
            let existingRoleManagementObject = fs.readFileSync(filePath);
            existingRoleManagementObject = JSON.parse(existingRoleManagementObject);

            let rolesManagement = req.body.roles_management;//the role management from the front end

            rolesManagement = [
                {
                    "type_of_user_unique_id": "oqsi4mgom8q8g8is7xya",
                    "type_of_user": "super-admin",
                    "role_unique_id": "1c0j6h8qxfgk5itflakq",
                    "role": "manage_roles",
                    "status": "active"
                },
                {
                    "type_of_user_unique_id": "oqsi4mgom8q8g8is7xya",
                    "type_of_user": "super-admin",
                    "role_unique_id": "bze4zy739eytt1kjczjv",
                    "role": "block_users",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "oqsi4mgom8q8g8is7xya",
                    "type_of_user": "super-admin",
                    "role_unique_id": "iowu4ls4jzrrhqf3fk1o",
                    "role": "delete_users",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "itkcxmvw60xvkpxthogp",
                    "type_of_user": "mid-admin",
                    "role_unique_id": "1c0j6h8qxfgk5itflakq",
                    "role": "manage_roles",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "itkcxmvw60xvkpxthogp",
                    "type_of_user": "mid-admin",
                    "role_unique_id": "bze4zy739eytt1kjczjv",
                    "role": "block_users",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "itkcxmvw60xvkpxthogp",
                    "type_of_user": "mid-admin",
                    "role_unique_id": "iowu4ls4jzrrhqf3fk1o",
                    "role": "delete_users",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "8n6x48qwblvfa2hx3ruf",
                    "type_of_user": "admin",
                    "role_unique_id": "1c0j6h8qxfgk5itflakq",
                    "role": "manage_roles",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "8n6x48qwblvfa2hx3ruf",
                    "type_of_user": "admin",
                    "role_unique_id": "bze4zy739eytt1kjczjv",
                    "role": "block_users",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "8n6x48qwblvfa2hx3ruf",
                    "type_of_user": "admin",
                    "role_unique_id": "iowu4ls4jzrrhqf3fk1o",
                    "role": "delete_users",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "7ov8pldpct4z0l9hkgxb",
                    "type_of_user": "user",
                    "role_unique_id": "1c0j6h8qxfgk5itflakq",
                    "role": "manage_roles",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "7ov8pldpct4z0l9hkgxb",
                    "type_of_user": "user",
                    "role_unique_id": "bze4zy739eytt1kjczjv",
                    "role": "block_users",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "7ov8pldpct4z0l9hkgxb",
                    "type_of_user": "user",
                    "role_unique_id": "iowu4ls4jzrrhqf3fk1o",
                    "role": "delete_users",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "a2wyovrpl4vg7701lrci",
                    "type_of_user": "super-adminstrator",
                    "role_unique_id": "1c0j6h8qxfgk5itflakq",
                    "role": "manage_roles",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "a2wyovrpl4vg7701lrci",
                    "type_of_user": "super-adminstrator",
                    "role_unique_id": "bze4zy739eytt1kjczjv",
                    "role": "block_users",
                    "status": "inactive"
                },
                {
                    "type_of_user_unique_id": "a2wyovrpl4vg7701lrci",
                    "type_of_user": "super-adminstrator",
                    "role_unique_id": "iowu4ls4jzrrhqf3fk1o",
                    "role": "delete_users",
                    "status": "active"
                }
            ];

            let privilegeArray = existingRoleManagementObject.privileges;

            //loop through the role management data and add to the db
            for(let i in rolesManagement){
                let objectForUpdate = {};
                //select the details to check if the details exist
                let selectedPrivilege = await this.Priviledges.returnPriviledge(privilegeArray, rolesManagement[i], rolesManagement[i]);

                if(selectedPrivilege.privilege_object !== null){

                    let count = selectedPrivilege.count;
                    existingRoleManagementObject.privileges[count].status = rolesManagement[i].status;

                }else{

                    let uniqueIdDetails = await this.Generics.createUniqueId("roles","unique_id");//create the unique id
                    if (uniqueIdDetails.status === false) {
                        throw new Error(uniqueIdDetails.message);
                    }

                    const now = new Date();//get the current date
                    let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");

                    let objectForCreationOfNewPrivilege = {
                        unique_id: uniqueIdDetails.data,
                        type_of_user_unique_id: rolesManagement[i].type_of_user_unique_id,
                        type_of_user: rolesManagement[i].type_of_user,
                        role_unique_id: rolesManagement[i].role_unique_id,
                        role: rolesManagement[i].role,
                        deleted_at:null,
                        created_at: currenctDate,
                        updated_at: currenctDate,
                        status:rolesManagement[i].status
                    };

                    //insert the values into the db
                    existingRoleManagementObject.privileges.push(objectForCreationOfNewPrivilege);

                }

            }

            //select the all the roles existingRoleManagementObject
            let data = JSON.stringify(existingRoleManagementObject, null, 2);
            fs.writeFileSync(filePath, data);

            //send details to view
            this.responseObject.setStatus(true);
            this.responseObject.setMessage("Updates was successful");
            this.responseObject.setData({
                all_privileges: await this.selectAllPrivilege()
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

    //select all privileges
    async getAllPrivileges(req, res){

        try{

            let loggedUser = await authData(req); //verify the logged in user
            loggedUser = await this.User.selectOneUser([["unique_id", "=", loggedUser.user.unique_id]]);
            if(loggedUser === false){
                let ErrorMessage = this.ErrorMessages.ErrorMessageObjects.authentication_failed;
                throw new Error(ErrorMessage);
            }

            //check privilege
            let privilege = await this.Priviledges.checkUserPrivilege(loggedUser, 'manage_roles');
            if(privilege === false){ throw new Error('Access Denied'); }

            let roleSummaryObject = await this.selectAllPrivilege();

            //send details to view
            this.responseObject.setStatus(true);
            this.responseObject.setMessage("Role management details was successfully returned");
            this.responseObject.setData({
                roles: roleSummaryObject
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

    async selectAllPrivilege(){

        const filePath = this.RolesModel.RoleManagerFilePath;
        let existingRoleManagementObject = fs.readFileSync(filePath);
        existingRoleManagementObject = JSON.parse(existingRoleManagementObject);

        //select the all the roles
        let roles = existingRoleManagementObject.roles;

        //select all the user types
        let typeOfUser = existingRoleManagementObject.type_of_users;

        //select the all the privileges
        let privilege = existingRoleManagementObject.privileges;

        let roleTypeOfUserAyy = [];

        if(typeOfUser.length > 0 && roles.length > 0){

            for(let i in typeOfUser){//loop through the users, foreach of the user check the
                for(let e in roles){
                    roleTypeOfUserAyy.push({type_of_user_unique_id:typeOfUser[i].unique_id, type_of_user:typeOfUser[i].type_of_user, role_unique_id:roles[e].unique_id, role:roles[e].role, status:'inactive'});
                }
            }

            if(roleTypeOfUserAyy.length > 0){
                for(let v in  roleTypeOfUserAyy){

                    if(privilege.length > 0){
                        //loop through the privilege and check if the two rhyme
                        for(let m in privilege){

                            let roleUniqueId = privilege[m].role_unique_id;
                            let typeOfUserUniqueId = privilege[m].type_of_user_unique_id;

                            if(roleTypeOfUserAyy[v].type_of_user_unique_id === typeOfUserUniqueId && roleTypeOfUserAyy[v].role_unique_id === roleUniqueId){

                                roleTypeOfUserAyy[v].status = privilege[m].status;
                                break;

                            }else{
                                roleTypeOfUserAyy[v].status = 'inactive';
                            }
                        }
                    }

                    if(privilege.length == 0){
                        roleTypeOfUserAyy[v].status = 'inactive';
                    }
                }
            }

          }

          return roleTypeOfUserAyy;
        }
}

module.exports = PrivilegeController;
