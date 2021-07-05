
exports.up = function(knex) {
    return knex.schema.alterTable('users', function(t) {
        t.string('profile_update_watch').defaultTo('none').alter();
    });
};

exports.down = function(knex) {
  
};
