const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// 1. Add state variables for OTP
if (!content.includes('otpBookingId')) {
  content = content.replace(
    /const \[paymentModalOpen, setPaymentModalOpen\] = useState\(false\);/,
    "const [paymentModalOpen, setPaymentModalOpen] = useState(false);\n  const [otpBookingId, setOtpBookingId] = useState<string | null>(null);\n  const [otpInput, setOtpInput] = useState('');\n  const [otpError, setOtpError] = useState('');"
  );
}

// 2. Add OTP verification function
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
      otpVerified: true,
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

if (!content.includes('handleVerifyOtp')) {
  content = content.replace(
    /const handleCompleteJob = async \(b: Booking\) => \{/,
    verifyFunc + "\n  const handleCompleteJob = async (b: Booking) => {"
  );
}

if (!content.includes('renderOtpModal()')) {
  content = content.replace(
    /\{renderPaymentModal\(\)\}/,
    "{renderPaymentModal()}\n      {renderOtpModal()}"
  );
}

// 4. Update the buttons in Process Lead panel
const buttonBlock = `
                    {(b.status === 'accepted' || b.status === 'Forwarded' || b.status === 'in_progress') && (
                      <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                        <button onClick={() => handleCancelLead(b)} className="flex-1 sm:flex-none text-xs sm:text-sm font-bold bg-red-50 text-red-700 border border-red-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-red-100 transition-colors">
                          Cancel
                        </button>
                        {(b.status === 'accepted' || b.status === 'Forwarded') ? (
                          <button onClick={() => setOtpBookingId(b.id)} className="flex-[2] sm:flex-none text-xs sm:text-sm font-bold bg-indigo-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                            Start Job
                          </button>
                        ) : (
                          <button onClick={() => handleCompleteJob(b)} className="flex-[2] sm:flex-none text-xs sm:text-sm font-bold bg-green-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                            Mark Completed
                          </button>
                        )}
                      </div>
                    )}
`;

const buttonBlockRegex = /\{\(b\.status === 'accepted' \|\| b\.status === 'Forwarded' \|\| b\.status === 'in_progress'\) && \([\s\S]*?Cancel[\s\S]*?Mark Completed[\s\S]*?<\/button>\s*<\/div>\s*\)\}/;
content = content.replace(buttonBlockRegex, buttonBlock);

// 5. Update activeJob logic to include 'in_progress'
content = content.replace(
  /const activeJob = partnerBookings\.find\(b => b\.status === 'accepted' \|\| b\.status === 'Forwarded'\);/,
  "const activeJob = partnerBookings.find(b => b.status === 'accepted' || b.status === 'Forwarded' || b.status === 'in_progress');"
);

fs.writeFileSync('pages/PartnerPanel.tsx', content);
