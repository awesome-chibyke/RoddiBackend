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

  async selectAllRolesWhere(conditions) {
    let thePath = this.RoleManagerFilePath; //role json file path

    let existingRoleArray = fs.readFileSync(thePath); //reading the file
    existingRoleArray = JSON.parse(existingRoleArray);

    return existingRoleArray;
  }

  async selectAllRoles(conditions) {
    let thePath = this.RoleManagerFilePath; //role json file path

    let existingRoleArray = fs.readFileSync(thePath); //reading the file
    existingRoleArray = JSON.parse(existingRoleArray);

    return existingRoleArray;
  }

  async selectOneRole(conditions) {
    const thePath = this.RoleManagerFilePath;
    let existingObject = fs.readFileSync(thePath);
    existingObject = JSON.parse(existingObject);
    return existingObject;
  }
}

module.exports = RolesModel;
