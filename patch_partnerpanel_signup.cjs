const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// Replace the fallback logic that logs them in during signup
const oldLogic = `           if (authErrorRes.message.includes('already registered')) {
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                  email: email,
                  password: regData.password
              });
              if (signInError) throw new Error("User already registered. Please login instead.");
              partnerId = signInData.user?.id;
           } else {
              throw authErrorRes;
           }`;

const newLogic = `           if (authErrorRes.message.includes('already registered')) {
              throw new Error("This email or phone is already registered. Please go back to the first step and Login instead.");
           } else {
              throw authErrorRes;
           }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('pages/PartnerPanel.tsx', code);
console.log("Patched PartnerPanel signup logic");
