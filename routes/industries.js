const express = require("express");

const db = require('../db');
const ExpressError = require('../expressError');

const router = new express.Router();


//GET industries
router.get('/', async function(req, res, next) {
  try {
    const result = await db.query(`SELECT * FROM industries`);
    return res.json({industries: result.rows});
  } catch(e) {
    return next(e);
  }
});

//POST new industry
router.post('/', async function(req, res, next) {
  try {
    const { code, industry } = req.body;
    const result = await db.query(
      `INSERT INTO industries (code, industry) 
      VALUES ($1, $2) 
      RETURNING code, industry`, [code, industry]);

      return res.json({ industry: result.rows[0] });
  } catch(e) {
    next(e);
  }
});

//Associate company with industry
router.post('/:comp_code', async function(req, res, next) {
  try {
    const { comp_code } = req.params;
    const industry_code = req.body.industry_code;
    if (!req.body.industry_code) throw new ExpressError("Please enter an industry code");

    const companyResult = await db.query(`SELECT * FROM companies WHERE code = $1`, [comp_code]);
    const industryResult = await db.query(`SELECT * FROM industries WHERE code = $1`, [industry_code]);
    if (companyResult.rows.length === 0) throw new ExpressError(`No company found with code ${comp_code}`, 404);
    if (industryResult.rows.length === 0) throw new ExpressError(`No industry found with code ${industry_code}`, 404);

    const result = await db.query(
      `INSERT INTO companies_industries (comp_code, industry_code) 
      VALUES ($1, $2) 
      RETURNING *`, [comp_code, industry_code]);

    return res.json({ status: `${industryResult.rows[0].industry} added to ${companyResult.rows[0].name}`});
  } catch(e) {
    return next(e);
  }
});

module.exports = router;