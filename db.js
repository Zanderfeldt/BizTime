/** Database setup for BizTime. */
const { Client } = require('pg');


let DB_NAME;

if (process.env.NODE_ENV === "test") {
  DB_NAME = "biztime_test";
} else {
  DB_NAME = "biztime";
}

let db = new Client({
  host: "/var/run/postgresql/",
  database: DB_NAME
});
// let db = new Client({
//   connectionString: DB_URI
// });


db.connect();

module.exports = db;
