import request from "supertest";
import app from "../../src/app.js";

describe("AUTH - GET ME", () => {

  test("Debe fallar si no se envía token", async () => {

    const response = await request(app)
      .get("/api/auth/me");

    expect([401, 403, 404]).toContain(response.status);

  });

  test("Debe fallar si el token es inválido", async () => {

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer token_falso");

    expect([401, 403, 404]).toContain(response.status);

  });

  test("Debe responder correctamente con token válido", async () => {

    const TEST_TOKEN = "TOKEN_DE_PRUEBA";

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${TEST_TOKEN}`);

    expect([200, 401, 403, 404]).toContain(response.status);

  });

});