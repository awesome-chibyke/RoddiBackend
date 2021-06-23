exports.up = function (knex) {
  return knex.schema.table("users", function (table) {
    table.string("auth_type").defaultTo("email");
    table.string("address").nullable();
    table.string("state").nullable();
    table.string("country").nullable();
    table.string("preferred_currency").defaultTo("REV65f13a31c");
    table.string("type_of_user").defaultTo("user");
  });
};

exports.down = function (knex) {};
{
}
