import db from "../../src/config/db.js";

describe("DATABASE", () => {

  test("Debe conectarse correctamente a PostgreSQL", async () => {

    const result = await db.query(
      "SELECT NOW() AS current_time"
    );

    expect(result).toBeDefined();
    expect(result.rows).toBeDefined();
    expect(result.rows.length).toBeGreaterThan(0);

  });

  test("Debe responder consultas simples", async () => {

    const result = await db.query(
      "SELECT 1 + 1 AS result"
    );

    expect(result.rows[0].result).toBe(2);

  });

  afterAll(async () => {

    await db.end();

  });

});