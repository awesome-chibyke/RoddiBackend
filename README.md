//nin...........................
https://developers.roqqu.com/reference#nin-verification

//.....................important url.......................
https://www.digitalocean.com/community/tutorials/how-to-handle-routing-in-react-apps-with-react-router

//.....................knex js...............
https://dev.to/itachiuchiha/building-and-running-sql-queries-with-knex-js-55d4

///cors.........................
https://medium.com/zero-equals-false/using-cors-in-express-cac7e29b005b#:~:text=Enabling%20CORS,using%20the%20cors%20npm%20module.&text=That's%20it.,CORS%20is%20now%20enabled.&text=The%20Access%2DControl%2DAllow%2D,allows%20access%20from%20any%20origin).

//validation in node
https://blog.logrocket.com/how-to-handle-data-validation-in-node-using-validatorjs/
https://github.com/mikeerickson/validatorjs

//..............more on knejs
https://gist.github.com/NigelEarle/70db130cc040cc2868555b29a0278261


twilio recovery code:aiJbjyDSK9BRbU1AMktSuMr3T-KAlaNXNapfr392


// curency
async function getAllNeededCurrency(selectedCurrency = "") {
  //getting theKey that is assign after a user logs in
  let userType = await getRequest("../getTypeOfUser.php?get_user_type");
  let typeOfUser = userType.typeOfUser;
  let userDetails = await getDetailsAnyUser(typeOfUser);
  let theKey = userDetails["theKey"];

  var dataHold = "";
  let returnedData = await getRequest(
    baseurl + "/api/currency/get_all_currency/" + theKey
  );
  let { status, error_statement, return_data } = returnedData;

  if (status === false) {
    handleErrorStatement(error_statement);
    return;
  }

  if (status === true) {
    var currencyArray = [
      "BIF",
      "CAD",
      "CDF",
      "CVE",
      "EUR",
      "GBP",
      "GHS",
      "GMD",
      "GNF",
      "KES",
      "LRD",
      "MWK",
      "MZN",
      "NGN",
      "RWF",
      "SLL",
      "STD",
      "TZS",
      "UGX",
      "USD",
      "XAF",
      "XOF",
      "ZMK",
      "ZMW",
      "ZWD",
      "ZAR",
    ];

    var countryCodeArray = [
      "BI",
      "CA",
      "DR",
      "CV",
      "EU",
      "GB",
      "GH",
      "GM",
      "GN",
      "KE",
      "LRD",
      "MWK",
      "MZN",
      "NG",
      "RW",
      "SL",
      "ST",
      "TZ",
      "UG",
      "US",
      "XA",
      "XO",
      "ZM",
      "ZM",
      "ZW",
      "ZA",
    ];

    let { currency_rate_details } = return_data;

    dataHold += `<option selected value="">Please Select Preferred Currency</option>`;

    for (var u = 0; u < currency_rate_details.length; u++) {
      let { id, currency_name, second_currency, country_name, country_abbr } =
        currency_rate_details[u];

      if (country_name == null) {
        //country_name = 'UNKNOWN'
        continue;
      } //checkIfInArray(second_currency.trim(), currencyArray)
      if (
        !currencyArray.includes(second_currency) ||
        !countryCodeArray.includes(country_abbr)
      ) {
        continue;
      }
      let theSelectedCurrency = selectedCurrency == id ? "selected" : "";
      dataHold += `<option ${theSelectedCurrency} value="${id}">${country_name} (${second_currency}) (${country_abbr})</option>`;
    }
  }
  return dataHold;
}
