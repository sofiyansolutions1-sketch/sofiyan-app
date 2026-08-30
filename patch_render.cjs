const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const target = `  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 mt-2 md:mt-6 pb-24">
      {renderPaymentModal()}
      {renderOtpModal()}
      {renderEditProfileModal()}
      {renderRegistrationModal()}
      {renderAuth()}`;

const replacement = `  const renderCameraModal = () => {
    if (!isCameraOpen) return null;
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col animate-in fade-in duration-300">
        <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="absolute min-w-full min-h-full object-cover"></video>
          {/* Overlay Guide */}
          <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
          <div className="absolute top-10 w-full text-center pointer-events-none drop-shadow-md">
            <p className="text-white font-bold text-lg">Position your face in the frame</p>
          </div>
        </div>
        <div className="h-32 bg-black flex items-center justify-between px-8 sm:px-16 pb-4">
          <button onClick={stopCamera} className="text-white font-bold px-4 py-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors text-sm">
            Cancel
          </button>
          <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-4 border-indigo-200 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] relative">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-100 flex items-center justify-center">
               <Camera className="text-indigo-600" size={24} />
            </div>
          </button>
          <div className="w-[84px]"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 mt-2 md:mt-6 pb-24">
      {renderCameraModal()}
      {renderPaymentModal()}
      {renderOtpModal()}
      {renderEditProfileModal()}
      {renderRegistrationModal()}
      {renderAuth()}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('pages/PartnerPanel.tsx', code);
  console.log("Render camera modal patched.");
} else {
  console.log("Could not find render target.");
}
