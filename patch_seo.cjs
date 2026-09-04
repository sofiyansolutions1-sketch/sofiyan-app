const fs = require('fs');
const content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const injectionCode = `
  const { cityUrl } = useParams<{ cityUrl?: string }>();
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
      metaDesc.setAttribute('content', \`Looking for top-rated home services in \${activeCity}? Sofiyan Home Service offers expert AC repair, plumbing, electrical, and appliance repair in \${activeCity}. Book verified professionals today.\`);
      
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', \`https://www.sofiyanhomeservice.com/\${activeCity.toLowerCase()}\`);
    }
  }, [activeCity]);
`;

// Insert after the currentCity useEffect
const marker = "  }, []);\n";
const index = content.indexOf(marker);
if (index !== -1) {
  const insertIndex = index + marker.length;
  const newContent = content.slice(0, insertIndex) + injectionCode + content.slice(insertIndex);
  fs.writeFileSync('pages/CustomerPanel.tsx', newContent);
  console.log("SEO patch applied");
} else {
  console.log("Marker not found");
}
