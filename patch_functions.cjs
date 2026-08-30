const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const target = `  const toggleAvailability = async () => {`;
const functions = `  const openEditProfile = () => {
    if (currentUser) {
      setEditData(currentUser);
      setIsEditProfileOpen(true);
    }
  };

  const handleEditProfileSubmit = async () => {
    if (currentUser) {
      await updatePartner({ ...currentUser, ...editData });
      setCurrentUser({ ...currentUser, ...editData });
      setIsEditProfileOpen(false);
    }
  };

  const toggleAvailability = async () => {`;

if (code.includes(target)) {
  code = code.replace(target, functions);
  fs.writeFileSync('pages/PartnerPanel.tsx', code);
  console.log("Functions added");
} else {
  console.log("Could not find target");
}
