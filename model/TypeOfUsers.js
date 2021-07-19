const DbActions = require("../model/DbActions");
const Settings = require("./Settings");
const ErrorHandler = require("../helpers/ErrorHandler");
const fs = require("fs");

class TypeOfUsers {
  constructor() {
    this.DbActions = new DbActions();
    this.Settings = new Settings();
    this.typeOfUserArray = [];
    this.RoleManagerFilePath = "./files/roles_manager/roles.json";
  }

  async selectAllTypeOfUsersWhere(conditions) {
    let thePath = this.RoleManagerFilePath; //role json file path

    let existingTypeOfUserArray = fs.readFileSync(thePath); //reading the file
    existingTypeOfUserArray = JSON.parse(existingTypeOfUserArray);

    return existingTypeOfUserArray;
  }

  async selectAllTypeOfUsers(conditions) {
    let thePath = this.RoleManagerFilePath; //role json file path

    let existingTypeOfUserArray = fs.readFileSync(thePath); //reading the file
    existingTypeOfUserArray = JSON.parse(existingTypeOfUserArray);

    return existingTypeOfUserArray;
  }

  async selectOneTypeOfUser(conditions) {
    const thePath = this.RoleManagerFilePath;
    let existingObject = fs.readFileSync(thePath);
    existingObject = JSON.parse(existingObject);
    return existingObject;
  }
}

module.exports = TypeOfUsers;
