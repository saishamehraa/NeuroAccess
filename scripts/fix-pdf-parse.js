import fs from "fs";
import path from "path";

const src = path.join("scripts/pdf-parse-override/index.js");
const dest = path.join("node_modules/pdf-parse/index.js");

try {
  fs.copyFileSync(src, dest);
  console.log("✅ pdf-parse index.js overridden successfully");
} catch (err) {
  console.error("❌ Failed to override pdf-parse:", err);
}
