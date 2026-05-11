import "../setup/env.test.js";
import db from "../../src/config/db.js";

/**
 * =========================================================
 * GLOBAL TEST SETUP
 * =========================================================
 * Configuración global para Jest/Supertest.
 */

beforeAll(async () => {

  console.log("\n🧪 STARTING TEST SUITE...\n");

  try {

    await db.query("SELECT NOW()");

    console.log("🟢 TEST DATABASE CONNECTED");

  } catch (error) {

    console.error("🔴 TEST DB CONNECTION ERROR");
    console.error(error);

  }

});

beforeEach(async () => {

  /**
   * =========================================================
   * RESET MOCKS / CLEANUP
   * =========================================================
   */

  jest.clearAllMocks();

});

afterAll(async () => {

  console.log("\n🧹 CLEANING TEST ENVIRONMENT...\n");

  try {

    await db.end();

    console.log("🔌 DATABASE POOL CLOSED");

  } catch (error) {

    console.error("❌ ERROR CLOSING DB");
    console.error(error);

  }

});