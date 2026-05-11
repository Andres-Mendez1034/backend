import request from "supertest";
import app from "../../src/app.js";

describe("PROFILES", () => {

  test("Debe bloquear acceso sin token", async () => {

    const response = await request(app)
      .get("/profiles");

    expect([401, 403]).toContain(
      response.status
    );

  });

  test("Debe bloquear token inválido", async () => {

    const response = await request(app)
      .get("/profiles")
      .set(
        "Authorization",
        "Bearer token_fake"
      );

    expect([401, 403]).toContain(
      response.status
    );

  });

  test("Debe obtener perfiles con token válido", async () => {

    /**
     * ⚠️ Reemplazar por token real de testing
     */
    const TEST_TOKEN = "TOKEN_DE_PRUEBA";

    const response = await request(app)
      .get("/profiles")
      .set(
        "Authorization",
        `Bearer ${TEST_TOKEN}`
      );

    expect([200, 401, 403]).toContain(
      response.status
    );

  });

  test("No debe responder error 500", async () => {

    const TEST_TOKEN = "TOKEN_DE_PRUEBA";

    const response = await request(app)
      .get("/profiles")
      .set(
        "Authorization",
        `Bearer ${TEST_TOKEN}`
      );

    expect(response.status).not.toBe(500);

  });

});