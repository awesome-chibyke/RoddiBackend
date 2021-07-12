const DbActions = require("../model/DbActions");
const Settings = require("./Settings");
const ErrorHandler = require("../helpers/ErrorHandler");

class RolesModel {
   ////unique_id 	role 	description
    constructor(){
        this.DbActions = new DbActions();
        this.Settings = new Settings();
    }

    async selectAllRolesWhere(conditions, filterDeletedRow = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
        ////[["unique_id", "=", Currency]]
        let allRoles = await this.DbActions.selectBulkData("roles", {
            filteringConditions: conditions,
        }, filterDeletedRow, destroy, orderByColumns, orderByDirection);
        return allRoles;
    }

    async selectAllRoles(conditions = [], filterDeletedRows = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
        ////[["unique_id", "=", Currency]]
        let allRoles = await this.DbActions.selectAllData("roles", {
            filteringConditions: conditions,
        }, filterDeletedRows, destroy, orderByColumns, orderByDirection);
        /*if (allUsers.length == 0) {
          return false;
        }*/
        return allRoles;
    }

    async selectOneRole(conditions, filterDeletedRows = 'yes') {
        //conditions = [["email", "=", email]];
        let userObject = await this.DbActions.selectSingleRow("roles", {
            filteringConditions: conditions,
        },filterDeletedRows);
        if (typeof userObject === "undefined") {
            return false;
        }
        return userObject;
    }

}

module.exports = RolesModel;