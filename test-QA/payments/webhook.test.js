import request from "supertest";
import app from "../../src/app.js";

describe("PAYMENTS - WEBHOOK", () => {

  test("Debe rechazar webhook sin body", async () => {

    const response = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .send();

    expect([400, 401, 403, 500]).toContain(response.status);

  });

  test("Debe rechazar webhook con signature inválida", async () => {

    const response = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "firma_invalida")
      .send(JSON.stringify({ type: "payment_intent.succeeded" }));

    expect([400, 401, 403, 500]).toContain(response.status);

  });

  test("Debe responder JSON en error de webhook", async () => {

    const response = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .send();

    expect(response.headers["content-type"]).toMatch(/json/);

  });

  test("No debe exponer stack trace en errores de webhook", async () => {

    const response = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("stripe-signature", "firma_invalida")
      .send(JSON.stringify({ type: "test" }));

    expect(response.body).not.toHaveProperty("stack");

  });

});