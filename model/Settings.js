const DbActions = require("../model/DbActions");

class Settings {
  constructor() {
    this.DbActions = new DbActions();
  }
  async updateSettings(requestObject) {
    //update the settings object
    await this.DbActions.updateData("settings", {
      fields: requestObject,
      filteringConditions: [["id", "=", 1]],
    });
    //fetch the settings object
    let settings = await this.DbActions.selectSingleRow("settings", {
      filteringConditions: [["id", "=", 1]],
    });
    return settings;
  }

  async selectSettings(conditions) {
    //conditions = [["email", "=", email]];
    let settingsObject = await this.DbActions.selectSingleRow("settings", {
      filteringConditions: conditions,
    });
    if (typeof settingsObject === "undefined") {
      return false;
    }
    return settingsObject;
  }
}

module.exports = Settings;
