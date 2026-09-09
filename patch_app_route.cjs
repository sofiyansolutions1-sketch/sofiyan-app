const fs = require('fs');

let content = fs.readFileSync('App.tsx', 'utf8');

if (!content.includes('import { SubServicePage } from \'./pages/SubServicePage\';')) {
  content = content.replace(
    "import { TrackBooking } from './pages/TrackBooking';",
    "import { TrackBooking } from './pages/TrackBooking';\nimport { SubServicePage } from './pages/SubServicePage';"
  );
  
  content = content.replace(
    '<Route path="/:cityUrl/:serviceUrl" element={<CustomerPanel />} />',
    '<Route path="/:cityUrl/:serviceUrl" element={<CustomerPanel />} />\n          <Route path="/:cityUrl/:serviceUrl/:subServiceUrl" element={<SubServicePage />} />'
  );
  
  fs.writeFileSync('App.tsx', content);
  console.log("App.tsx patched");
} else {
  console.log("App.tsx already patched");
}
