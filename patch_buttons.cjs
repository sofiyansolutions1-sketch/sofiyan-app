const fs = require('fs');
const file = 'pages/PartnerPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /{renderEditProfileModal\(\)}\s*<button onClick=\{openEditProfile\} className="w-full sm:w-auto flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 px-4 py-2\.5 sm:py-2 bg-indigo-50 sm:bg-transparent rounded-xl hover:bg-indigo-100 transition-colors font-bold">\s*<UserIcon size=\{20\} \/> Edit Profile\s*<\/button>\s*<button onClick=\{\(\) => setCurrentUser\(null\)\} className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 px-4 py-2\.5 sm:py-2 bg-gray-50 sm:bg-transparent rounded-xl hover:bg-red-50 transition-colors font-bold">\s*<LogOut size=\{20\} \/> Logout\s*<\/button>/,
  `{renderEditProfileModal()}
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <button onClick={openEditProfile} className="w-full sm:w-auto flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 px-4 py-2.5 sm:py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors font-bold shadow-sm">
            <UserIcon size={16} /> Edit Profile
          </button>
          <button onClick={() => setCurrentUser(null)} className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-500 hover:text-red-600 px-4 py-2.5 sm:py-2 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors font-bold shadow-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>`
);

fs.writeFileSync(file, content);
console.log("Patched PartnerPanel.tsx buttons");
