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
  test("It should respond with an array of companies", async function() {
    const response = await request(app).get("/companies");
    expect(response.body).toEqual({
      "companies": [
        {code: 'test', 
        name: 'Test', 
        description: 'Maker of Test'}
      ]
    });
  });
});

describe("GET /test", function () {
  test("It should return company info", async function() {
    const response = await request(app).get("/companies/test");
    expect(response.body).toEqual({
      "company": {
        code: "test",
        name: "Test",
        description: "Maker of Test",
        invoices: [1]
      }
    });
  });

  test("It should return 404 for non-existing company", async function() {
    const response = await request(app).get('/companies/bla');
    expect(response.status).toEqual(404);
  });
});


describe("POST /", function() {
  test("It should add a new company", async function() {
    const response = await request(app)
          .post('/companies')
          .send({code: "tacotime", name: "TacoTime", description: "Yum"});

    expect(response.body).toEqual({
      "company": {
        code: 'tacotime',
        name: "TacoTime",
        description: "Yum"
      }
    });
  });

  test("It should return 500 for conflict", async function() {
     const response = await request(app)
            .post('/companies')
            .send({description: "nope"});

      expect(response.status).toEqual(500);
  });
});

describe("PUT /", function() {
  test("It should update a company", async function () {
    const response = await request(app)
          .put("/companies/test")
          .send({name: "TestEdit", description: "NewDescription"});

    expect(response.body).toEqual({
      "company": {
        code: "test",
        name: "TestEdit",
        description: "NewDescription"
      }
    });
  });

  test("It should return 404 for non existing company", async function() {
    const response = await request(app)
          .put("/companies/bla")
          .send({name: "Bla"});

    expect(response.status).toEqual(404);
  });

  test("It should return 500 for missing data", async function () {
    const response = await request(app)
          .put("/companies/test")
          .send({});

    expect(response.status).toEqual(500);
  });
});

describe('DELETE /', function() {
  test("It should successfully delete a company", async function() {
    const response = await request(app)
          .delete("/companies/test");

    expect(response.body).toEqual({ status: "DELETED!" });
  });

  test("It should return 404 for non existing company", async function() {
    const response = await request(app).delete("/companies/bla");

    expect(response.status).toEqual(404);
  });
});