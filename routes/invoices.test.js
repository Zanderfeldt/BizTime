process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require('../db');
const { createData } = require("../_test-common");


beforeEach(createData);

afterAll(async () => {
  await db.end()
});

describe("GET /", function() {
  test("It should get all invoices", async function() {
    const response = await request(app).get('/invoices');

    expect(response.body).toEqual({
      "invoices": [
        { id: 1,
          comp_code: "test" }
      ]
    });
  });
});

describe("GET /1", function() {
  test("It should return invoice info", async function() {
    const response = await request(app).get('/invoices/1');

    expect(response.body).toEqual({
      "invoice": {
        id: 1,
        amt: 100,
        add_date: '2023-01-01T08:00:00.000Z',
        paid: false,
        paid_date: null,
        company: {
          code: 'test',
          name: 'Test',
          description: 'Maker of Test',
        }
      }
    });
  });

  test("It should return 404 for non existing invoice", async function() {
    const response = await request(app).get('/invoices/33');

    expect(response.status).toEqual(404);
  });
});

describe("POST /", function() {
  test("It should add a new invoice", async function() {
    const response = await request(app)
        .post('/invoices')
        .send({amt: 400, comp_code: 'test'});

    expect(response.body).toEqual({
      "invoice": {
        id: 2,
        comp_code: 'test',
        amt: 400,
        add_date: '2023-05-03T07:00:00.000Z',
        paid: false,
        paid_date: null,
      }
    });
  });
});

describe("PUT /", function() {
  test("It should update existing invoice", async function() {
    const response = await request(app)
          .put('/invoices/1')
          .send({amt: 600});

    expect(response.body).toEqual({
      "invoice": {
        id: 1,
        comp_code: 'test',
        amt: 600,
        add_date: '2023-01-01T08:00:00.000Z',
        paid: false,
        paid_date: null,
      }
    });
  });

  test("It should return 404 for non-existing invoice", async function() {
    const response = await request(app)
          .put('/invoice/33')
          .send({amt: 2});
    
    expect(response.status).toEqual(404);
  });

  test("It should return 500 for conflict", async function() {
    const response = await request(app)
          .put('/invoices/1')
          .send({});

    expect(response.status).toEqual(500);
  });
});

describe("DELETE /", function() {
  test("It should successfully delete invoice", async function() {
    const response = await request(app)
          .delete('/invoices/1');

    expect(response.body).toEqual({status: "deleted"});
  });

  test("It should return 404 for non existing invoice", async function() {
    const response = await request(app).delete('/invoices/33');

    expect(response.status).toEqual(404);
  });
});