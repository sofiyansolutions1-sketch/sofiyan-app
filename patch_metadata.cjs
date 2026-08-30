const fs = require('fs');
let meta = JSON.parse(fs.readFileSync('metadata.json', 'utf8'));
if (!meta.requestFramePermissions.includes("camera")) {
  meta.requestFramePermissions.push("camera");
}
fs.writeFileSync('metadata.json', JSON.stringify(meta, null, 2));
console.log("Metadata updated.");
