const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

if (!content.includes("import { ServicePage } from './pages/ServicePage';")) {
  content = content.replace("import { SubServicePage } from './pages/SubServicePage';", "import { SubServicePage } from './pages/SubServicePage';\nimport { ServicePage } from './pages/ServicePage';");
  content = content.replace('<Route path="/:cityUrl/:serviceUrl" element={<CustomerPanel />} />', '<Route path="/:cityUrl/:serviceUrl" element={<ServicePage />} />');
  fs.writeFileSync('App.tsx', content);
  console.log("App.tsx patched with ServicePage");
} else {
  console.log("ServicePage already in App.tsx");
}
