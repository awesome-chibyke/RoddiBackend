const DbActions = require("../model/DbActions");
const Settings = require("./Settings");
const ErrorHandler = require("../helpers/ErrorHandler");
const fs = require("fs");

class Priviledges {
  ////unique_id 	role 	description
  constructor() {
    this.DbActions = new DbActions();
    this.Settings = new Settings();
    this.priviledgesArray = [];
    this.RoleManagerFilePath = "./files/roles_manager/roles.json";
  }

  async selectAllPrivilegesWhere(conditions) {
    let thePath = this.RoleManagerFilePath; //role json file path

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
