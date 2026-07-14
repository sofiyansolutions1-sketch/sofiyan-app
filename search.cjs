const fs = require('fs');
const code = fs.readFileSync('dist/assets/main-DM0deoN5.js', 'utf8');
const index = code.indexOf('Partner Onboarding');
if (index !== -1) {
    console.log(code.substring(index - 1000, index + 2000));
}
