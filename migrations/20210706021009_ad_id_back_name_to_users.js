
exports.up = function(knex) {
    return knex.schema.table("users", function (table) {
        table.dateTime("id_back_name").nullable();
    });
};

exports.down = function(knex) {
  
};
