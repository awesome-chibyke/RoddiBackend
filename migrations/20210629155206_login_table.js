exports.up = function(knex) {
    return knex.schema.createTableIfNotExists("login_table", function (table) {
        table.increments("id").primary();
        table.string("unique_id").unique();
        table.string("user_unique_id");
        table.string("logged_out").nullable();
        table.string("logged_in_at", 191);
        table.string("logged_out_at", 191).nullable();
        table.string("ip_address", 191);
        table.string("token_id", 191).nullable();
        table.string("token_secret", 191).nullable();
        table.dateTime("deleted_at").nullable();
        table.dateTime("due_date");
        table.timestamps();
    });
};
//id,user_unique_id,logged_out(null, no),logged_in_at(null, date),logged_out_at(null, date), ip_address, token_id, token_secret,deleted_at,device
exports.down = function(knex) {
  
};
