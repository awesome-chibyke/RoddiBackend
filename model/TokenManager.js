const DbActions = require("../model/DbActions");

class TokenManager {
  constructor() {
    this.DbActions = new DbActions();
  }
  async updateToken(tokenRequestObject) {
    //fetch the user
    let tokenDetails = await this.DbActions.selectSingleRow("code_table", {
      filteringConditions: [["unique_id", "=", tokenRequestObject.unique_id]],
    });

    tokenDetails.status = tokenRequestObject.status ?? tokenDetails.status;

    //update the user
    await this.DbActions.updateData("code_table", {
      fields: tokenDetails,
      filteringConditions: [["unique_id", "=", tokenDetails.unique_id]],
    });
    return tokenDetails;
  }
}

module.exports = TokenManager;
