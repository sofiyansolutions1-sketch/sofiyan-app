const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const verifyFunc = `
  const handleVerifyOtp = async () => {
    if (!otpBookingId) return;
    const b = partnerBookings.find(b => b.id === otpBookingId);
    if (!b) return;

    if (b.otp && b.otp !== otpInput) {
      setOtpError('Invalid OTP. Please ask the customer for the correct 4-digit PIN.');
      return;
    }

    // OTP matched or no OTP required
    await updateBooking({
      ...b,
      status: 'in_progress'
    });
    setOtpBookingId(null);
    setOtpInput('');
    setOtpError('');
  };

  const renderOtpModal = () => {
    if (!otpBookingId) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl animate-slideUp relative">
          <button onClick={() => { setOtpBookingId(null); setOtpInput(''); setOtpError(''); }} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
             <X size={20} />
          </button>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Start Service</h3>
          <p className="text-sm text-gray-500 mb-6">Ask the customer for the 4-digit OTP to start the job.</p>
          <input
            type="text"
            maxLength={4}
            value={otpInput}
            onChange={e => { setOtpInput(e.target.value.replace(/\\D/g, '')); setOtpError(''); }}
            className="w-full text-center text-3xl font-black tracking-[0.2em] py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-0 outline-none mb-2 transition-colors"
            placeholder="0000"
          />
          {otpError && <p className="text-red-500 text-xs font-bold mb-4">{otpError}</p>}
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setOtpBookingId(null); setOtpInput(''); setOtpError(''); }} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={handleVerifyOtp} disabled={otpInput.length !== 4} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">Verify & Start</button>
          </div>
        </div>
      </div>
    );
  };
`;

content = content.replace(
  /const handleCompleteJob = async \(b: any\) => \{/,
  verifyFunc + "\n  const handleCompleteJob = async (b: any) => {"
);

fs.writeFileSync('pages/PartnerPanel.tsx', content);
