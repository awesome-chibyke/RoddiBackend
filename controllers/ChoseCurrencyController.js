const responseObject = require("./ViewController");
const authData = require("../helpers/AuthenticateLogin");
const ErrorHandler = require("../helpers/ErrorHandler");
const Currency = require("../model/Currency");
const User = require("../model/User");
const date = require("date-and-time");

class CurrencyController {
  constructor() {
    this.responseObject = new responseObject();
    this.Currency = new Currency();
    this.now = new Date();
    this.User = new User();
  }

  async getCurrency(req, res) {
    try {
      //authenticate user
      let userObject = await authData(req);
      userObject = userObject.user;

      let allCurrency = await this.Currency.getAllCurrency();
      if (allCurrency === false) {
        throw new Error("No Data Was returned");
      }

      let NeededCurrency = this.Currency.getAllNeededCurrency(allCurrency);
      //return value to view
      this.responseObject.setStatus(true);
      this.responseObject.setData({ currency_array: NeededCurrency });
      this.responseObject.setMessage("All currencies has been fetched");
      res.json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(e)],
      });
      res.json(this.responseObject.sendToView());
    }
  }
  async chosePreferedCurrency(req, res) {
    try {
      //authenticate user
      let userObject = await authData(req);
      userObject = userObject.user;

      // get the request from the body
      const preferred_currency = req.body.preferred_currency;

      // update the user preferred currency
      await this.User.updateUser({
        unique_id: userObject.unique_id,
        preferred_currency: preferred_currency,
      });

      this.responseObject.setStatus(true);
      this.responseObject.setMessage("Preferred Currency Has Been Updated");
      res.json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({ general_error: [ErrorHandler(e)] });
      res.json(this.responseObject.sendToView());
    }
  }
}

module.exports = CurrencyController;
