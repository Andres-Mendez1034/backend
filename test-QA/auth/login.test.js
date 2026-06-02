import request from "supertest";
import app from "../../src/app.js";

describe("AUTH - LOGIN", () => {

  test("Debe fallar si no se envían credenciales", async () => {

    const response = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(response.status).toBe(400);

  });

  test("Debe fallar si el email es inválido", async () => {

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "correo-invalido",
        password: "123456"
      });

    expect(response.status).toBe(400);

  });

  test("Debe fallar si la contraseña está vacía", async () => {

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@test.com",
        password: ""
      });

    expect(response.status).toBe(400);

  });

  test("Debe responder aunque el usuario no exista", async () => {

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "fake@test.com",
        password: "123456789"
      });

    expect([400, 401, 404]).toContain(response.status);

  });

});