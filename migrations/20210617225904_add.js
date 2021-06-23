exports.up = function (knex) {
  return knex.schema.table("users", function (table) {
    table.string("phone_verification").nullable();
  });
};

exports.down = function (knex) {};
