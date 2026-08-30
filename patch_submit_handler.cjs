const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const oldHandle = code.substring(code.indexOf('const handleRegistrationSubmit = async () => {'), code.indexOf('const handleLogout = () => {'));

const newHandle = `const handleRegistrationSubmit = async () => {
    // 1. Validate application state
    if (!regData.firstName || !regData.phone) {
      alert("Please complete the Personal section before submitting.");
      setRegStep('personal');
      return;
    }
    if (!regData.categories || regData.categories.length === 0) {
      alert("Please select at least one category in the Expertise section.");
      setRegStep('expertise');
      return;
    }
    if (!regData.city || !regData.pincode) {
      alert("Please provide complete location details.");
      setRegStep('location');
      return;
    }
    
    const isUpdating = !!currentUser;
    if (!isUpdating && !profilePhoto) {
      alert("Profile photo is mandatory for new registrations.");
      return;
    }
    if (!isUpdating && regData.aadharNumber.length < 12 && !aadhaarPhoto) {
      alert("Please provide your Aadhaar Number or upload a photo.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isUpdating) {
        let updatedDocs = currentUser.id_proof_url;
        if (profilePhoto || businessPhotos.length > 0 || aadhaarPhoto) {
           // 2. Upload files
           updatedDocs = await uploadVerificationFiles(currentUser.id);
        }
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
          id_proof_url: updatedDocs
        };
        // 3. Upsert database
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
        
        let partnerId = authDataRes.user?.id;
        
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
        
        partnerId = partnerId || "P" + Date.now();
        
        // 2. Upload files
        const docsJson = await uploadVerificationFiles(partnerId);
        
        const newPartner: Partner = {
          id: partnerId,
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
          id_proof_url: docsJson,
          status: 'pending',
          earnings: 0,
          completedJobs: 0,
          lat: regData.lat,
          lng: regData.lng,
          pincode: regData.pincode
        };
        // 3. Upsert database
        const createdPartner = await addPartner(newPartner);
        setCurrentUser(createdPartner);
        localStorage.setItem('partnerPhone', createdPartner.phone || '');
        setIsPendingSignup(false);
      }
      setRegStep('success');
    } catch (err: any) {
      alert(err.message || "Failed to submit application. Ensure storage buckets exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  `;

code = code.replace(oldHandle, newHandle);
fs.writeFileSync('pages/PartnerPanel.tsx', code);
console.log("handleRegistrationSubmit patched.");
