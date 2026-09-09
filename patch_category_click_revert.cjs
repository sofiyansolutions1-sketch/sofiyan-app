const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const newFuncStart = `      window.openCategoryView = function (categoryName) {
        const city = localStorage.getItem('preferredCity') || 'Bangalore';
        const serviceSlug = categoryName.toLowerCase().replace(/\\s+/g, '-');
        window.location.href = '/' + city.toLowerCase() + '/' + serviceSlug;
      };
      
      window.oldOpenCategoryView = function (categoryName) {`;

if (content.includes(newFuncStart)) {
  content = content.replace(newFuncStart, `      window.openCategoryView = function (categoryName) {`);
  fs.writeFileSync('index.html', content);
  console.log("index.html reverted to open category modal on click.");
} else {
  console.log("Could not find the patched function in index.html to revert.");
}
