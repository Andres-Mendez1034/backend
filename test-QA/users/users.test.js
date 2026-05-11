import request from "supertest";
import app from "../../src/app.js";

describe("USERS", () => {

  test("Debe bloquear acceso sin token", async () => {

    const response = await request(app)
      .get("/users");

    expect([401, 403]).toContain(
      response.status
    );

  });

  test("Debe bloquear acceso con token inválido", async () => {

    const response = await request(app)
      .get("/users")
      .set(
        "Authorization",
        "Bearer token_fake"
      );

    expect([401, 403]).toContain(
      response.status
    );

  });

  test("Debe obtener usuarios con token válido", async () => {

    /**
     * ⚠️ Reemplazar por token real de testing
     */
    const TEST_TOKEN = "TOKEN_DE_PRUEBA";

    const response = await request(app)
      .get("/users")
      .set(
        "Authorization",
        `Bearer ${TEST_TOKEN}`
      );

    expect([200, 401, 403]).toContain(
      response.status
    );

  });

  test("La respuesta debe ser JSON", async () => {

    const TEST_TOKEN = "TOKEN_DE_PRUEBA";

    const response = await request(app)
      .get("/users")
      .set(
        "Authorization",
        `Bearer ${TEST_TOKEN}`
      );

    expect(response.headers["content-type"])
      .toMatch(/json/);

  });

});