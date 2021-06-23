exports.up = function (knex) {
  return knex.schema.table("users", function (table) {
    table.string("password").nullable();
  });
};

exports.down = function (knex) {};
