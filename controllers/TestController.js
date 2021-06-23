//const { getMaxListeners } = require("node:process");
var dataBaseConnection = require("../model/connection");

var DbActions = require("../model/DbActions");
DbActions = new DbActions();

class TestController {
  index(req, res) {
    res.send("Hello Sammy!");
  }

  async getReal(req, res) {
    let dbValues = await dataBaseConnection.select("*").from("react_users");
    return dbValues;
  }

  async store() {
    try {
      let insertValue = await DbActions.insertData("react_users", [
        {
          full_name: "test test",
          email: "assa@gmail.com",
          phone: "080765435467",
        },
      ]);
      console.log(insertValue);
      return {
        status: true,
        message: "Data was successfully saved",
        data: insertValue,
      };
    } catch (e) {
      return {
        status: false,
        message: "Message failed",
      };
    }
  }
}

module.exports = TestController;
