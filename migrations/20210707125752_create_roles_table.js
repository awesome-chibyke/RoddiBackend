
exports.up = function(knex) {
    return knex.schema.createTableIfNotExists("roles", function (table) {
        table.increments("id").primary();
        table.string("unique_id", 191).unique();
        table.string("role", 191).nullable();
        table.text("description", 191);
        table.dateTime("deleted_at").nullable();
        table.timestamps();
    });
};

exports.down = function(knex) {
  
};
