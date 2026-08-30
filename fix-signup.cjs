const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf-8');

const oldHandleSignup = `  const handleSignup = async () => {
    if (!authData.phone || !authData.password || !authData.name) {
      setAuthError("Please fill all required fields");
      return;
    }
    
    setRegData(prev => ({
        ...prev,
        firstName: authData.name.split(' ')[0] || '',
        lastName: authData.name.split(' ').slice(1).join(' ') || '',
        phone: authData.phone,
        password: authData.password
    }));

    setIsPendingSignup(true);
    setAuthError(null);
  };`;

const newHandleSignup = `  const handleSignup = async () => {
    if (!authData.phone || !authData.password || !authData.name) {
      setAuthError("Please fill all required fields");
      return;
    }
    
    const email = authData.email || authData.phone + "@example.com";
    
    try {
      const { data: authDataRes, error: authErrorRes } = await supabase.auth.signUp({
          email: email,
          password: authData.password,
          options: {
            data: {
              name: authData.name,
              phone: authData.phone,
              role: 'partner'
            }
          }
      });

      if (authErrorRes) throw authErrorRes;
      
      // Keep the user metadata but don't insert to DB yet
      setRegData(prev => ({
          ...prev,
          firstName: authData.name.split(' ')[0] || '',
          lastName: authData.name.split(' ').slice(1).join(' ') || '',
          phone: authData.phone,
          password: authData.password
      }));

      setIsPendingSignup(true);
      setAuthError(null);
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign up. Please try again.");
    }
  };`;

const oldHandleRegistrationSubmit = `      } else if (isPendingSignup) {
        const email = authData.email || regData.phone + "@example.com";
        const { data: authDataRes, error: authErrorRes } = await supabase.auth.signUp({
            email: email,
            password: regData.password,
            options: {
              data: {
                name: regData.firstName + " " + regData.lastName,
                phone: regData.phone,
                role: 'partner'
              }
            }
        });

        if (authErrorRes) throw authErrorRes;

        const newPartner = {
          id: authDataRes.user?.id || "P" + Date.now(),
          name: regData.firstName + " " + regData.lastName,
          first_name: regData.firstName,
          last_name: regData.lastName,
          email: email,
          phone: regData.phone,
          password: regData.password,
          city: regData.city,
          alt_phone: regData.altPhone,
          gender: regData.gender,
          age: parseInt(regData.age) || 0,
          experience: regData.experience,
          categories: regData.categories,
          sub_categories: regData.subCategories,
          service_pincodes: regData.service_pincodes,
          aadhar_number: regData.aadharNumber,
          status: 'pending' as const,
          earnings: 0,
          completedJobs: 0
        };
        
        const createdPartner = await addPartner(newPartner);
        setCurrentUser(createdPartner);
        localStorage.setItem('partnerPhone', createdPartner.phone || '');
        setIsPendingSignup(false);
      }`;

const newHandleRegistrationSubmit = `      } else if (isPendingSignup) {
        const email = authData.email || regData.phone + "@example.com";
        
        // We already created the auth user in handleSignup. Now just fetch the user to get ID, or fallback
        const { data: sessionData } = await supabase.auth.getSession();
        let userId = "P" + Date.now();
        if (sessionData?.session?.user) {
          userId = sessionData.session.user.id;
        } else {
            // Retrieve current user ID if possible, otherwise rely on backend fallback
            const { data: userRes } = await supabase.auth.getUser();
            if (userRes?.user) {
                userId = userRes.user.id;
            }
        }

        const newPartner = {
          id: userId,
          name: regData.firstName + " " + regData.lastName,
          first_name: regData.firstName,
          last_name: regData.lastName,
          email: email,
          phone: regData.phone,
          password: regData.password,
          city: regData.city,
          alt_phone: regData.altPhone,
          gender: regData.gender,
          age: parseInt(regData.age) || 0,
          experience: regData.experience,
          categories: regData.categories,
          sub_categories: regData.subCategories,
          service_pincodes: regData.service_pincodes,
          aadhar_number: regData.aadharNumber,
          status: 'pending' as const,
          earnings: 0,
          completedJobs: 0
        };
        
        const createdPartner = await addPartner(newPartner);
        setCurrentUser(createdPartner);
        localStorage.setItem('partnerPhone', createdPartner.phone || '');
        setIsPendingSignup(false);
      }`;

if (content.includes(oldHandleSignup)) {
    content = content.replace(oldHandleSignup, newHandleSignup);
} else {
    console.log("Could not find oldHandleSignup");
}

if (content.includes(oldHandleRegistrationSubmit)) {
    content = content.replace(oldHandleRegistrationSubmit, newHandleRegistrationSubmit);
} else {
    console.log("Could not find oldHandleRegistrationSubmit");
}

fs.writeFileSync('pages/PartnerPanel.tsx', content);
console.log('Update complete');
