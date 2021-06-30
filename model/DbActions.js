var dataBaseConnection = require("../model/connection");
class DbActions {
  async insertData(tableName, data = [], destroy = "no") {
    let dataInserter = await dataBaseConnection(tableName)
      .insert(data)
      .then((resp) => resp);

    if (destroy === "yes") {
      dataInserter.finally(() => dataBaseConnection.destroy());
    }
    return dataInserter;
  }

  async selectBulkData(
    tableName,
    options = { fields: [], filteringConditions: [] },
    filterDeletedRows = "yes",
    destroy = "no"
  ) {
    const { fields, filteringConditions } = options;

    let bulkDataSelector = dataBaseConnection(tableName)
      .select(fields)
      .where((builder) => {
        filteringConditions.forEach((condition) => {
          builder.where(...condition);
        });
      });
    if (filterDeletedRows === "yes") {
      bulkDataSelector.havingNull("deleted_at");
    }
    bulkDataSelector.then((data) => data);

    if (destroy === "yes") {
      bulkDataSelector.finally(() => dataBaseConnection.destroy());
    }
    return bulkDataSelector;
  }


  async selectAllData(
    tableName,
    options = { fields: [], filteringConditions: [] },
    filterDeletedRows = "yes",
    destroy = "no"
  ) {
    const { fields, filteringConditions } = options;

    let bulkDataSelector = dataBaseConnection(tableName)
      .select(fields);
    if (filterDeletedRows === "yes") {
      bulkDataSelector.havingNull("deleted_at");
    }
    bulkDataSelector.then((data) => data);

    if (destroy === "yes") {
      bulkDataSelector.finally(() => dataBaseConnection.destroy());
    }
    return bulkDataSelector;
  }

  //select a single row
  async selectSingleRow(
    tableName,
    options = { fields: [], filteringConditions: [] },
    filterDeletedRows = "yes",
    destroy = "no"
  ) {
    //options["filteringConditions"].push(["deleted_at", "=", null]);
    const { fields, filteringConditions } = options;

    let selectRow = dataBaseConnection(tableName)
      //.select(fields)
      .where((builder) => {
        filteringConditions.forEach((condition) => {
          builder.where(...condition);
        });
      });
    if (filterDeletedRows === "yes") {
      selectRow.havingNull("deleted_at");
    }
    selectRow.first();
    selectRow.then((data) => data);

    if (destroy === "yes") {
      selectRow.finally(() => dataBaseConnection.destroy());
    }
    return selectRow;
  }

  //update a table
  async updateData(
    tableName,
    options = { fields: {}, filteringConditions: [] },
    destroyConnection = "no"
  ) {
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
  }
}

module.exports = DbActions;
