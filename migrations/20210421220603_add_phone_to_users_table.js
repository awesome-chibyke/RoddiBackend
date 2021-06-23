exports.up = function (knex) {
  return knex.schema.table("users", function (table) {
    table.string("phone").unique();
  });
};

exports.down = function (knex) {};
