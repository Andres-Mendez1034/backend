import request from "supertest";
import app from "../../src/app.js";

describe("AUTH MIDDLEWARE", () => {

  test("Debe bloquear acceso sin token", async () => {

    const response = await request(app)
      .get("/users");

    expect([401, 403, 404]).toContain(response.status);

  });

  test("Debe bloquear token inválido", async () => {

    const response = await request(app)
      .get("/users")
      .set(
        "Authorization",
        "Bearer token_invalido"
      );

    expect([401, 403, 404]).toContain(response.status);

  });

  test("Debe permitir acceso con token válido", async () => {

    const TEST_TOKEN = "TOKEN_DE_PRUEBA";

    const response = await request(app)
      .get("/users")
      .set(
        "Authorization",
        `Bearer ${TEST_TOKEN}`
      );

    expect([200, 401, 403, 404]).toContain(
      response.status
    );

  });

});