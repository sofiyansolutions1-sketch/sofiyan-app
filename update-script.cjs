const fs = require('fs');
const content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf-8');
const oldText = `  const handleSignup = async () => {
    if (!authData.phone || !authData.password || !authData.name) {
      setAuthError("Please fill all required fields");
      return;
    }
    const newPartner = {
      id: "P" + Date.now(),
      name: authData.name,
      first_name: authData.name.split(' ')[0],
      last_name: authData.name.split(' ').slice(1).join(' '),
      email: authData.email || authData.phone + "@example.com",
      phone: authData.phone,
      password: authData.password,
      status: 'pending' as const,
      earnings: 0,
      completedJobs: 0
    };
    try {
      const createdPartner = await addPartner(newPartner);
      setCurrentUser(createdPartner);
      localStorage.setItem('partnerPhone', createdPartner.phone || '');
      setAuthError(null);
      setRegData({
        ...regData,
        firstName: createdPartner.first_name || '',
        lastName: createdPartner.last_name || '',
        phone: createdPartner.phone || '',
        password: createdPartner.password || ''
      });
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign up");
    }
  };`;

const newText = `  const handleSignup = async () => {
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

      const newPartner = {
        id: authDataRes.user?.id || "P" + Date.now(),
        name: authData.name,
        first_name: authData.name.split(' ')[0],
        last_name: authData.name.split(' ').slice(1).join(' '),
        email: email,
        phone: authData.phone,
        password: authData.password,
        status: 'pending' as const,
        earnings: 0,
        completedJobs: 0
      };

      const createdPartner = await addPartner(newPartner);
      setCurrentUser(createdPartner);
      localStorage.setItem('partnerPhone', createdPartner.phone || '');
      setAuthError(null);
      setRegData({
        ...regData,
        firstName: createdPartner.first_name || '',
        lastName: createdPartner.last_name || '',
        phone: createdPartner.phone || '',
        password: createdPartner.password || ''
      });
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign up");
    }
  };`;

if(content.includes(oldText)) {
   fs.writeFileSync('pages/PartnerPanel.tsx', content.replace(oldText, newText));
   console.log('Success!');
} else {
   console.log('Not found!');
}
