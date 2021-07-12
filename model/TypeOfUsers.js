const DbActions = require("../model/DbActions");
const Settings = require("./Settings");
const ErrorHandler = require("../helpers/ErrorHandler");

class TypeOfUsers {
    constructor(){
        this.DbActions = new DbActions();
        this.Settings = new Settings();
    }

    async selectAllTypeOfUsersWhere(conditions, filterDeletedRow = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
        ////[["unique_id", "=", Currency]]
        let allRoles = await this.DbActions.selectBulkData("type_of_user_tb", {
            filteringConditions: conditions,
        }, filterDeletedRow, destroy, orderByColumns, orderByDirection);
        return allRoles;
    }

    async selectAllTypeOfUsers(conditions = [], filterDeletedRows = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
        ////[["unique_id", "=", Currency]]
        let allRoles = await this.DbActions.selectAllData("type_of_user_tb", {
            filteringConditions: conditions,
        }, filterDeletedRows, destroy, orderByColumns, orderByDirection);
        return allRoles;
    }

    async selectOneTypeOfUser(conditions, filterDeletedRows = 'yes') {
        //conditions = [["email", "=", email]];
        let userObject = await this.DbActions.selectSingleRow("type_of_user_tb", {
            filteringConditions: conditions,
        },filterDeletedRows);
        if (typeof userObject === "undefined") {
            return false;
        }
        return userObject;
    }
}

module.exports = TypeOfUsers;