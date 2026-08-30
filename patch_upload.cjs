const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const oldUpload = `  const uploadVerificationFiles = async (partnerId: string) => {
    let profileUrl = null;
    const businessUrls: string[] = [];
    let aadhaarUrl = null;

    if (profilePhoto) {
      const path = \`partners/\${partnerId}/profile/\${Date.now()}_profile.jpg\`;
      const { data, error } = await supabase.storage.from('app-files').upload(path, profilePhoto);
      if (error) throw new Error("Failed to upload profile photo: " + error.message);
      if (data) profileUrl = data.path;
    }

    for (let i = 0; i < businessPhotos.length; i++) {
      const file = businessPhotos[i];
      const path = \`partners/\${partnerId}/business/\${Date.now()}_bus_\${i}.\${file.name.split('.').pop()}\`;
      const { data, error } = await supabase.storage.from('app-files').upload(path, file);
      if (error) throw new Error("Failed to upload business photo: " + error.message);
      if (data) businessUrls.push(data.path);
    }

    if (aadhaarPhoto) {
      const path = \`partners/\${partnerId}/aadhaar/\${Date.now()}_aadhaar.\${aadhaarPhoto.name.split('.').pop()}\`;
      const { data, error } = await supabase.storage.from('app-files').upload(path, aadhaarPhoto);
      if (error) throw new Error("Failed to upload Aadhaar photo: " + error.message);
      if (data) aadhaarUrl = data.path;
    }

    return JSON.stringify({
      profilePhoto: profileUrl,
      businessPhotos: businessUrls,
      aadhaarPhoto: aadhaarUrl
    });
  };`;

const newUpload = `  const uploadVerificationFiles = async (partnerId: string) => {
    let profileUrl = null;
    const businessUrls: string[] = [];
    let aadhaarUrl = null;
    let hasUploadErrors = false;

    if (profilePhoto) {
      const path = \`partners/\${partnerId}/profile/\${Date.now()}_profile.jpg\`;
      const { data, error } = await supabase.storage.from('app-files').upload(path, profilePhoto);
      if (error) { console.error(error); hasUploadErrors = true; }
      if (data) profileUrl = data.path;
    }

    for (let i = 0; i < businessPhotos.length; i++) {
      const file = businessPhotos[i];
      const path = \`partners/\${partnerId}/business/\${Date.now()}_bus_\${i}.\${file.name.split('.').pop()}\`;
      const { data, error } = await supabase.storage.from('app-files').upload(path, file);
      if (error) { console.error(error); hasUploadErrors = true; }
      if (data) businessUrls.push(data.path);
    }

    if (aadhaarPhoto) {
      const path = \`partners/\${partnerId}/aadhaar/\${Date.now()}_aadhaar.\${aadhaarPhoto.name.split('.').pop()}\`;
      const { data, error } = await supabase.storage.from('app-files').upload(path, aadhaarPhoto);
      if (error) { console.error(error); hasUploadErrors = true; }
      if (data) aadhaarUrl = data.path;
    }

    if (hasUploadErrors) {
      alert("Note: Some photos failed to upload (ensure 'app-files' bucket exists in Supabase). However, your profile details will still be saved.");
    }

    return JSON.stringify({
      profilePhoto: profileUrl,
      businessPhotos: businessUrls,
      aadhaarPhoto: aadhaarUrl
    });
  };`;

code = code.replace(oldUpload, newUpload);
fs.writeFileSync('pages/PartnerPanel.tsx', code);
console.log("Patched upload function");
