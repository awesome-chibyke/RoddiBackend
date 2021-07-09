
exports.up = function(knex) {
    return knex.schema.alterTable('users', function(t) {
        t.integer('account_verification_level').alter();
    });
};

exports.down = function(knex) {
  
};
