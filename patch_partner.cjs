const fs = require('fs');
const file = 'pages/PartnerPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states
content = content.replace(
  /const \[currentUser, setCurrentUser\] = useState<Partner \| null>\(null\);/,
  `const [currentUser, setCurrentUser] = useState<Partner | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    pincode: '',
    city: '',
    categories: [] as string[],
    sub_categories: [] as string[],
    service_pincodes: [] as string[]
  });`
);

// 2. Add handleEditProfileSubmit
content = content.replace(
  /const handleLogin = \(\) => {/,
  `const openEditProfile = () => {
    setEditData({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      pincode: currentUser.pincode || '',
      city: currentUser.city || '',
      categories: currentUser.categories || [],
      sub_categories: currentUser.sub_categories || [],
      service_pincodes: currentUser.service_pincodes || []
    });
    setIsEditProfileOpen(true);
  };

  const handleEditProfileSubmit = async () => {
    const updatedPartner = {
      ...currentUser,
      name: editData.name,
      phone: editData.phone,
      pincode: editData.pincode,
      city: editData.city,
      categories: editData.categories,
      sub_categories: editData.sub_categories,
      service_pincodes: editData.service_pincodes
    };
    await updatePartner(updatedPartner);
    setCurrentUser(updatedPartner);
    setIsEditProfileOpen(false);
  };

  const handleLogin = () => {`
);

// 3. Add modal rendering
content = content.replace(
  /const renderPaymentModal = \(\) => {/,
  `const renderEditProfileModal = () => {
    if (!isEditProfileOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
          <button onClick={() => setIsEditProfileOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold">✕</button>
          <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
              <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
              <input type="text" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
              <input type="text" value={editData.city} onChange={e => setEditData({...editData, city: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Primary Pincode</label>
              <input type="text" value={editData.pincode} onChange={e => setEditData({...editData, pincode: e.target.value})} className="w-full border p-2 rounded-lg" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Service Pincodes (Comma separated)</label>
              <input 
                type="text" 
                value={editData.service_pincodes.join(', ')} 
                onChange={e => setEditData({...editData, service_pincodes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                className="w-full border p-2 rounded-lg" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Categories (Comma separated)</label>
              <input 
                type="text" 
                value={editData.categories.join(', ')} 
                onChange={e => setEditData({...editData, categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                className="w-full border p-2 rounded-lg" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Sub Categories (Comma separated)</label>
              <input 
                type="text" 
                value={editData.sub_categories.join(', ')} 
                onChange={e => setEditData({...editData, sub_categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                className="w-full border p-2 rounded-lg" 
              />
            </div>

            <button onClick={handleEditProfileSubmit} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">Save Changes</button>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentModal = () => {`
);

// 4. Update the "newLeads" matching logic
content = content.replace(
  /if \(\!partnerPins\.includes\(b\.pinCode\)\) return false;/,
  `const hasPincodeMatch = b.pinCode === currentUser.pincode || partnerPins.includes(b.pinCode);
    if (!hasPincodeMatch) return false;`
);

// 5. Add "Edit Profile" button to the UI and renderEditProfileModal()
content = content.replace(
  /<button onClick=\{\(\) => setCurrentUser\(null\)\} className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 px-4 py-2\.5 sm:py-2 bg-gray-50 sm:bg-transparent rounded-xl hover:bg-red-50 transition-colors font-bold">/,
  `{renderEditProfileModal()}
        <button onClick={openEditProfile} className="w-full sm:w-auto flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 px-4 py-2.5 sm:py-2 bg-indigo-50 sm:bg-transparent rounded-xl hover:bg-indigo-100 transition-colors font-bold">
          <UserIcon size={20} /> Edit Profile
        </button>
        <button onClick={() => setCurrentUser(null)} className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 px-4 py-2.5 sm:py-2 bg-gray-50 sm:bg-transparent rounded-xl hover:bg-red-50 transition-colors font-bold">`
);

fs.writeFileSync(file, content);
console.log("Patched PartnerPanel.tsx");
