exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("users", function (table) {
    table.increments("id").primary();
    table.string("unique_id").unique();
    table.string("email").unique();
    table.string("email_verification", 191).nullable();
    table.string("first_name", 191);
    table.string("middle_name", 191).nullable();
    table.string("last_name", 191);
    table.string("country_code", 191).nullable();
    table.string("referral_id", 191).nullable();
    table.string("referrer_id", 191).nullable();
    table.string("status", 191).defaultTo("active");
    table.string("passport", 191).nullable();
    table.string("id_upload_status", 191).defaultTo("none");
    table.string("id_name", 191).nullable();
    table.string("face_upload_status", 191).defaultTo("none");
    table.string("face_picture_name", 191).nullable();
    table.datetime("face_pic_upload_date", 6).nullable();
    table.string("account_verification_level", 191).defaultTo(0);
    table.string("wallet_public_key", 300).nullable();
    table.string("wallet_primary_key", 300).nullable();
    table.string("wallet_id", 191).nullable();
    table.text("description").nullable();
    table.dateTime("start_date");
    table.dateTime("due_date");
    table.timestamps();
  });
};

exports.down = function (knex) {};
