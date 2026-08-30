const fs = require('fs');
let content = fs.readFileSync('services/pincodeService.ts', 'utf8');

const replacement = `
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const fetchProxy = fetch(\`/api/pincode/code/\${pincode}\`, { signal: controller.signal }).then(async res => {
            if (!res.ok) throw new Error("Proxy error");
            const t = await res.text();
            if (t.includes('__cookie_check')) throw new Error("Cookie blocked");
            return JSON.parse(t);
        });
        
        const fetchDirect = fetch(\`https://api.postalpincode.in/pincode/\${pincode}\`, { signal: controller.signal }).then(async res => {
            if (!res.ok) throw new Error("Direct error");
            return res.json();
        });

        const data = await Promise.any([fetchProxy, fetchDirect]).finally(() => clearTimeout(timeoutId));
        controller.abort();

        if (data && data[0] && data[0].Status === 'Success') {
            const postOffices = data[0].PostOffice || [];
            
            // Collect the names of matching local areas
            const areas = postOffices.map((po: any) => po.Name);
            
            // Determine if these belong to Bangalore City mapping
            // Note: the APIs sometimes use 'Bangalore', 'Bengaluru', 'Bengaluru Rural', etc. 
            const isBangalore = postOffices.some((po: any) => 
                (po.District && po.District.toLowerCase().includes('bangalore')) ||
                (po.District && po.District.toLowerCase().includes('bengaluru')) ||
                (po.Region && po.Region.toLowerCase().includes('bangalore')) ||
                (po.Division && po.Division.toLowerCase().includes('bangalore'))
            );
            return { success: true, areas, isBangalore };
        } else {
            return { success: false, areas: [], isBangalore: false, error: 'Pincode not found' };
        }
    } catch (error) {
`;

content = content.replace(
  /try \{\s*\/\/ Try proxy path first to bypass CORS[\s\S]*?\} else \{\s*return \{ success: false, areas: \[\], isBangalore: false, error: 'Pincode not found' \};\s*\}\s*\} catch \(error\) \{/,
  replacement
);

fs.writeFileSync('services/pincodeService.ts', content);
