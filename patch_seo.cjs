const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const oldUseParamsBlock = `  const { cityUrl } = useParams<{ cityUrl?: string }>();
  const activeCity = cityUrl ? cityUrl.charAt(0).toUpperCase() + cityUrl.slice(1).toLowerCase() : currentCity;

  // SEO Update logic
  useEffect(() => {
    if (activeCity) {
      document.title = \`Best Home Services in \${activeCity} | AC, Plumbing, Electrician | Sofiyan\`;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', \`Looking for top-rated home services in \${activeCity}? Sofiyan Home Service offers expert AC repair, plumbing, electrical, and appliance repair in \${activeCity}. Book verified professionals today.\`);`;

const newUseParamsBlock = `  const { cityUrl, serviceUrl } = useParams<{ cityUrl?: string; serviceUrl?: string }>();
  const activeCity = cityUrl ? cityUrl.charAt(0).toUpperCase() + cityUrl.slice(1).toLowerCase() : currentCity;

  // Format service string properly, e.g. "ac-repair" -> "AC Repair", "plumbing" -> "Plumbing"
  const formattedService = serviceUrl 
    ? serviceUrl.split('-').map(word => word.toUpperCase() === 'AC' || word.toUpperCase() === 'RO' || word.toUpperCase() === 'TV' 
      ? word.toUpperCase() 
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
    : null;

  // SEO Update logic
  useEffect(() => {
    if (activeCity) {
      if (formattedService) {
        document.title = \`\${formattedService} in \${activeCity} | Book Expert \${formattedService} | Sofiyan\`;
      } else {
        document.title = \`Best Home Services in \${activeCity} | AC, Plumbing, Electrician | Sofiyan\`;
      }
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      
      if (formattedService) {
        metaDesc.setAttribute('content', \`Looking for top-rated \${formattedService.toLowerCase()} in \${activeCity}? Sofiyan offers expert \${formattedService.toLowerCase()} professionals at your doorstep in \${activeCity}. Book verified experts today.\`);
      } else {
        metaDesc.setAttribute('content', \`Looking for top-rated home services in \${activeCity}? Sofiyan Home Service offers expert AC repair, plumbing, electrical, and appliance repair in \${activeCity}. Book verified professionals today.\`);
      }`;

content = content.replace(oldUseParamsBlock, newUseParamsBlock);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("SEO logic patched");
