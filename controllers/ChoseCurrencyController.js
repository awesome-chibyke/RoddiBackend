const responseObject = require("./ViewController");
const authData = require("../helpers/AuthenticateLogin");
const ErrorHandler = require("../helpers/ErrorHandler");
const Currency = require("../model/Currency");

class CurrencyController {
  constructor() {
    this.responseObject = new responseObject();
    this.Currency = new Currency();
    this.now = new Date();
  }

  async getCurrency(req, res) {
    try {
      //authenticate user
      let userObject = await authData(req);
      userObject = userObject.user;

      let allCurrency = this.Currency.getAllCurrency(userObject);

      //return value to view
      this.responseObject.setStatus(true);
      this.responseObject.setData(allCurrency);
      this.responseObject.setMessage("All currency has been fetched");
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

module.exports = CurrencyController;
