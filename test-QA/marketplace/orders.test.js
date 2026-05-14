import request from "supertest";
import app from "../../src/app.js";

describe("MARKETPLACE - ORDERS", () => {

  test("Debe fallar al aceptar orden sin datos", async () => {

    const response = await request(app)
      .post("/api/marketplace/fulfillment/accept")
      .send({});

    expect([400, 401, 403, 422]).toContain(response.status);

  });

  test("Debe fallar al entregar servicio sin datos", async () => {

    const response = await request(app)
      .post("/api/marketplace/fulfillment/deliver")
      .send({});

    expect([400, 401, 403, 422]).toContain(response.status);

  });

  test("Debe fallar al completar orden sin datos", async () => {

    const response = await request(app)
      .post("/api/marketplace/fulfillment/complete")
      .send({});

    expect([400, 401, 403, 422]).toContain(response.status);

  });

  test("Debe fallar al obtener fulfillment de orden inexistente", async () => {

    const response = await request(app)
      .get("/api/marketplace/fulfillment/999999");

    expect([400, 401, 403, 404]).toContain(response.status);

  });

  test("Debe fallar al actualizar estado de servicio sin datos", async () => {

    const response = await request(app)
      .put("/api/marketplace/service/status")
      .send({});

    expect([400, 401, 403, 422]).toContain(response.status);

  });

});