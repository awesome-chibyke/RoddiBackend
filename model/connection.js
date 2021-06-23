//var express = require("express");
//var app = express();

// const knex = require("knex")({
//   client: "mysql",
//   connection: {
//     host: "127.0.0.1",
//     user: "root",
//     password: "",
//     database: "guo",
//   },
// });
// // console.log(knex);

// module.exports = knex;

const knex = require("knex");

const knexFile = require("../knexfile").development;

const db = knex(knexFile);

module.exports = db;
