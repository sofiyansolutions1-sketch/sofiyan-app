const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

if (!content.includes('import { SEOManager }')) {
  content = content.replace("import { Layout }", "import { SEOManager } from './components/SEOManager';\nimport { Layout }");
  content = content.replace("<AppContent />", "<SEOManager />\n      <AppContent />");
  fs.writeFileSync('App.tsx', content);
  console.log("App.tsx patched with SEOManager");
} else {
  console.log("SEOManager already in App.tsx");
}
