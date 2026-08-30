const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const oldCode = `  const uploadVerificationFiles = async (partnerId: string) => {
    let profileUrl = null;
    const businessUrls: string[] = [];
    let aadhaarUrl = null;
    try {
      if (profilePhoto) {
        const path = \`partners/\${partnerId}/profile/\${Date.now()}_profile.jpg\`;
        const { data } = await supabase.storage.from('app-files').upload(path, profilePhoto);
        if (data) profileUrl = data.path;
      }
      for (let i = 0; i < businessPhotos.length; i++) {
        const file = businessPhotos[i];
        const path = \`partners/\${partnerId}/business/\${Date.now()}_bus_\${i}.\${file.name.split('.').pop()}\`;
        const { data } = await supabase.storage.from('app-files').upload(path, file);
        if (data) businessUrls.push(data.path);
      }
      if (aadhaarPhoto) {
        const path = \`partners/\${partnerId}/aadhaar/\${Date.now()}_aadhaar.\${aadhaarPhoto.name.split('.').pop()}\`;
        const { data } = await supabase.storage.from('app-files').upload(path, aadhaarPhoto);
        if (data) aadhaarUrl = data.path;
      }
    } catch (e) {
      console.error("Upload error", e);
    }
    return JSON.stringify({
      profilePhoto: profileUrl,
      businessPhotos: businessUrls,
      aadhaarPhoto: aadhaarUrl
    });
  };`;

const newCode = `  const uploadVerificationFiles = async (partnerId: string) => {
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

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('pages/PartnerPanel.tsx', code);
  console.log('uploadVerificationFiles patched successfully.');
} else {
  console.log('Could not find uploadVerificationFiles.');
}
