
exports.up = function(knex) {
    return knex.schema.table("users", function (table) {
        table.string("oauth_disable_steps").nullable();
        table.string("password_change_authorisation").nullable();
        table.dateTime("password_change_time").nullable();
    });
};

exports.down = function(knex) {
  
};
