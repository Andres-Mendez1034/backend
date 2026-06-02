import request from "supertest";
import app from "../../src/app.js";

describe("PAYMENTS", () => {

  test("Debe fallar al crear checkout sin token", async () => {

    const response = await request(app)
      .post("/api/payments/create-checkout")
      .send({});

    expect([400, 401, 403]).toContain(response.status);

  });

  test("Debe fallar al crear checkout sin datos", async () => {

    const TEST_TOKEN = "TOKEN_DE_PRUEBA";

    const response = await request(app)
      .post("/api/payments/create-checkout")
      .set("Authorization", `Bearer ${TEST_TOKEN}`)
      .send({});

    expect([400, 401, 403, 422, 500]).toContain(response.status);

  });

  test("Debe fallar al obtener status sin token", async () => {

    const response = await request(app)
      .get("/api/payments/status/payment_fake_123");

    expect([401, 403]).toContain(response.status);

  });

  test("Debe fallar al obtener status de pago inexistente", async () => {

    const TEST_TOKEN = "TOKEN_DE_PRUEBA";

    const response = await request(app)
      .get("/api/payments/status/payment_fake_123")
      .set("Authorization", `Bearer ${TEST_TOKEN}`);

    expect([400, 401, 403, 404, 500]).toContain(response.status);

  });

});