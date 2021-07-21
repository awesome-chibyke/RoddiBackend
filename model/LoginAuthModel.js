const DbActions = require("../model/DbActions");

class LoginAuthModel {
  constructor() {
    this.DbActions = new DbActions();
  }
  async updateLoginAuth(requestObject) {
    //update the settings object
    await this.DbActions.updateData("login_table", {
      fields: requestObject,
      filteringConditions: [["unique_id", "=", requestObject.unique_id]],
    });
    //fetch the settings object
    let settings = await this.DbActions.selectSingleRow("login_table", {
      filteringConditions: [["unique_id", "=", requestObject.unique_id]],
    });
    return settings;
  }

  async selectOneLogin(conditions) {
    //conditions = [["email", "=", email]];
    let loginAuthObject = await this.DbActions.selectSingleRow("login_table", {
      filteringConditions: conditions,
    });
    
    if (typeof loginAuthObject === "undefined") {
      return false;
    }
    return loginAuthObject;
  }

  async selectAllLoginAuthWhere(
    conditions,
    filterDeletedRow = "yes",
    destroy = "no",
    orderByColumns = "id",
    orderByDirection = "desc"
  ) {
    ////[["unique_id", "=", Currency]]
    let allUsers = await this.DbActions.selectBulkData(
      "login_table",
      { filteringConditions: conditions },
      filterDeletedRow,
      destroy,
      orderByColumns,
      orderByDirection
    );
    return allUsers;
  }

  async selectAllLoginAuth(
    conditions = [],
    filterDeletedRows = "yes",
    destroy = "no",
    orderByColumns = "id",
    orderByDirection = "desc"
  ) {
    ////[["unique_id", "=", Currency]]
    let allUsers = await this.DbActions.selectAllData(
      "login_table",
      {
        filteringConditions: conditions,
      },
      filterDeletedRows,
      destroy,
      orderByColumns,
      orderByDirection
    );
    return allUsers;
  }
}

module.exports = LoginAuthModel;
