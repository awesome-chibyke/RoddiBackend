var dataBaseConnection = require("../model/connection");

const selectFirst = (
  tableName,
  options = { fields: [], filteringConditions: [] },
  destroy = "no"
) => {
  const { fields, filteringConditions } = options;

  let selectRow = dataBaseConnection(tableName)
    //.select(fields)
    .where((builder) => {
      filteringConditions.forEach((condition) => {
        builder.where(...condition);
      });
    })
    .first()
    .then((data) => data);

  if (destroy === "yes") {
    selectRow.finally(() => dataBaseConnection.destroy());
  }
  return selectRow;
};
////knex.table('users').first('id', 'name').then(function(row) { console.log(row); });
//db('table_name').where({id: 1}).first().then((row) => row)
module.exports = selectFirst;
