
exports.up = function(knex) {
    return knex.schema.table("login_table", function (table) {
        table.text('token_secret').alter();
    });
};

exports.down = function(knex) {
  
};
