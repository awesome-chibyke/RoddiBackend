
exports.up = function(knex) {
    return knex.schema.table("users", function (table) {
        table.string('preferred_currency').defaultTo('4hqoeefnnp8pci4bs9js').alter();
    });
};

exports.down = function(knex) {//
  
};
