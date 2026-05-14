require("./env.test.js");
const dbModule = require("../../src/config/db.js");
const db = dbModule.default || dbModule;

/**
 * =========================================================
 * GLOBAL TEST SETUP (JEST SAFE - COMMONJS)
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
    throw error;
  }
});

beforeEach(() => {
  if (typeof globalThis.jest !== "undefined" && globalThis.jest.clearAllMocks) {
    globalThis.jest.clearAllMocks();
  }
});

afterAll(async () => {
  console.log("\n==============================");
  console.log("CLEANING TEST ENVIRONMENT");
  console.log("==============================\n");

  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (db && typeof db.end === "function") {
      await db.end();
      console.log("DATABASE POOL CLOSED");
    }

    console.log("\n==============================");
    console.log("TEST SUITE FINISHED");
    console.log("==============================\n");

  } catch (error) {
    console.error("ERROR CLOSING DB");
    console.error(error);
  }
});