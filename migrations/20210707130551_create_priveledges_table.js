
exports.up = function(knex) {
    return knex.schema.createTableIfNotExists("privileges_tb", function (table) {
        table.increments("id").primary();
        table.string("unique_id", 191).unique();
        table.string("type_of_user_unique_id", 191).nullable();
        table.string("role_unique_id", 191).nullable();
        table.dateTime("deleted_at").nullable();
        table.timestamps();
    });
};//unique_id,type_of_user_unique_id,role_unique_id,deleted_at

exports.down = function(knex) {
  
};
