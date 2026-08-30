const fs = require('fs');
let content = fs.readFileSync('services/pincodeService.ts', 'utf8');

const replacement = `
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second max per chunk
            const apiRes = await fetch(\`https://api.postalpincode.in/postoffice/\${encodeURIComponent(area)}\`, { signal: controller.signal })
                .finally(() => clearTimeout(timeoutId));
`;

content = content.replace(
  /try \{\s*const apiRes = await fetch\(`https:\/\/api\.postalpincode\.in\/postoffice\/\$\{encodeURIComponent\(area\)\}`\);/,
  replacement
);

fs.writeFileSync('services/pincodeService.ts', content);
