const DbActions = require("../model/DbActions");
class Currency {
  constructor() {
    this.DbActions = new DbActions();
    
    this.currencyCodeArray = [
      "BIF","CAD","CDF","CVE","EUR","GBP","GHS","GMD","GNF","KES","LRD","MWK","MZN","NGN","RWF","SLL","STD","TZS","UGX","USD","XAF","XOF","ZMK","ZMW","ZWD","ZAR",
    ];

    this.countryAbbrArray = [
      "BI","CA","DR","CV","EU","GB","GH","GM","GN","KE","LRD","MWK","MZN","NG","RW","SL","ST","TZ","UG","US","XA","XO","ZM","ZM","ZW","ZA",
    ];
  }

  async getAllCurrency(conditions) {
    //[["unique_id", "=", Currency]]
    let currency = await this.DbActions.selectAllData("currency_rates_models", {
      filteringConditions: conditions,
    });
    if (currency === "undefined") {
      return false;
    }
    return currency;
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
}

module.exports = Currency;