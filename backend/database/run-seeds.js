require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { pool } = require("../src/config/db");

async function run() {
  const dir = path.join(__dirname, "seeds");

  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dir, file), "utf8");
      console.log(`Running seed: ${file}`);
      await pool.query(sql);
    }

    console.log("Seed data complete");
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
