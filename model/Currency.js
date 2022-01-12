const DbActions = require("../model/DbActions");
const User = require("../model/User");

const fs = require("fs");
class Currency {
  constructor() {
    this.DbActions = new DbActions();
    this.User = new User();

    this.currencyCodeArray = [
      "BIF","CAD","CDF","CVE","EUR","GBP","GHS","GMD","GNF","KES","LRD","MWK","MZN","NGN","RWF","SLL","STD","TZS","UGX","USD","XAF","XOF","ZMK","ZMW","ZWD","ZAR",
    ];

    this.countryAbbrArray = [
      "BI","CA","DR","CV","EU","GB","GH","GM","GN","KE","LRD","MWK","MZN","NG","RW","SL","ST","TZ","UG","US","XA","XO","ZM","ZM","ZW","ZA",
    ];
    this.CurrencyFilePath = './files/currency/currency_details.json';
  }

  async getAllCurrency(conditions) {
    //[["unique_id", "=", Currency]]
    /*let currency = await this.DbActions.selectAllData("currency_rates_models", {
      filteringConditions: conditions,
    }); currency*/

    let thePath = this.CurrencyFilePath;//currency json file path

    let existingCurrencyArray = fs.readFileSync(thePath);//reading the file
    existingCurrencyArray = JSON.parse(existingCurrencyArray);

    return existingCurrencyArray;
  }


  //fetch currency based on the user ip address
  async fetchCurrencyBasedOnCountryCode(country_code){
    const filePath = this.CurrencyFilePath;
    let existingCurrencyArray = fs.readFileSync(filePath);
    existingCurrencyArray = JSON.parse(existingCurrencyArray);
    let selected = null

    if(existingCurrencyArray.length > 0){
      for(let i in existingCurrencyArray){
        if(existingCurrencyArray[i].country_abbr === country_code){
          selected = existingCurrencyArray[i];
          break;
        }
      }
    }

    return selected;

  }

  getAllNeededCurrency(currency_rate_details) {
    let newCurrencyArray = [];

    for (var u = 0; u < currency_rate_details.length; u++) {
      let {
        id,
        currency_name,
        second_currency,
        country_name,
        country_abbr
      } =
      currency_rate_details[u];

      if (country_name == null) {
        //country_name = 'UNKNOWN'
        continue;
      } //checkIfInArray(second_currency.trim(), currencyArray)
      if (
        !this.currencyCodeArray.includes(second_currency) ||
        !this.countryAbbrArray.includes(country_abbr)
      ) {
        continue;
      }
      newCurrencyArray.push(currency_rate_details[u]);
    }

    return newCurrencyArray;
  }

  async defaultCurrency(req, res){

    try{
      let IpInformation = await this.User.returnIpDetails(req);
      let currency = IpInformation.currency;
      let countryCode = IpInformation.countryCode;
      let selectedCurrency = await this.fetchCurrencyBasedOnCountryCode(countryCode);

      if(Object.keys(selectedCurrency).length == 0){
        selectedCurrency = await this.fetchCurrencyBasedOnCountryCode('USD');
      }

      return {
        status:true,
        message:'',
        data:{selected_currency:selectedCurrency, ip_information:IpInformation}
      }

    }catch(e){

      return {
        status:true,
        message:ErrorHandler(e),
        data:[]
      }

    }
  }

}

module.exports = Currency;