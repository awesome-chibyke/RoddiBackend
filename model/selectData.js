var dataBaseConnection = require("../model/connection");

const selectData = (
  tableName,
  options = { fields: [], filteringConditions: [] }
) => {
  const { fields, filteringConditions } = options;

  return dataBaseConnection(tableName)
    .select(fields)
    .where((builder) => {
      filteringConditions.forEach((condition) => {
        builder.where(...condition);
      });
    })
    .then((data) => data)
    .finally(() => dataBaseConnection.destroy());
};

module.exports = selectData;
