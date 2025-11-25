import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Target the real file that contains the crashing debug code
  const filePath = path.join(
    __dirname,
    "..",
    "node_modules",
    "pdf-parse",
    "index.js"
  );

  let content = fs.readFileSync(filePath, "utf8");

  // Remove the entire debug/testing block
  content = content.replace(/let isDebugMode[\s\S]*?\*\//, "");

  fs.writeFileSync(filePath, content, "utf8");

  console.log("✅ Successfully removed pdf-parse debug block.");
} catch (err) {
  console.error("❌ Failed to patch pdf-parse:", err.message);
}
