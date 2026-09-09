const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// I will insert a useEffect to handle serviceUrl and open the modal accordingly.
const regex = /\/\/ SEO Update logic/;
const newLogic = `// Auto-open Category Modal based on serviceUrl
  useEffect(() => {
    if (formattedService && !selectedService) {
      const targetService = SERVICES.find(s => s.name.toLowerCase() === formattedService.toLowerCase() || s.name.replace(/\\s+/g, '-').toLowerCase() === serviceUrl?.toLowerCase());
      if (targetService) {
        setSelectedService(targetService);
      }
    }
  }, [formattedService, serviceUrl]);

  // SEO Update logic`;

if(content.includes('Auto-open Category Modal')) {
  console.log("Already patched.");
} else {
  content = content.replace(regex, newLogic);
  fs.writeFileSync('pages/CustomerPanel.tsx', content);
  console.log("Auto open patched.");
}
