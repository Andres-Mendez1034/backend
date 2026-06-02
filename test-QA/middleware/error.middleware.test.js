import request from "supertest";
import app from "../../src/app.js";

describe("ERROR MIDDLEWARE", () => {

  test("Debe responder 404 en rutas inexistentes", async () => {

    const response = await request(app)
      .get("/ruta-que-no-existe");

    expect(response.status).toBe(404);

  });

  test("Debe responder JSON en errores", async () => {

    const response = await request(app)
      .get("/ruta-inexistente");

    expect(response.headers["content-type"])
      .toMatch(/json/);

  });

  test("No debe exponer stack trace sensible", async () => {

    const response = await request(app)
      .get("/ruta-error-total");

    const responseText = JSON.stringify(
      response.body
    );

    expect(responseText).not.toMatch(
      /ReferenceError|SyntaxError|stack/i
    );

  });

});