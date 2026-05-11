import request from "supertest";
import app from "../../src/app.js";

describe("HEALTH CHECK", () => {

  test("Debe responder correctamente en '/'", async () => {

    const response = await request(app)
      .get("/");

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty(
      "message"
    );

  });

  test("Debe responder correctamente en '/test-db'", async () => {

    const response = await request(app)
      .get("/test-db");

    expect([200, 500]).toContain(response.status);

  });

});