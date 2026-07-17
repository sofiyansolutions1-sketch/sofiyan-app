const fs = require('fs');
const content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf-8');

let newContent = content;

// 1. Add isPendingSignup state
const stateMatch = "const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);";
if (newContent.includes(stateMatch)) {
    newContent = newContent.replace(
        stateMatch,
        stateMatch + "\n  const [isPendingSignup, setIsPendingSignup] = useState(false);"
    );
}

// 2. Modify handleSignup
const handleSignupMatch = `  const handleSignup = async () => {
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

const handleSignupNew = `  const handleSignup = async () => {
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

if (newContent.includes(handleSignupMatch)) {
    newContent = newContent.replace(handleSignupMatch, handleSignupNew);
} else {
    console.error("handleSignupMatch not found!");
}

// 3. Modify handleRegistrationSubmit
const handleRegSubmitMatch = `  const handleRegistrationSubmit = async () => {
    const isUpdating = !!currentUser;
    const partnerId = isUpdating ? currentUser.id : "P" + Date.now();
    const newPartner = {
      ...(isUpdating ? currentUser : {}),
      id: partnerId,
      name: regData.firstName + " " + regData.lastName,
      first_name: regData.firstName,
      last_name: regData.lastName,
      email: currentUser?.email || regData.phone + "@example.com",
      phone: regData.phone,
      city: regData.city,
      alt_phone: regData.altPhone,
      password: regData.password,
      gender: regData.gender,
      age: parseInt(regData.age) || 0,
      experience: regData.experience,
      categories: regData.categories,
      sub_categories: regData.subCategories,
      service_pincodes: regData.service_pincodes,
      aadhar_number: regData.aadharNumber,
      status: 'pending' as const,
      earnings: isUpdating ? currentUser.earnings : 0,
      completedJobs: isUpdating ? currentUser.completedJobs : 0
    };
    try {
      if (isUpdating) {
         await updatePartner(newPartner);
         setCurrentUser(newPartner);
      } else {
         const createdPartner = await addPartner(newPartner);
         setCurrentUser(createdPartner);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    }
    
  };`;

const handleRegSubmitNew = `  const handleRegistrationSubmit = async () => {
    const isUpdating = !!currentUser;
    
    try {
      if (isUpdating) {
        const newPartner = {
          ...currentUser,
          name: regData.firstName + " " + regData.lastName,
          first_name: regData.firstName,
          last_name: regData.lastName,
          phone: regData.phone,
          city: regData.city,
          alt_phone: regData.altPhone,
          password: regData.password,
          gender: regData.gender,
          age: parseInt(regData.age) || 0,
          experience: regData.experience,
          categories: regData.categories,
          sub_categories: regData.subCategories,
          service_pincodes: regData.service_pincodes,
          aadhar_number: regData.aadharNumber,
        };
        await updatePartner(newPartner);
        setCurrentUser(newPartner);
      } else if (isPendingSignup) {
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
      }
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    }
  };`;

if (newContent.includes(handleRegSubmitMatch)) {
    newContent = newContent.replace(handleRegSubmitMatch, handleRegSubmitNew);
} else {
    console.error("handleRegSubmitMatch not found!");
}

// 4. Modify modal logic
const logicMatch = `  const isProfileIncomplete = currentUser && (!currentUser.aadhar_number || !currentUser.categories?.length || !currentUser.city);

  if (!currentUser) {
    return (
      <>
        {renderAuth()}
      </>
    );
  }

  if (isProfileIncomplete || isRegistrationOpen) {
    return renderRegistrationModal(isProfileIncomplete);
  }`;

const logicNew = `  const isProfileIncomplete = currentUser && (!currentUser.aadhar_number || !currentUser.categories?.length || !currentUser.city);

  if (!currentUser && !isPendingSignup) {
    return (
      <>
        {renderAuth()}
      </>
    );
  }

  if (isProfileIncomplete || isRegistrationOpen || isPendingSignup) {
    return renderRegistrationModal(!!isProfileIncomplete || isPendingSignup);
  }`;

if (newContent.includes(logicMatch)) {
    newContent = newContent.replace(logicMatch, logicNew);
} else {
    console.error("logicMatch not found!");
}

// 5. Modify the logout button in modal
const logoutMatch = `<button onClick={() => { setCurrentUser(null); localStorage.removeItem('partnerPhone'); }} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-sm text-red-500 hover:text-red-700 font-bold">Logout</button>`;
const logoutNew = `<button onClick={() => { setCurrentUser(null); setIsPendingSignup(false); localStorage.removeItem('partnerPhone'); }} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-sm text-red-500 hover:text-red-700 font-bold">Cancel</button>`;
if (newContent.includes(logoutMatch)) {
    newContent = newContent.replace(logoutMatch, logoutNew);
} else {
    console.error("logoutMatch not found!");
}


fs.writeFileSync('pages/PartnerPanel.tsx', newContent);
console.log('Update finished.');
