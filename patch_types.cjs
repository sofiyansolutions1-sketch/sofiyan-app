const fs = require('fs');
let content = fs.readFileSync('types.ts', 'utf8');

content = content.replace(
  /price: number;/g,
  "price: number;\n  otp?: string; // 4-digit OTP for starting job\n  otpVerified?: boolean; // True if partner has entered OTP"
);

fs.writeFileSync('types.ts', content);
