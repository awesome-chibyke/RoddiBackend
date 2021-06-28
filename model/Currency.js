const DbActions = require("../model/DbActions");
class Currency {
  constructor() {
    this.DbActions = new DbActions();
  }

  async getAllCurrency(Currency) {
    let currency = await this.DbActions.selectBulkData(
      "currency_rates_models",
      {
        filteringConditions: [["unique_id", "=", Currency]],
      }
    );
    return currency;
  }
}

module.exports = Currency;
