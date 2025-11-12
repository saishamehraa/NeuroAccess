import fs from "fs";
const file = "node_modules/pdf-parse/package.json";
const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
if (pkg.exports?.["."]?.default === "./index.js") {
  pkg.exports["."].default = "./lib/pdf-parse.js";
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2));
  console.log("✅ Patched pdf-parse default export to use lib/pdf-parse.js");
}
