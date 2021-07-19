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

  async selectSettings(conditions = []) {
    //conditions = [["email", "=", email]];
    /*let settingsObject = await this.DbActions.selectSingleRow("settings", {
      filteringConditions: conditions,
    });
    if (typeof settingsObject === "undefined") {
      return false;
    }*/
    return {
      "id": 1,
      "unique_id": process.env.UNIQUE_ID,
      "site_name": process.env.SITE_NAME,
      "address1": process.env.ADDRESS1,
      "address2": process.env.ADDRESS2,
      "email1": process.env.EMAIL,
      "site_url": process.env.SITE_URL,
      "email2": process.env.EMAIL2,
      "logo_url": process.env.LOGO_URL,
      "facebook": process.env.FACEBOOK,
      "instagram": process.env.INSTAGRAM,
      "phone1": process.env.PHONE1,
      "phone2": process.env.PHONE2,
      "least_withdrawable_amount": process.env.LEAST_WITHDRAWABLE_AMOUNT,
      "no_of_days_to_review": process.env.NO_OF_DAYS_TO_REVIEW,
      "linkedin": process.env.LINKEDIN,
      "total_projects": process.env.TOTAL_PROJECTS,
      "address_3": process.env.ADDRESS3,
      "address4": process.env.ADDRESS4,
      "deleted_at": process.env.DELETED_AT,
      "created_at": process.env.CREATED_AT,
      "updated_at": process.env.UPDATED_AT,
      "ios_url": process.env.IOS_URL,
      "android_url": process.env.ANDROID_URL,
      "slogan": process.env.SLOGAN,
      "front_end_base_url": process.env.FRONT_END_BASE_URL,
      "backend_base_url": process.env.BACK_END_BASE_URL,
      "ios_app_store_link": process.env.IOS_APP_STORE_LINK,
      "preferred_currency": process.env.PREFERRED_CURRENCY
    };
  }
}

module.exports = Settings;

