import db from "./config/db.js";

const test = async () => {
  const result = await db.query("SELECT NOW()");
  console.log(result.rows);
};

test();