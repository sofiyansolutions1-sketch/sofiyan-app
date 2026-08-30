const fs = require('fs');
let content = fs.readFileSync('hooks/useStore.ts', 'utf8');

// Update mapBookingFromDB
content = content.replace(
  /appliedReferralCode: data.applied_referral_code\n\}\);/,
  "appliedReferralCode: data.applied_referral_code,\n  otp: data.otp,\n  otpVerified: data.otp_verified\n});"
);

// Update updateBooking
content = content.replace(
  /commission_screenshot: updatedBooking\.commission_screenshot \|\| null\n    \}\)\.eq\('id', updatedBooking\.id\);/,
  "commission_screenshot: updatedBooking.commission_screenshot || null,\n        otp: updatedBooking.otp,\n        otp_verified: updatedBooking.otpVerified\n    }).eq('id', updatedBooking.id);"
);

fs.writeFileSync('hooks/useStore.ts', content);
