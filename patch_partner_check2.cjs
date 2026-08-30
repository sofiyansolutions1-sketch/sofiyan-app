const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const oldCheck = `           if (authErrorRes.message.includes('already registered')) {
              throw new Error("This email or phone is already registered. Please go back to the first step and Login instead.");
           }`;
           
const newCheck = `           if (authErrorRes?.message?.includes('already registered')) {
              alert("An account with this email or phone is already registered. Please login to your existing account.");
              setIsSubmitting(false);
              setIsPendingSignup(false);
              setAuthMode('login');
              return;
           }`;

code = code.replace(oldCheck, newCheck);

fs.writeFileSync('pages/PartnerPanel.tsx', code);
console.log("Patched fallback auth check");
