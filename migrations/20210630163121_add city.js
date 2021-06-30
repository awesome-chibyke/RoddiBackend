exports.up = function (knex) {
  return knex.schema.table("users", function (table) {
    table.string("city").nullable();
    table.string("zip_code").nullable();
  });
};

exports.down = function (knex) {};
