const DbActions = require("../model/DbActions");
const Settings = require("./Settings");
const ErrorHandler = require("../helpers/ErrorHandler");
const fs = require("fs");

class Priviledges{
    ////unique_id 	role 	description
    constructor(){
        this.DbActions = new DbActions();
        this.Settings = new Settings();
        this.priviledgesArray = [];
        this.PriviledgesFilePath = './files/roles_manager/roles.json';
    }

    // async selectAllPrivilegesWhere(conditions, filterDeletedRow = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
    //     ////[["unique_id", "=", Currency]]
    //     let allRoles = await this.DbActions.selectBulkData("privileges_tb", {
    //         filteringConditions: conditions,
    //     }, filterDeletedRow, destroy, orderByColumns, orderByDirection);
    //     return allRoles;
    // }

    async selectAllPrivilegesWhere(conditions) {
        let thePath = this.PriviledgesFilePath;//role json file path
    
        let existingPriviledgeArray = fs.readFileSync(thePath);//reading the file
        existingPriviledgeArray = JSON.parse(existingPriviledgeArray);
    
        return existingPriviledgeArray;
      }

    // async selectAllPrivileges(conditions = [], filterDeletedRows = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
    //     ////[["unique_id", "=", Currency]]
    //     let allRoles = await this.DbActions.selectAllData("privileges_tb", {
    //         filteringConditions: conditions,
    //     }, filterDeletedRows, destroy, orderByColumns, orderByDirection);
    //     /*if (allUsers.length == 0) {
    //       return false;
    //     }*/
    //     return allRoles;
    // }

    async selectAllPrivileges(conditions) {
        let thePath = this.PriviledgesFilePath;//role json file path
    
        let existingPriviledgeArray = fs.readFileSync(thePath);//reading the file
        existingPriviledgeArray = JSON.parse(existingPriviledgeArray);
    
        return existingPriviledgeArray;
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


}

module.exports = Priviledges;