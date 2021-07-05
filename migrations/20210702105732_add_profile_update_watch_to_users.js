
exports.up = function(knex) {
    return knex.schema.table("users", function (table) {
        table.dateTime("profile_update_watch").nullable();
        table.string("account_verification_step", 191).defaultTo('none');
    });
};

exports.down = function(knex) {
  
};
