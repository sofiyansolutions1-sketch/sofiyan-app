const fs = require('fs');
let code = fs.readFileSync('supabaseClient.ts', 'utf8');

code = code.replace(/let SUPABASE_URL = .*/g, `let SUPABASE_URL = getEnvValue('VITE_SUPABASE_URL') || "https://bvtqginkszmzzmetdjdm.supabase.co";
try {
  new URL(SUPABASE_URL);
} catch (e) {
  console.error("Invalid VITE_SUPABASE_URL:", SUPABASE_URL, "Falling back to default.");
  SUPABASE_URL = "https://bvtqginkszmzzmetdjdm.supabase.co";
}
if (!SUPABASE_URL.startsWith('http')) {
  SUPABASE_URL = 'https://' + SUPABASE_URL;
}
`);

fs.writeFileSync('supabaseClient.ts', code);
console.log("Patched supabaseClient.ts");
