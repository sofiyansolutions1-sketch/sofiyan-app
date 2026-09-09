const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/window\.masterServicesData\s*=\s*(\{.*?\});/s);
if (match) {
  const masterData = eval('(' + match[1] + ')');
  const acData = masterData['AC'];
  const allSubServices = [];
  Object.keys(acData).forEach(subcat => {
      acData[subcat].forEach(s => {
          allSubServices.push({
              name: s.name,
          });
      });
  });

  const getUrlSlug = (subServiceName) => {
      return subServiceName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const getFindSlug = (name) => {
      return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  allSubServices.forEach(s => {
      const generatedUrl = getUrlSlug(s.name);
      
      const slug1 = s.name.replace(/\s+/g, '-').toLowerCase();
      const slug2 = s.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      const slug3 = s.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const matched = slug1 === generatedUrl || slug2 === generatedUrl || slug3 === generatedUrl;
      console.log(`${s.name} -> ${generatedUrl} -> ${matched}`);
      if (!matched) {
          console.error(`FAILED FOR: ${s.name}`);
      }
  });

} else {
  console.log("Not found");
}

