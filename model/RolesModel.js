const DbActions = require("../model/DbActions");
const Settings = require("./Settings");
const ErrorHandler = require("../helpers/ErrorHandler");
const fs = require("fs");

class RolesModel {
  ////unique_id 	role 	description
  constructor() {
    this.DbActions = new DbActions();
    this.Settings = new Settings();
    this.RoleManagerFilePath = "./files/roles_manager/roles.json";
  }

  // async selectAllRolesWhere(conditions, filterDeletedRow = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
  //     ////[["unique_id", "=", Currency]]
  //     let allRoles = await this.DbActions.selectBulkData("roles", {
  //         filteringConditions: conditions,
  //     }, filterDeletedRow, destroy, orderByColumns, orderByDirection);
  //     return allRoles;
  // }

  async selectAllRolesWhere(conditions) {
    let thePath = this.RoleManagerFilePath; //role json file path

    let existingRoleArray = fs.readFileSync(thePath); //reading the file
    existingRoleArray = JSON.parse(existingRoleArray);

    return existingRoleArray;
  }

  // async selectAllRoles(conditions = [], filterDeletedRows = 'yes', destroy = "no", orderByColumns = 'id', orderByDirection = 'desc'){
  //     ////[["unique_id", "=", Currency]]
  //     let allRoles = await this.DbActions.selectAllData("roles", {
  //         filteringConditions: conditions,
  //     }, filterDeletedRows, destroy, orderByColumns, orderByDirection);
  //     /*if (allUsers.length == 0) {
  //       return false;
  //     }*/
  //     return allRoles;
  // }

  async selectAllRoles(conditions) {
    let thePath = this.RoleManagerFilePath; //role json file path

    let existingRoleArray = fs.readFileSync(thePath); //reading the file
    existingRoleArray = JSON.parse(existingRoleArray);

    return existingRoleArray;
  }

  // async selectOneRole(conditions, filterDeletedRows = 'yes') {
  //     //conditions = [["email", "=", email]];
  //     let userObject = await this.DbActions.selectSingleRow("roles", {
  //         filteringConditions: conditions,
  //     },filterDeletedRows);
  //     if (typeof userObject === "undefined") {
  //         return false;
  //     }
  //     return userObject;
  // }

  async selectOneRole(conditions) {
    const thePath = this.RoleManagerFilePath;
    let existingObject = fs.readFileSync(thePath);
    existingObject = JSON.parse(existingObject);
    return existingObject;
  }
}

module.exports = RolesModel;
