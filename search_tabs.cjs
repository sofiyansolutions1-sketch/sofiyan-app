const fs = require('fs');
const code = fs.readFileSync('dist/assets/main-DM0deoN5.js', 'utf8');
const index = code.indexOf('Partner Onboarding');
if (index !== -1) {
    const chunk = code.substring(Math.max(0, index - 5000), index);
    const matches = chunk.match(/>[^<]{3,20}</g);
    if(matches) console.log(matches.slice(-40).join('\n'));
}
