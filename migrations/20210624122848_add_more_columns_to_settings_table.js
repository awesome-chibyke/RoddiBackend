
exports.up = function(knex) {
    return knex.schema.table("settings", function (table) {
        table.string("slogan").nullable();
        table.string("front_end_base_url").nullable();
        table.string("backend_base_url").nullable();
        table.string("ios_app_store_link").nullable();
        table.string("preferred_currency").nullable();
    });
};

exports.down = function(knex) {
  
};