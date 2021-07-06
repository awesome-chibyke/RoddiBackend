
exports.up = function(knex) {
    return knex.schema.alterTable('users', function(t) {
        t.string('id_back_name').alter();
    });
};

exports.down = function(knex) {
  
};
