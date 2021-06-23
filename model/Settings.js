const DbActions = require("../model/DbActions");

class Settings {
  constructor() {
    this.DbActions = new DbActions();
  }
  async updateSettings(requestObject) {
    //fetch the user
    let settings = await this.DbActions.selectSingleRow("settings", {
      filteringConditions: [["unique_id", "=", requestObject.unique_id]],
    });
    settings.site_name = requestObject.site_name ?? settings.site_name;
    user.address1 = requestObject.address1 ?? settings.address1;
    user.address2 = requestObject.address2 ?? settings.address2;
    user.site_url = requestObject.site_url ?? settings.site_url;
    user.email2 = requestObject.email2 ?? user.email2;
    user.logo_url = requestObject.logo_url ?? user.logo_url;
    user.facebook = requestObject.facebook ?? user.facebook;
    user.instagram = requestObject.instagram ?? user.instagram;
    user.phone1 = requestObject.phone1 ?? user.phone1;
    user.phone2 = requestObject.phone2 ?? user.phone2;
    user.least_withdrawable_amount =
      requestObject.least_withdrawable_amount ?? user.least_withdrawable_amount;
    user.face_upload_status =
      requestObject.no_of_days_to_review ?? user.no_of_days_to_review;
    user.linkedin = requestObject.linkedin ?? user.linkedin;
    user.total_projects = requestObject.total_projects ?? user.total_projects;
    user.address_3 = requestObject.address_3 ?? user.address_3;
    user.address4 = requestObject.address4 ?? user.address4;

    //updatye the user
    await this.DbActions.updateData("settings", {
      fields: userObject,
      filteringConditions: [["unique_id", "=", settings.unique_id]],
    });
    return user;
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
