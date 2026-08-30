const fs = require('fs');
let content = fs.readFileSync('services/pincodeService.ts', 'utf8');

const replacement = `
        const fetchFromIndiaPost = async (searchTerm: string) => {
            const encoded = encodeURIComponent(searchTerm);
            console.log("Fetching pincode for:", searchTerm);
            
            // Race the proxy and the direct API call for maximum speed
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            
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
                const data = await Promise.any([fetchProxy, fetchDirect]).finally(() => clearTimeout(timeoutId));
                controller.abort(); // Cancel the slower one
`;

content = content.replace(
  /const fetchFromIndiaPost = async \(searchTerm: string\) => \{\s*const encoded = encodeURIComponent\(searchTerm\);\s*console\.log\("Fetching pincode for:", searchTerm\);\s*\/\/ Race the proxy and the direct API call for maximum speed\s*const controller = new AbortController\(\);\s*const fetchProxy = fetch\(`\/api\/pincode\/postoffice\/\$\{encoded\}`\, \{ signal: controller\.signal \}\)\s*\.then\(async res => \{ \s*if \(\!res\.ok\) throw new Error\("Proxy error"\); \s*const t = await res\.text\(\);\s*if \(t\.includes\('__cookie_check'\)\) throw new Error\("Cookie blocked"\);\s*return JSON\.parse\(t\);\s*\}\);\s*const fetchDirect = fetch\(`https:\/\/api\.postalpincode\.in\/postoffice\/\$\{encoded\}`\, \{ signal: controller\.signal \}\)\s*\.then\(async res => \{ \s*if \(\!res\.ok\) throw new Error\("Direct error"\); \s*return res\.json\(\);\s*\}\);\s*try \{\s*\/\/ Whoever finishes first successfully\s*const data = await Promise\.any\(\[fetchProxy, fetchDirect\]\);\s*controller\.abort\(\); \/\/ Cancel the slower one/,
  replacement
);

fs.writeFileSync('services/pincodeService.ts', content);
