
exports.up = function(knex) {
    return knex.schema.table("users", function (table) {
        table.string("document_number").nullable();
    });
};

exports.down = function(knex) {
  
};
