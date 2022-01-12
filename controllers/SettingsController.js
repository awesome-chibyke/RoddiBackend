const responseObject = require("./ViewController");
const authData = require("../helpers/AuthenticateLogin");
const AuthenticationCode = require("../helpers/AuthenticationCode");
const ErrorHandler = require("../helpers/ErrorHandler");
const User = require("../model/User");
const date = require("date-and-time");
const validator = require("../helpers/validator");
const Settings = require("../model/Settings");
const Privileges = require("../model/Priviledges");

class SettingsController {
  constructor() {
    this.responseObject = new responseObject();
    this.User = new User();
    this.AuthenticationCode = new AuthenticationCode();
    this.now = new Date();
    this.Settings = new Settings();
    this.errorMessage = "";
    this.errorStatus = true;
    this.Privileges = new Privileges();
  }

  valdateFunction(req, ValidationRule) {
    validator(req.body, ValidationRule, {}, (err, status) => {
      if (status === false) {
        this.errorMessage = err;
      }
      this.errorStatus = status;
    });
  }

  async editSettings(req, res) {
    try {
      //validation
      let validationRule = {
        preferred_currency: "required|string",
        site_name: "required|string",
        address1: "required|string",
        address2: "string",
        address3: "string",
        address4: "string",
        email1: "required|string|email",
        email2: "required|string",
        site_url: "required|string",
        logo_url: "required|string",
        facebook: "required|string",
        instagram: "required|string",
        linkedin: "required|string",
        no_of_days_to_review: "required|numeric",
        total_projects: "required|numeric",
        ios_url: "required|string",
        android_url: "required|string",
        slogan: "required|string",
        front_end_base_url: "required|string",
        backend_base_url: "required|string",
        ios_app_store_link: "required|string",
        phone1: "required|numeric",
        phone2: "required|numeric",
        least_withdrawable_amount: "required|numeric",
      };

      //validate the user
      this.valdateFunction(req, validationRule);
      if (this.errorStatus === false) {
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      //authenticate user
      let userObject = await authData(req);
      userObject = await this.User.selectOneUser([
        ["unique_id", "=", userObject.user.unique_id],
      ]);
      if (userObject === false) {
        throw new Error("User does not exist");
      }

      //check privilege
      let privilege = await this.Privileges.checkUserPrivilege(userObject, 'manage_roles');
      if(privilege === false){ throw new Error('Access Denied')}

      //update the settings
      const preferred_currency = req.body.preferred_currency;
      const site_name = req.body.site_name;
      const address1 = req.body.address1;
      const address2 = req.body.address2;
      const address3 = req.body.address3;
      const address4 = req.body.address4;
      const email = req.body.email;
      const email2 = req.body.email2;
      const site_url = req.body.site_url;
      const logo_url = req.body.logo_url;
      const facebook = req.body.facebook;
      const instagram = req.body.instagram;
      const linkedin = req.body.linkedin;
      const phone1 = req.body.phone1;
      const phone2 = req.body.phone2;
      const least_withdrawable_amount = req.body.least_withdrawable_amount;
      const no_of_days_to_review = req.body.no_of_days_to_review;
      const total_projects = req.body.total_projects;
      const ios_url = req.body.ios_url;
      const android_url = req.body.android_url;
      const slogan = req.body.slogan;
      const front_end_base_url = req.body.front_end_base_url;
      const backend_base_url = req.body.backend_base_url;
      const ios_app_store_link = req.body.ios_app_store_link;

      let updatedSettingsObject = await this.Settings.updateSettings({
        preferred_currency: preferred_currency,
        site_name: site_name,
        address1: address1,
        address2: address2,
        address_3: address3,
        address4: address4,
        email1: email,
        email2: email2,
        site_url: site_url,
        logo_url: logo_url,
        facebook: facebook,
        instagram: instagram,
        linkedin: linkedin,
        phone1: phone1,
        phone2: phone2,
        least_withdrawable_amount: least_withdrawable_amount,
        no_of_days_to_review: no_of_days_to_review,
        total_projects: total_projects,
        ios_url: ios_url,
        android_url: android_url,
        slogan: slogan,
        front_end_base_url: front_end_base_url,
          backend_base_url: backend_base_url,
        ios_app_store_link: ios_app_store_link,
      });

      //return value to view
      this.responseObject.setStatus(true);
      this.responseObject.setData({ updatedSettingsObject });
      this.responseObject.setMessage("Settings was successfully updated");
      res.json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(e)],
      });
      res.json(this.responseObject.sendToView());
    }
  }

  async selectSettings(req, res){
    try{
      //select the settings
      let settings = await this.Settings.selectSettings([
          ['id', '=', 1]
      ]);
      this.responseObject.setData(settings);
      res.json(this.responseObject.sendToView());

    }catch(err){
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }
  }
}

module.exports = SettingsController;
