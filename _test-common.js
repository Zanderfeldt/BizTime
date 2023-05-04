const db = require("./db");

async function createData() {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
  await db.query("SELECT setval('invoices_id_seq', 1, false)");

  await db.query(`INSERT INTO companies (code, name, description)
                  VALUES ('test', 'Test', 'Maker of Test')`);

  await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
                  VALUES ('test', 100, false, '2023-01-01', null)
                  RETURNING id`);
}

module.exports = { createData };