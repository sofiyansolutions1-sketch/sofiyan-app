const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// Patch handleSignup to check early
const oldHandleSignup = `  const handleSignup = async () => {
    if (!authData.phone || !authData.password || !authData.name || !authData.email) {
      setAuthError("Please fill all required fields");
      return;
    }
    
    setRegData(prev => ({`;

const newHandleSignup = `  const handleSignup = async () => {
    if (!authData.phone || !authData.password || !authData.name || !authData.email) {
      setAuthError("Please fill all required fields");
      return;
    }

    // Check if partner already exists early
    const { data: existingPartners } = await supabase
      .from('primary_partners')
      .select('id')
      .or(\`email.eq.\${authData.email},phone.eq.\${authData.phone}\`);

    if (existingPartners && existingPartners.length > 0) {
      setAuthError("Account already exists. Please login instead.");
      setAuthMode('login');
      return;
    }
    
    setRegData(prev => ({`;

code = code.replace(oldHandleSignup, newHandleSignup);

// Patch handleRegistrationSubmit to check before inserting
const oldHandleRegistrationSubmit = `      } else if (isPendingSignup) {
        const email = authData.email || regData.phone + "@example.com";
        const { data: authDataRes, error: authErrorRes } = await supabase.auth.signUp({`;

const newHandleRegistrationSubmit = `      } else if (isPendingSignup) {
        const email = authData.email || regData.phone + "@example.com";

        // Implement a check during the submission process that queries the 'partners' table by email or phone number
        const { data: existingPartners } = await supabase
          .from('primary_partners')
          .select('id')
          .or(\`email.eq.\${email},phone.eq.\${regData.phone}\`);

        if (existingPartners && existingPartners.length > 0) {
           alert("An account with this email or phone is already registered. Please login to your existing account.");
           setIsSubmitting(false);
           setIsPendingSignup(false);
           setAuthMode('login');
           return;
        }

        const { data: authDataRes, error: authErrorRes } = await supabase.auth.signUp({`;

code = code.replace(oldHandleRegistrationSubmit, newHandleRegistrationSubmit);

fs.writeFileSync('pages/PartnerPanel.tsx', code);
console.log("Patched partner check logic");
