const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The original openCategoryView logic
const oldFuncStart = `      window.openCategoryView = function (categoryName) {`;

const newFunc = `      window.openCategoryView = function (categoryName) {
        const city = localStorage.getItem('preferredCity') || 'Bangalore';
        const serviceSlug = categoryName.toLowerCase().replace(/\\s+/g, '-');
        window.location.href = '/' + city.toLowerCase() + '/' + serviceSlug;
      };
      
      window.oldOpenCategoryView = function (categoryName) {`;

if (content.includes(oldFuncStart) && !content.includes("window.oldOpenCategoryView")) {
  content = content.replace(oldFuncStart, newFunc);
  fs.writeFileSync('index.html', content);
  console.log("index.html patched to navigate on category click");
} else {
  console.log("Already patched or not found.");
}
