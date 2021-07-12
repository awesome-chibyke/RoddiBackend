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
    /*let settingsObject = await this.DbActions.selectSingleRow("settings", {
      filteringConditions: conditions,
    });
    if (typeof settingsObject === "undefined") {
      return false;
    }*/
    return {
      "id": 1,
      "unique_id": "w6laqzt48i4ulj200ief",
      "site_name": "Rooddi",
      "address1": "No 3 Kenyetta Street Uwani",
      "address2": "No 3 Kenyetta Street Uwani",
      "email1": "info@rooddi.com",
      "site_url": "http://localhost:3400/",
      "email2": "support@rooddi.com",
      "logo_url": "https://techocraft.com/img/logo.png",
      "facebook": "http://rooddi.com/login",
      "instagram": "http://rooddi.com/login",
      "phone1": "364735475473",
      "phone2": "78565656",
      "least_withdrawable_amount": "100",
      "no_of_days_to_review": null,
      "linkedin": "",
      "total_projects": "",
      "address_3": "",
      "address4": "",
      "deleted_at": null,
      "created_at": "2021-04-23T02:01:14.000Z",
      "updated_at": "2021-04-23T02:01:14.000Z",
      "ios_url": "https://www.dropbox.com/scl/fi/3klpi7hqrfr5qt1z52rje/Roodi-Application.paper?dl=0&rlkey=2en7k86gnrwb7apjtfatdllfh",
      "android_url": "https://www.dropbox.com/scl/fi/3klpi7hqrfr5qt1z52rje/Roodi-Application.paper?dl=0&rlkey=2en7k86gnrwb7apjtfatdllfh",
      "slogan": "live is beautiful",
      "front_end_base_url": "https://www.dropbox.com/scl/fi/3klpi7hqrfr5qt1z52rje/Roodi-Application.paper?dl=0&rlkey=2en7k86gnrwb7apjtfatdllfh",
      "backend_base_url": "https://www.dropbox.com/scl/fi/3klpi7hqrfr5qt1z52rje/Roodi-Application.paper?dl=0&rlkey=2en7k86gnrwb7apjtfatdllfh",
      "ios_app_store_link": null,
      "preferred_currency": null
    };
  }
}

module.exports = Settings;
