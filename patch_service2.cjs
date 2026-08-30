const fs = require('fs');
let code = fs.readFileSync('services/pincodeService.ts', 'utf8');

const importStatement = "import { PREDEFINED_PINS } from './predefinedPins';\n";

if (!code.includes('PREDEFINED_PINS')) {
    code = importStatement + code;
}

const fetchProxyRegex = /const controller = new AbortController\(\);[\s\S]*?let data = JSON\.parse\(text\);/g;

const fetchProxyReplacement = `const controller = new AbortController();
            
            const fetchProxy = fetch(\`/api/pincode/postoffice/\${encoded}\`, { signal: controller.signal })
                .then(async res => { 
                    if (!res.ok) throw new Error("Proxy error"); 
                    const t = await res.text();
                    if (t.includes('__cookie_check')) throw new Error("Cookie blocked");
                    return JSON.parse(t);
                });
            const fetchDirect = fetch(\`https://api.postalpincode.in/postoffice/\${encoded}\`, { signal: controller.signal })
                .then(async res => { 
                    if (!res.ok) throw new Error("Direct error"); 
                    return res.json();
                });
                
            try {
                // Whoever finishes first successfully
                const data = await Promise.any([fetchProxy, fetchDirect]);
                controller.abort(); // Cancel the slower one
`;

code = code.replace(fetchProxyRegex, fetchProxyReplacement);

const localCheckRegex = /const matchedLocal = PIN_DICTIONARY\[area\.toLowerCase\(\)\];/g;
const localCheckReplacement = `const matchedLocal = PIN_DICTIONARY[area.toLowerCase()] || PREDEFINED_PINS[area.toLowerCase()];`;

code = code.replace(localCheckRegex, localCheckReplacement);

fs.writeFileSync('services/pincodeService.ts', code);
console.log("Patched successfully.");
