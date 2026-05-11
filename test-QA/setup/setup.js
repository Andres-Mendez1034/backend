import "../setup/env.test.js";
import db from "../../src/config/db.js";

/**
 * =========================================================
 * GLOBAL TEST SETUP
 * =========================================================
 */

beforeAll(async () => {

  console.log("\n==============================");
  console.log("STARTING TEST SUITE");
  console.log("==============================\n");

  try {

    await db.query("SELECT NOW()");

    console.log("TEST DATABASE CONNECTED");

  } catch (error) {

    console.error("TEST DB CONNECTION ERROR");
    console.error(error);

  }

});

beforeEach(() => {

  /**
   * IMPORTANTE:
   * No usar jest global directamente aquí porque en tu entorno ESM puede fallar
   * Si necesitas mocks, se manejan dentro de cada test
   */

  // limpiar mocks solo si existen en contexto de test
  if (typeof jest !== "undefined" && jest.clearAllMocks) {
    jest.clearAllMocks();
  }

});

afterAll(async () => {

  console.log("\n==============================");
  console.log("CLEANING TEST ENVIRONMENT");
  console.log("==============================\n");

  try {

    // deja terminar queries pendientes
    await new Promise((resolve) => setTimeout(resolve, 300));

    // cerrar pool de DB
    await db.end();

    // seguridad extra para evitar teardown crash
    await new Promise((resolve) => setTimeout(resolve, 200));

    console.log("DATABASE POOL CLOSED");

    console.log("\n==============================");
    console.log("TEST SUITE FINISHED");
    console.log("If no failures appear above, everything is working correctly");
    console.log("==============================\n");

  } catch (error) {

    console.error("ERROR CLOSING DB");
    console.error(error);

  }

});