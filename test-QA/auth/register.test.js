import request from "supertest";
import app from "../../src/app.js";

describe("AUTH - REGISTER", () => {

  test("Debe fallar si no se envían datos", async () => {

    const response = await request(app)
      .post("/api/auth/register")
      .send({});

    expect(response.status).toBe(400);

  });

  test("Debe fallar si el email es inválido", async () => {

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "correo-invalido",
        password: "12345678"
      });

    expect(response.status).toBe(400);

  });

  test("Debe fallar si la contraseña es muy corta", async () => {

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@test.com",
        password: "123"
      });

    expect(response.status).toBe(400);

  });

  test("Debe registrar usuario correctamente", async () => {

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: `test_${Date.now()}@mail.com`,
        password: "Password123!"
      });

    expect([200, 201]).toContain(response.status);

  });

});