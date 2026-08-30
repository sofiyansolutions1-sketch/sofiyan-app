const fs = require('fs');
let content = fs.readFileSync('pages/TrackBooking.tsx', 'utf8');

// Inside getStatusInfo, let's add 'in_progress' just in case.
content = content.replace(
  /case 'accepted': return \{ icon: <Package className="text-indigo-500 w-8 h-8" \/>, text: 'Partner Accepted & En Route', color: 'bg-indigo-100', progress: 75 \};/,
  "case 'accepted': return { icon: <Package className=\"text-indigo-500 w-8 h-8\" />, text: 'Partner En Route', color: 'bg-indigo-100', progress: 65 };\n      case 'in_progress': return { icon: <Package className=\"text-indigo-500 w-8 h-8\" />, text: 'Job In Progress', color: 'bg-indigo-100', progress: 85 };"
);

// Under the "Service Details", add an OTP display block if OTP exists and status is accepted
content = content.replace(
  /<div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">/,
  `{booking.otp && !booking.otp_verified && (booking.status === 'accepted' || booking.status === 'Forwarded' || booking.status === 'pending') && (
            <div className="mb-8 bg-indigo-950 p-6 rounded-[1.5rem] text-center shadow-lg border border-indigo-900">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Service Start OTP</p>
              <div className="inline-block bg-white/10 px-8 py-3 rounded-xl border border-indigo-400/30">
                 <p className="text-3xl font-black text-white tracking-[0.2em]">{booking.otp}</p>
              </div>
              <p className="text-xs text-indigo-300 mt-4 font-medium">Please share this 4-digit PIN with your partner to start the service.</p>
            </div>
          )}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">`
);

fs.writeFileSync('pages/TrackBooking.tsx', content);
