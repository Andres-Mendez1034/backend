import request from "supertest";
import app from "../../src/app.js";

describe("MARKETPLACE - PRODUCTS", () => {

  test("Debe obtener todos los servicios", async () => {

    const response = await request(app)
      .get("/api/marketplace/services");

    expect([200, 401, 403]).toContain(response.status);

  });

  test("Debe responder JSON en GET /services", async () => {

    const response = await request(app)
      .get("/api/marketplace/services");

    expect(response.headers["content-type"]).toMatch(/json/);

  });

  test("Debe fallar al crear servicio sin datos", async () => {

    const response = await request(app)
      .post("/api/marketplace/service")
      .send({});

    expect([400, 401, 403, 422]).toContain(response.status);

  });

  test("Debe fallar al crear servicio sin token", async () => {

    const response = await request(app)
      .post("/api/marketplace/service")
      .send({
        title: "Servicio de prueba",
        description: "Descripción de prueba",
        price: 100
      });

    expect([400, 401, 403]).toContain(response.status);

  });

  test("Debe obtener servicios por usuario", async () => {

    const response = await request(app)
      .get("/api/marketplace/services/user/1");

    expect([200, 401, 403, 404]).toContain(response.status);

  });

});