
exports.up = function(knex) {
    return knex.schema.table("users", function (table) {
        table.string("oauth_disable_request").nullable();
        table.datetime("oauth_disable_request_time").nullable();
    });
};

exports.down = function(knex) {
  
};
