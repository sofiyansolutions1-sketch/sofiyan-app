const fs = require('fs');
let content = fs.readFileSync('hooks/useStore.ts', 'utf8');

// mapBookingFromDB
content = content.replace(
  /otp: data\.otp,\n\s*otpVerified: data\.otp_verified/,
  "otp: (data.cart_items && data.cart_items[0] && data.cart_items[0].system_otp) || '',\n  otpVerified: data.status === 'in_progress'"
);

// updateBooking
content = content.replace(
  /otp: updatedBooking\.otp,\n\s*otp_verified: updatedBooking\.otpVerified/,
  ""
);

fs.writeFileSync('hooks/useStore.ts', content);
