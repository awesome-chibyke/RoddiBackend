const responseObject = require("./ViewController");
const authData = require("../helpers/AuthenticateLogin");
const ErrorHandler = require("../helpers/ErrorHandler");
const User = require("../model/User");
const validator = require("../helpers/validator");

class EditController {
  constructor() {
    this.responseObject = new responseObject();
    this.User = new User();
    this.now = new Date();
    this.errorMessage = "";
    this.errorStatus = true;
  }

  valdateFunction(req, ValidationRule) {
    validator(req.body, ValidationRule, {}, (err, status) => {
      if (status === false) {
        this.errorMessage = err;
      }
      this.errorStatus = status;
    });
  }

  async edit(req, res) {
    try {
      //validation
      let validationRule = {
        first_name: "required|string",
        last_name: "required|string",
        middle_name: "required|string",
        address: "required|string",
        state: "required|string",
        country: "required|string",
        city: "required|string",
        zip_code: "required|numeric",
      };

      this.valdateFunction(req, validationRule);
      if (this.errorStatus === false) {
        this.responseObject.setStatus(false);
        this.responseObject.setMessage(this.errorMessage.errors);
        return res.json(this.responseObject.sendToView());
      }

      //authenticate user
      let userObject = await authData(req);
      userObject = userObject.user;

      //update the user
      userObject.first_name = req.body.first_name;
      userObject.middle_name = req.body.middle_name;
      userObject.last_name = req.body.last_name;
      userObject.address = req.body.address;
      userObject.state = req.body.state;
      userObject.country = req.body.country;
      userObject.city = req.body.city;
      userObject.zip_code = req.body.zip_code;

      let updatedUserObject = this.User.updateUser(userObject);

      //return value to view
      this.responseObject.setStatus(true);
      this.responseObject.setData(updatedUserObject);
      this.responseObject.setMessage("User Update was Successful");
      res.json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(e)],
      });
      res.json(this.responseObject.sendToView());
    }
  }
}

module.exports = EditController;
