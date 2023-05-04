const express = require("express");
const slugify = require("slugify");
const db = require('../db');
const ExpressError = require('../expressError');

const router = new express.Router();

//GET companies
router.get('/', async function(req, res, next) {
  try {
    const result = await db.query("SELECT * FROM companies");
    return res.json({ 'companies': result.rows })
  } catch(e) {
    return next(e);
  }
});

//GET company by code
router.get('/:code', async function(req, res, next) {
  try {
    const { code } = req.params;
    const compResult = await db.query(
      `SELECT c.code, c.name, c.description, i.industry 
      FROM companies as c 
      LEFT JOIN companies_industries as ci 
      ON c.code = ci.comp_code 
      LEFT JOIN industries as i 
      ON ci.industry_code = i.code 
      WHERE c.code = $1`, [code]);
    const invResult = await db.query(
      `SELECT id 
      FROM invoices 
      WHERE comp_code = $1`, [code]);
      
    if (compResult.rows.length === 0) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    }

    const company = compResult.rows[0];
    const invoices = invResult.rows;
    
    company.invoices = invoices.map(inv => inv.id);

    return res.json({ "company": company});
  } catch (e) {
    return next(e);
  }
});

//POST company
router.post('/', async function(req, res, next) {
  try {
    let { name, description } = req.body;
    let code = slugify(name, {lower: true});
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
    return res.status(201).json({company: result.rows[0]});
  } catch(e) {
    return next(e);
  }
});

//PUT company by code
router.put('/:code', async function(req, res, next) {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const result = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code]);
    if (result.rows.length === 0) {
      throw new ExpressError(`Can't update company with code of ${code}`, 404);
    }
    return res.status(200).json({company: result.rows[0]});
  } catch (e) {
    return next(e);
  }
});

//DELETE company by code
router.delete('/:code', async function(req, res, next) {
  try {
    const result = await db.query(`DELETE FROM companies WHERE code = $1 RETURNING code`, [req.params.code]);
    if (result.rows.length === 0) {
      throw new ExpressError(`Can't delete company with code of ${req.params.code}`, 404);
    }
    return res.json({ status: "DELETED!" });
  } catch (e) {
    return next(e);
  }
})

module.exports = router;