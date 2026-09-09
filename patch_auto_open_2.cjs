const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const regex = /\/\/ Auto-open Category Modal based on serviceUrl[\s\S]*?\}, \[formattedService, serviceUrl\]\);/m;
const newLogic = `// Auto-open Category Modal based on serviceUrl
  useEffect(() => {
    if (formattedService) {
      if (typeof window !== 'undefined' && (window as any).openCategoryView) {
        // Find exact string match based on formatting for vanilla JS logic
        const catMap: Record<string, string> = {
          'ac': 'AC',
          'ac-repair': 'AC',
          'plumbing': 'Plumbing',
          'washing-machine': 'WashingMachine',
          'refrigerator': 'Refrigerator',
          'water-purifier': 'WaterPurifier',
          'ro-repair': 'WaterPurifier',
          'television': 'Television',
          'microwave': 'Microwave',
          'geyser': 'Geyser',
          'chimney': 'Chimney',
          'cleaning': 'Cleaning',
          'electrician': 'Electrician',
          'painting': 'Painting',
          'pest-control': 'PestControl',
          'carpentry': 'Carpentry'
        };
        const mappedCategory = catMap[serviceUrl?.toLowerCase() || ''] || formattedService;
        (window as any).openCategoryView(mappedCategory);
      } else {
        const targetService = SERVICES.find(s => s.name.toLowerCase() === formattedService.toLowerCase() || s.name.replace(/\\s+/g, '-').toLowerCase() === serviceUrl?.toLowerCase());
        if (targetService) {
          setSelectedService(targetService);
        }
      }
    }
  }, [formattedService, serviceUrl]);`;

content = content.replace(regex, newLogic);
fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Auto open patched.");
