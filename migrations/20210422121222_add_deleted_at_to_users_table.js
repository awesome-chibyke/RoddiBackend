exports.up = function (knex) {
  return knex.schema.table("users", function (table) {
    table.string("deleted_at").nullable();
  });
};

exports.down = function (knex) {};
