exports.up = function (knex) {
  return knex.schema.createTableIfNotExists("settings", function (table) {
    table.increments("id").primary();
    table.string("unique_id").unique();
    table.string("site_name").nullable();
    table.string("address1").nullable();
    table.string("address2").nullable();
    table.string("email1").nullable();
    table.string("site_url").nullable();
    table.string("email2").nullable();
    table.string("logo_url").nullable();
    table.string("facebook").nullable();
    table.string("instagram").nullable();
    table.string("phone1").nullable();
    table.string("phone2").nullable();
    table.string("least_withdrawable_amount").nullable();
    table.string("no_of_days_to_review").nullable();
    table.string("linkedin").nullable();
    table.string("total_projects").nullable();
    table.string("address_3").nullable();
    table.string("address4").nullable();
    table.dateTime("deleted_at").nullable();
    table.timestamps();
  });
};

exports.down = function (knex) {};

// unique_id,
//   site_name,
//   address1,
//   address2,
//   email1,
//   site_url,
//   email2,
//   logo_url,
//   facebook,
//   instagram,
//   phone1,
//   phone2,
//   least_withdrawable_amount,
//   no_of_days_to_review,
//   linkedin,
//   total_projects,
//   address_3,
//   address4;
