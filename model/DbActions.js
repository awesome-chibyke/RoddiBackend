var dataBaseConnection = require("../model/connection");
const date = require("date-and-time");
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

  async selectBulkData(//where
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


  async deleteDataFromTable(mainTableFilterName, mainTableFilterColumn, unique_id, table_array = [], column_for_filtering = 'user_unique_id'){
    //get the current date
    let currentTime = new Date();
    currentTime = date.format(currentTime, "YYYY-MM-DD HH:mm:ss");

    await this.updateData(mainTableFilterName, {//update the deleted at column
      fields: {deleted_at:currentTime},
      filteringConditions: [[mainTableFilterColumn, "=", unique_id]],
    });

    if(table_array.length > 0){//check the lenght of the table array
      for(let i in table_array){//loop through the array
        let dataToDelete = await this.selectBulkData(table_array[i], {//select the bulk of data from the particular table
          filteringConditions: [[column_for_filtering, "=", unique_id]],
        });

        if(dataToDelete.length > 0){//check if the selected data is more than 0
          for(let m in dataToDelete){//loop through the selected data
            await this.updateData(table_array[i], {//update the deleted at column
              fields: {deleted_at:currentTime},
              filteringConditions: [['unique_id', "=", dataToDelete[m].unique_id]],
            })
          }
        }

        return {
          status:true,
          message:'Delete action was successful'
        }

      }
    }
  }


}

module.exports = DbActions;
