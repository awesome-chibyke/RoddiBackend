const responseObject = require("./ViewController");
const authData = require("../helpers/AuthenticateLogin");
const ErrorHandler = require("../helpers/ErrorHandler");
const Settings = require("../model/Settings");
const User = require("../model/User");
const date = require("date-and-time");

class SettingsController {
  constructor() {
    this.responseObject = new responseObject();
    this.Settings = new Settings();
    this.now = new Date();
    this.User = new User();
  }

  async getSettings(req, res) {
    try {
      //authenticate user
      let userObject = await authData(req);
      userObject = userObject.user;

      let allSettings = await this.Settings.selectSettings();
      if (allSettings === false) {
        throw new Error("No Data Was returned");
      }
      //return value to view
      this.responseObject.setStatus(true);
      this.responseObject.setData({ allSettings});
      this.responseObject.setMessage("All settings has been fetched");
      res.json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(e)],
      });
      res.json(this.responseObject.sendToView());
    }
  }
  async updateSettings(req, res) {
    try {
      //authenticate user
      let userObject = await authData(req);
      userObject = userObject.user;

      // get the request from the body
      requestObject.preferred_currency = req.body.preferred_currency;
      requestObject.site_name = req.body.site_name;
      requestObject.address1 = req.body.address1;
      requestObject.address2 = req.body.address2;
      requestObject.address3 = req.body.address3;
      requestObject.address4 = req.body.address4;
      requestObject.email = req.body.email;
      requestObject.email2 = req.body.email2;
      requestObject.site_url = req.body.site_url;
      requestObject.logo_url = req.body.logo_url;
      requestObject.facebook = req.body.facebook;
      requestObject.instagram = req.body.instagram;
      requestObject.linkedin = req.body.linkedin;
      requestObject.phone1 = req.body.phone1;
      requestObject.phone2 = req.body.phone2;
      requestObject.least_withdrawable_amount = req.body.least_withdrawable_amount;
      requestObject.no_of_days_to_review = req.body.no_of_days_to_review;
      requestObject.total_projects = req.body.total_projects;
      requestObject.ios_url = req.body.ios_url;
      requestObject.android_url = req.body.android_url;
      requestObject.slogan = req.body.slogan;
      requestObject.front_end_base_url = req.body.front_end_base_url;
      requestObject.back_end_base_url = req.body.back_end_base_url;
      requestObject.ios_app_store_link = req.body.ios_app_store_link;


      // update the settings object
      let updatedRequestObject = this.Settings.updateSettings(requestObject);

      this.responseObject.setStatus(true);
      this.responseObject.setData(updatedRequestObject);
      this.responseObject.setMessage("Settings Has Been Updated");
      res.json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({ general_error: [ErrorHandler(e)] });
      res.json(this.responseObject.sendToView());
    }
  }
}

module.exports = SettingsController;
