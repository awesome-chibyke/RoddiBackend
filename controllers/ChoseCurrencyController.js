const responseObject = require("./ViewController");
const authData = require("../helpers/AuthenticateLogin");
const ErrorHandler = require("../helpers/ErrorHandler");
const {GetRequest} = require("../helpers/ExternalRequest");
const Generics = require("../helpers/Generics");
const Currency = require("../model/Currency");
const User = require("../model/User");
const date = require("date-and-time");
const validator = require("../helpers/validator");
var isoCountryCurrency = require("iso-country-currency");
const fs = require('fs');
const { exchangeRates } = require('exchange-rates-api');

class CurrencyController {
  constructor() {
    this.responseObject = new responseObject();
    this.Currency = new Currency();
    this.now = new Date();
    this.User = new User();
    this.Generics = new Generics();
    this.errorMessage = "";
    this.errorStatus = true;
    this.CurrencyFilePath = this.Currency.CurrencyFilePath;
  }

  valdateFunction(req, ValidationRule) {
    validator(req.body, ValidationRule, {}, (err, status) => {
      if (status === false) {
        this.errorMessage = err;
      }
      this.errorStatus = status;
    });
  }

  async getCurrency(req, res) {
    try {
      let allCurrency = await this.Currency.getAllCurrency();
      if (allCurrency.length == 0) {
        throw new Error("No Data Was returned");
      }

      let NeededCurrency = this.Currency.getAllNeededCurrency(allCurrency);
      //let NeededCurrency = allCurrency;
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
      //validation
      let validationRule = {
        preferred_currency: "required|string",
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
      userObject = userObject.user;

      // get the request from the body
      const preferred_currency = req.body.preferred_currency;

      // update the user preferred currency
      let updatedUserObject = await this.User.updateUser({
        unique_id: userObject.unique_id,
        preferred_currency: preferred_currency,
      });

      this.responseObject.setStatus(true);
      let userObjectForView = await this.User.returnUserForView(updatedUserObject);
      this.responseObject.setData({user:userObjectForView});
      this.responseObject.setMessage("Preferred Currency Has Been Updated");
      res.json(this.responseObject.sendToView());
    } catch (e) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({ general_error: [ErrorHandler(e)] });
      res.json(this.responseObject.sendToView());
    }
  }

  async addCurrencies(req, res){
    try{

      let thePath = this.CurrencyFilePath;

      const now = new Date();
      let currentDate = date.format(now, "YYYY-MM-DD HH:mm:ss");

      const allCurrency = isoCountryCurrency.getAllISOCodes();

      let existingCurrencyArray = fs.readFileSync(thePath);
      existingCurrencyArray = JSON.parse(existingCurrencyArray);//convert to object
      let currencyArray = [];

      if(allCurrency.length > 0){

        if(existingCurrencyArray.length == 0){
          for(let i in allCurrency){

            let uniqueIdDetails = await this.Generics.createUniqueId("users","unique_id");
            if (uniqueIdDetails.status === false) { throw new Error(uniqueIdDetails.message); }

            currencyArray.push({
              unique_id:uniqueIdDetails.data,
              base_currency:process.env.BASE_CURRENCY,
              second_currency:allCurrency[i].currency,
              symbol:allCurrency[i].symbol,
              rate_of_conversion:null,
              expression:null,
              currency_name:null,
              country_name:allCurrency[i].countryName,
              country_abbr:allCurrency[i].iso,
              created_at:currentDate,
              updated_at:currentDate,
            });

          }
        }else{
          for(let m in existingCurrencyArray){

            let points = {};

            for(let i in allCurrency){

              if (existingCurrencyArray[m].country_abbr === allCurrency[i].iso) {

                points = {
                  unique_id:existingCurrencyArray[m].unique_id,
                  base_currency:process.env.BASE_CURRENCY,
                  second_currency:allCurrency[i].currency,
                  symbol:allCurrency[i].symbol,
                  rate_of_conversion:existingCurrencyArray[m].rate_of_conversion,
                  expression:existingCurrencyArray[m].expression,
                  currency_name:null,
                  country_name:allCurrency[i].countryName,
                  country_abbr:allCurrency[i].iso,
                  created_at:currentDate,
                  updated_at:currentDate,
                }
                break;
              }

            }
            currencyArray.push(points);
          }
        }

      }

      let data = JSON.stringify(currencyArray, null, 2);
      fs.writeFileSync(thePath, data);

      this.responseObject.setStatus(true);
      this.responseObject.setMessage("Update was successful");
      this.responseObject.setData({
        all_currencies: currencyArray
      });
      res.json(this.responseObject.sendToView());

    }catch(err){

      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());

    }
  }


  async updateCurrencyRates(req, res){

    try {
      let thePath = this.CurrencyFilePath;
      let theRates = await GetRequest('http://data.fixer.io/api/latest?access_key=365f857077fb096dd742d756da77226d&format=1');

      if (theRates.success === false) {
        throw new Error('An error occurred, try again');
      }
      const allCurrency = theRates.rates;//currency returned from API
      //check if the rates count is greater than 0
      if(Object.keys(allCurrency).length > 0){

        const now = new Date();
        let currentDate = date.format(now, "YYYY-MM-DD HH:mm:ss");

        let existingCurrencyArray = fs.readFileSync(thePath);//fetch the currency array
        existingCurrencyArray = JSON.parse(existingCurrencyArray);

        for(let m in existingCurrencyArray){
          if (existingCurrencyArray[m].second_currency in allCurrency){
            //get the conversion rate from the returned object
            let currentRate = allCurrency[ existingCurrencyArray[m].second_currency];
            existingCurrencyArray[m].rate_of_conversion = currentRate;
            existingCurrencyArray[m].updated_at = currentDate;

          }
        }

        let data = JSON.stringify(existingCurrencyArray, null, 2);
        fs.writeFileSync(thePath, data);

        this.responseObject.setStatus(true);
        this.responseObject.setMessage("Update was successful");
        this.responseObject.setData({
          all_currencies: existingCurrencyArray
        });
        res.json(this.responseObject.sendToView());

      }

    }catch(err){
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }

  }

}

module.exports = CurrencyController;
