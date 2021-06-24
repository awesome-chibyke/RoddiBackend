
exports.up = function(knex) {
    return knex.schema.table("settings", function (table) {
        table.string("ios_url").nullable();
        table.string("android_url").nullable();
    });
};

exports.down = function(knex) {
  
};
