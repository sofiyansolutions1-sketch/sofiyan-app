const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const regex = /if\s*\(authErrorRes\)\s*throw\s*authErrorRes;\s*const\s*partnerId\s*=\s*authDataRes\.user\?\.id\s*\|\|\s*"P"\s*\+\s*Date\.now\(\);/s;

const replacement = `        let partnerId = authDataRes.user?.id;
        
        if (authErrorRes) {
           if (authErrorRes.message.includes('already registered')) {
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                  email: email,
                  password: regData.password
              });
              if (signInError) throw new Error("User already registered. Please login instead.");
              partnerId = signInData.user?.id;
           } else {
              throw authErrorRes;
           }
        }
        
        partnerId = partnerId || "P" + Date.now();`;

code = code.replace(regex, replacement);
fs.writeFileSync('pages/PartnerPanel.tsx', code);
console.log("Patched signup fallback via regex.");
