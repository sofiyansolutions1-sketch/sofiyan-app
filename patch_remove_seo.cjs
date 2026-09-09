const fs = require('fs');

function removeSEO(file, startMarker, endMarker) {
  let content = fs.readFileSync(file, 'utf8');
  let startIndex = content.indexOf(startMarker);
  
  if (startIndex !== -1) {
    let endIndex = content.indexOf(endMarker, startIndex);
    if (endIndex !== -1) {
      let before = content.substring(0, startIndex);
      let after = content.substring(endIndex + endMarker.length);
      
      // Look for the end of the useEffect block
      let braceIndex = content.indexOf('}, [', endIndex);
      if (braceIndex !== -1) {
         let lineEnd = content.indexOf(');', braceIndex);
         if (lineEnd !== -1) {
             content = content.substring(0, startIndex) + content.substring(lineEnd + 2);
             fs.writeFileSync(file, content);
             console.log(`Removed SEO logic from ${file}`);
         }
      }
    }
  } else {
    console.log(`No SEO logic found to remove in ${file}`);
  }
}

// ServicePage
removeSEO('pages/ServicePage.tsx', '// SEO', 'linkCanonical.setAttribute');
removeSEO('pages/SubServicePage.tsx', '// SEO', 'linkCanonical.setAttribute');
removeSEO('pages/CustomerPanel.tsx', '// SEO Update logic', 'linkCanonical.setAttribute');

