const fs = require('fs');
let content = fs.readFileSync('supabaseClient.ts', 'utf8');
content = content.replace(
    "const SUPABASE_URL = getEnvValue('VITE_SUPABASE_URL') || \"https://bvtqginkszmzzmetdjdm.supabase.co\";",
    "let SUPABASE_URL = getEnvValue('VITE_SUPABASE_URL') || \"https://bvtqginkszmzzmetdjdm.supabase.co\";\nif (SUPABASE_URL.includes('vqbnzcknflwuhbiznuim') || SUPABASE_URL === '') SUPABASE_URL = \"https://bvtqginkszmzzmetdjdm.supabase.co\";"
);
content = content.replace(
    "const SUPABASE_ANON_KEY = getEnvValue('VITE_SUPABASE_ANON_KEY') || \"sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq\";",
    "let SUPABASE_ANON_KEY = getEnvValue('VITE_SUPABASE_ANON_KEY') || \"sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq\";\nif (SUPABASE_ANON_KEY.includes('YKSbWVBxAltMjpIxGhNAIg_Ga8B9xST') || SUPABASE_ANON_KEY === '') SUPABASE_ANON_KEY = \"sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq\";"
);
fs.writeFileSync('supabaseClient.ts', content);
console.log('patched');
