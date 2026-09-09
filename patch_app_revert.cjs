const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

if (content.includes("import { ServicePage } from './pages/ServicePage';")) {
  content = content.replace("import { ServicePage } from './pages/ServicePage';", "");
  content = content.replace('<Route path="/:cityUrl/:serviceUrl" element={<ServicePage />} />', '<Route path="/:cityUrl/:serviceUrl" element={<CustomerPanel />} />');
  fs.writeFileSync('App.tsx', content);
  console.log("App.tsx reverted back to using CustomerPanel for category URLs.");
} else {
  console.log("ServicePage not found in App.tsx imports.");
}
