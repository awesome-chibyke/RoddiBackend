const DbActions = require("../model/DbActions");
const RolesModel = require("../model/RolesModel");
const Settings = require("./Settings");
const ErrorHandler = require("../helpers/ErrorHandler");
const fs = require("fs");

class Priviledges{
    ////unique_id 	role 	description
    constructor(){
        this.DbActions = new DbActions();
        this.Settings = new Settings();
        this.RolesModel = new RolesModel();
        this.RolesFilePath = this.RolesModel.RoleManagerFilePath;
    }

    async selectAllPrivilegesWhere(conditions, filterDeletedRow = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
        ////[["unique_id", "=", Currency]]
        let allRoles = await this.DbActions.selectBulkData("privileges_tb", {
            filteringConditions: conditions,
        }, filterDeletedRow, destroy, orderByColumns, orderByDirection);
        return allRoles;
    }

    async selectAllPrivileges(conditions = [], filterDeletedRows = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
        ////[["unique_id", "=", Currency]]
        let allRoles = await this.DbActions.selectAllData("privileges_tb", {
            filteringConditions: conditions,
        }, filterDeletedRows, destroy, orderByColumns, orderByDirection);
        /*if (allUsers.length == 0) {
          return false;
        }*/
        return allRoles;
    }

    async updatePrivilege(privilegeObject) {

        //update the user
        await this.DbActions.updateData("privileges_tb", {
            fields: privilegeObject,
            filteringConditions: [["unique_id", "=", privilegeObject.unique_id]],
        });
        //fetch the user
        let user = await this.DbActions.selectSingleRow("privileges_tb", {
            filteringConditions: [["unique_id", "=", privilegeObject.unique_id]],
        });

        return user;
    }

    async selectOnePrivilege(conditions, filterDeletedRows = 'yes') {
        //conditions = [["email", "=", email]];
        let userObject = await this.DbActions.selectSingleRow("privileges_tb", {
            filteringConditions: conditions,
        },filterDeletedRows);
        if (typeof userObject === "undefined") {
            return false;
        }
        return userObject;
    }

    async returnRoleObject(MainRoleManagementObject, role_unique_id){
        let selectedRoleObject = null;
        //get the type of user
        let rolesArray = MainRoleManagementObject.roles;
        if(rolesArray.length > 0){
            for(let e in rolesArray){
                if(role_unique_id === rolesArray[e].unique_id){
                    selectedRoleObject = rolesArray[e];
                    break
                }
            }
        }
        return selectedRoleObject;
    }

    async returnTypeOfUserObject(MainRoleManagementObject, typeOfUser){
        let selectedTypeOfUserObject = null;
        //get the type of user
        let typeOfUserArray = MainRoleManagementObject.type_of_users;
        if(typeOfUserArray.length > 0){
            for(let m in typeOfUserArray){
                if(typeOfUser === typeOfUserArray[m].unique_id){
                    selectedTypeOfUserObject = typeOfUserArray[m];
                    break
                }
            }
        }
        return selectedTypeOfUserObject;
    }

    async returnPriviledge(privilegeArray, selectedRoleObject, selectedTypeOfUserObject){
        let selectedPrivilegeObject = null;
        let count = -1;

        //loop through the privilege array to get the status os this user type privilege
        for(let i in privilegeArray){
            if(privilegeArray[i].role_unique_id === selectedRoleObject.unique_id && privilegeArray[i].type_of_user_unique_id === selectedTypeOfUserObject.unique_id){
                selectedPrivilegeObject = privilegeArray[i];
                count = i;
                break;
            }
        }
        return {privilege_object:selectedPrivilegeObject, count:count};
    }

    //check user privilege
    async checkUserPrivilege(userObject, role_unique_id){

        const filePath = this.RolesFilePath;
        let existingRoleManagementObject = fs.readFileSync(filePath);
        existingRoleManagementObject = JSON.parse(existingRoleManagementObject);

        //get the type of user
        let typeOfUser = userObject.type_of_user;

        //get the role
        let selectedRoleObject = await this.returnRoleObject(existingRoleManagementObject, role_unique_id);
        if(selectedRoleObject === null){ return false; }

        let selectedTypeOfUserObject = await this.returnTypeOfUserObject(existingRoleManagementObject, typeOfUser);
        if(selectedTypeOfUserObject === null){ return false; }

        //get the privilege
        let privilegeArray = existingRoleManagementObject.privileges;
        let selectedPrivilegeObject = null;

        //loop through the privilege array to get the status os this user type privilege
        for(let i in privilegeArray){
            if(privilegeArray[i].role_unique_id === selectedRoleObject.unique_id && privilegeArray[i].type_of_user_unique_id === selectedTypeOfUserObject.unique_id){
                selectedPrivilegeObject = privilegeArray[i];
                break;
            }
        }
        if(selectedPrivilegeObject === null){ return false; }

        if(selectedPrivilegeObject.status === 'inactive'){
            return false;
        }
        return true;
    }

    let existingPriviledgeArray = fs.readFileSync(thePath); //reading the file
    existingPriviledgeArray = JSON.parse(existingPriviledgeArray);

    return existingPriviledgeArray;
  }

  async selectAllPrivileges(conditions) {
    let thePath = this.RoleManagerFilePath; //role json file path

    let existingPriviledgeArray = fs.readFileSync(thePath); //reading the file
    existingPriviledgeArray = JSON.parse(existingPriviledgeArray);

    return existingPriviledgeArray;
  }

  async updatePrivilege(RolesManagementObject) {
    RolesManagementObject.privileges = allPrviledges;
    let data = JSON.stringify(RolesManagementObject);
    fs.writeFileSync(this.RoleManagerFilePath, data);

    return RolesManagementObject;
  }

  // async selectOnePrivilege(conditions, filterDeletedRows = "yes") {
  //   //conditions = [["email", "=", email]];
  //   let userObject = await this.DbActions.selectSingleRow(
  //     "privileges_tb",
  //     {
  //       filteringConditions: conditions,
  //     },
  //     filterDeletedRows
  //   );
  //   if (typeof userObject === "undefined") {
  //     return false;
  //   }
  //   return userObject;
  // }

  async selectOnePrivilege(conditions) {
    const thePath = this.RoleManagerFilePath;
    let existingObject = fs.readFileSync(thePath);
    existingObject = JSON.parse(existingObject);
    return existingObject;
  }
}

module.exports = Priviledges;
