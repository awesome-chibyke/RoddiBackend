
exports.up = function(knex) {
    return knex.schema.table("privileges_tb", function (table) {
        table.string("status").defaultTo('active');
    });
};

exports.down = function(knex) {
  
};
