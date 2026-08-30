const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const oldCode = `        const newPartner: Partner = {
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
          status: 'pending',
          earnings: 0,
          completedJobs: 0,
          lat: regData.lat,
          lng: regData.lng,
          pincode: regData.pincode
        };
        const createdPartner = await addPartner(newPartner);
        setCurrentUser(createdPartner);
        localStorage.setItem('partnerPhone', createdPartner.phone || '');
        setIsPendingSignup(false);
      }
    } catch {
      alert(err.message || "Failed to update profile");
    }
  };`;

const newCode = `        const partnerId = authDataRes.user?.id || "P" + Date.now();
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
        const createdPartner = await addPartner(newPartner);
        setCurrentUser(createdPartner);
        localStorage.setItem('partnerPhone', createdPartner.phone || '');
        setIsPendingSignup(false);
      }
      setRegStep('success');
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  
  // also add upload calls for updating partner
  const oldUpdate = `        const newPartner = {
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
        };`;
  
  const newUpdate = `        let updatedDocs = currentUser.id_proof_url;
        if (profilePhoto || businessPhotos.length > 0 || aadhaarPhoto) {
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
        };`;

  code = code.replace(oldUpdate, newUpdate);
  fs.writeFileSync('pages/PartnerPanel.tsx', code);
  console.log("handleRegistrationSubmit patched!");
} else {
  console.log("Could not find oldCode.");
}
