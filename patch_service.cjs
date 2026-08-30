const fs = require('fs');
let code = fs.readFileSync('services/pincodeService.ts', 'utf8');

const regex = /const fetchFromIndiaPost = async \(searchTerm: string\) => \{[\s\S]*?return null;\n        \};/;

const replacement = `const fetchFromIndiaPost = async (searchTerm: string) => {
            const encoded = encodeURIComponent(searchTerm);
            console.log("Fetching pincode for:", searchTerm);
            
            // Race the proxy and the direct API call for maximum speed
            const controller = new AbortController();
            
            const fetchProxy = fetch(\`/api/pincode/postoffice/\${encoded}\`, { signal: controller.signal })
                .then(res => { if (!res.ok) throw new Error("Proxy error"); return res; });
            const fetchDirect = fetch(\`https://api.postalpincode.in/postoffice/\${encoded}\`, { signal: controller.signal })
                .then(res => { if (!res.ok) throw new Error("Direct error"); return res; });
                
            try {
                // Whoever finishes first successfully
                const apiRes = await Promise.any([fetchProxy, fetchDirect]);
                controller.abort(); // Cancel the slower one
                
                const text = await apiRes.text();
                console.log("API Response for", searchTerm, ":", text.substring(0, 100));
                let data = JSON.parse(text);
                
                if (data && data[0] && data[0].Status === 'Success') {
                    const postOffices = data[0].PostOffice;
                    return postOffices.map((po: any) => po.Pincode).filter(Boolean);
                }
            } catch (error) {
               console.error("fetchFromIndiaPost error:", error);
               return null;
            }
            return null;
        };`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('services/pincodeService.ts', code);
    console.log("Patched successfully!");
} else {
    console.log("Could not find regex match!");
}
