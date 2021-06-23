var dataBaseConnection = require("../model/connection");

const insertData = async (tableName, data) => {
  return await dataBaseConnection(tableName)
    .insert(data)
    .then((resp) => resp)
    .finally(() => dataBaseConnection.destroy());
};

module.exports = insertData;
