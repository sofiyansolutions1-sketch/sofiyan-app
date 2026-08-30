const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const oldProcessCompletion = `  const processCompletion = async () => {
    if (!jobToComplete) return;
    await updateBooking({ ...jobToComplete, status: 'completed', commissionPaid: true });
    await updatePartner({
      ...currentUser,
      completedJobs: (currentUser?.completedJobs || 0) + 1,
      earnings: (currentUser?.earnings || 0) + jobToComplete.price
    } as Partner);
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        completedJobs: (currentUser.completedJobs || 0) + 1,
        earnings: (currentUser.earnings || 0) + jobToComplete.price
      } as Partner);
    }
    setJobToComplete(null);
  };`;

const newProcessCompletion = `  const processCompletion = async () => {
    if (!jobToComplete || !currentUser) return;
    
    let filePath = '';
    if (uploadedFile) {
      const fileExt = uploadedFile.name.split('.').pop() || 'jpg';
      // Fallback for crypto.randomUUID not being available in some HTTP environments (like some iframes)
      const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
      const path = \`\${currentUser.id}/commission_screenshot/\${jobToComplete.id}/\${uuid}.\${fileExt}\`;
      const { data, error } = await supabase.storage.from('app-files').upload(path, uploadedFile);
      if (data) {
        filePath = data.path;
      } else {
        console.error("Storage upload error:", error);
      }
    }

    const updatedBooking = { 
      ...jobToComplete, 
      status: 'completed' as const, 
      commissionPaid: true
    };
    if (filePath) {
      updatedBooking.commission_screenshot = filePath;
    }

    await updateBooking(updatedBooking);
    
    const nextCompletedJobs = (currentUser.completedJobs || 0) + 1;
    const nextEarnings = (currentUser.earnings || 0) + jobToComplete.price;
    
    await updatePartner({
      ...currentUser,
      completedJobs: nextCompletedJobs,
      earnings: nextEarnings
    } as Partner);
    
    setCurrentUser({
      ...currentUser,
      completedJobs: nextCompletedJobs,
      earnings: nextEarnings
    } as Partner);

    setJobToComplete(null);
    setUploadedFile(null);
    setUploadedImage(null);
  };`;

if (code.includes(oldProcessCompletion)) {
  code = code.replace(oldProcessCompletion, newProcessCompletion);
  console.log("processCompletion updated");
} else {
  console.log("Could not find processCompletion block");
}

const oldCompletedLeads = `            {partnerBookings.filter(b => b.status === 'completed').map(b => (
              <div key={b.id} className="border border-green-200 bg-green-50/30 p-3 rounded-xl text-xs">
                <p className="font-bold text-gray-900">{b.subServiceName}</p>
                <p className="text-gray-500 mt-1">{b.date} • {b.time}</p>
                <p className="font-bold text-green-700 mt-1">₹{b.price}</p>
              </div>
            ))}
          </div>`;

const newCompletedLeads = `            {partnerBookings.filter(b => b.status === 'completed').map(b => (
              <div key={b.id} className="border border-green-200 bg-green-50/30 p-3 rounded-xl text-xs">
                <p className="font-bold text-gray-900">{b.subServiceName}</p>
                <p className="text-gray-500 mt-1">{b.date} • {b.time}</p>
                <p className="font-bold text-green-700 mt-1">₹{b.price}</p>
                {b.commission_screenshot && (
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={async () => {
                        const { data } = await supabase.storage.from('app-files').createSignedUrl(b.commission_screenshot, 60 * 60);
                        if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                      }}
                      className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold hover:bg-indigo-100 transition-colors"
                    >
                      View Proof
                    </button>
                    <button 
                      onClick={async () => {
                        if (!confirm("Delete this payment screenshot?")) return;
                        await supabase.storage.from('app-files').remove([b.commission_screenshot]);
                        updateBooking({ ...b, commission_screenshot: '' });
                      }}
                      className="bg-red-50 text-red-600 px-2 py-1 rounded font-bold hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>`;

if (code.includes(oldCompletedLeads)) {
  code = code.replace(oldCompletedLeads, newCompletedLeads);
  console.log("completed leads UI updated");
} else {
  console.log("Could not find completed leads block");
}

fs.writeFileSync('pages/PartnerPanel.tsx', code);
