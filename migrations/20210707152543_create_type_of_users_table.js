
exports.up = function(knex) {
    return knex.schema.createTableIfNotExists("type_of_user_tb", function (table) {
        table.increments("id").primary();
        table.string("unique_id", 191).unique();
        table.string("type_of_user", 191).nullable();
        table.text("description").nullable();
        table.dateTime("deleted_at").nullable();
        table.timestamps();
    });
};

exports.down = function(knex) {
  
};
