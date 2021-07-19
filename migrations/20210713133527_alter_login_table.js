
exports.up = function(knex) {
    return knex.schema.table('login_table', function (table) {
        table.dropColumn('logged_in_at');
        table.dropColumn('logged_out_at');
        table.dropColumn('token_id');
        table.string('device_name');
        table.string('location');
    })
};

exports.down = function(knex) {

};
