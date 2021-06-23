var dataBaseConnection = require("../model/connection");
const updateData = (
  tableName,
  options = { fields: {}, filteringConditions: [] },
  destroyConnection = "no"
) => {
  const { fields, filteringConditions } = options;

  let updateData = dataBaseConnection(tableName)
    .where((builder) => {
      filteringConditions.forEach((condition) => {
        builder.where(...condition);
      });
    })
    .update(fields)
    .then((data) => data);

  if (destroyConnection === "yes") {
    updateData.finally(() => dataBaseConnection.destroy());
  }
  return updateData;
};

module.exports = updateData;
