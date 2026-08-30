const fs = require('fs');
let code = fs.readFileSync('hooks/useStore.ts', 'utf8');

code = code.replace(
  /const result = await supabase\.from\('primary_partners'\)\.insert\(dbPartner\)\.select\(\)\.single\(\);/g,
  "const result = await supabase.from('primary_partners').upsert(dbPartner, { onConflict: 'email' }).select().single();"
);

fs.writeFileSync('hooks/useStore.ts', code);
console.log("hooks/useStore.ts patched to upsert");
