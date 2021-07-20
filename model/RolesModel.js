const DbActions = require("../model/DbActions");
const Settings = require("./Settings");
const ErrorHandler = require("../helpers/ErrorHandler");
const fs = require("fs");

class RolesModel {
   ////unique_id 	role 	description
    constructor(){
        this.DbActions = new DbActions();
        this.Settings = new Settings();
        this.RoleManagerFilePath = './files/roles_manager/roles.json'
    }

    async selectAllRolesWhere(conditions, filterDeletedRow = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
        ////[["unique_id", "=", Currency]]
        /*let allRoles = await this.DbActions.selectBulkData("roles", {
            filteringConditions: conditions,
        }, filterDeletedRow, destroy, orderByColumns, orderByDirection);
        return allRoles;*/
    }

    async selectAllRoles(){
        ////[["unique_id", "=", Currency]]
        const filePath = this.RoleManagerFilePath;
        let existingObject = fs.readFileSync(filePath);
        existingObject = JSON.parse(existingObject);
        return existingObject;
    }

    async selectOneRole(conditions, filterDeletedRows = 'yes') {
        //conditions = [["email", "=", email]];
        /*let userObject = await this.DbActions.selectSingleRow("roles", {
            filteringConditions: conditions,
        },filterDeletedRows);
        if (typeof userObject === "undefined") {
            return false;
        }
        return userObject;*/
        const filePath = this.RoleManagerFilePath;
        let existingObject = fs.readFileSync(filePath);
        existingObject = JSON.parse(existingObject);
        return existingObject.roles;
    }

}

module.exports = RolesModel;