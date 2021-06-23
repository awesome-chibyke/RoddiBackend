exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("code_table", function (table) {
    table.increments("id").primary();
    table.string("unique_id").unique();
    table.string("user_unique_id").nullable();
    table.string("token").nullable();
    table.string("type").nullable();
    table.string("status").nullable();
    table.dateTime("deleted_at").nullable();
    table.timestamps();
  });
};

exports.down = function (knex) {};
