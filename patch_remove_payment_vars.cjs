const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// 1. Remove the regPaymentFile upload block
const fileUploadBlockRegex = /\s*if\s*\(regPaymentFile\)\s*\{\s*try\s*\{\s*const result = await uploadAppFile\(\{[\s\S]*?\}\);\s*regFeePathOrUrl = result\.filePath;\s*\}\s*catch\s*\(err\)\s*\{\s*console\.error\([\s\S]*?\);\s*throw new Error\([\s\S]*?\);\s*\}\s*\}/g;
content = content.replace(fileUploadBlockRegex, "");

// 2. Remove regPaymentCode from JSON stringify
const paymentCodeRegex = /\s*paymentVerificationCode:\s*regPaymentCode,/g;
content = content.replace(paymentCodeRegex, "");

// 3. Remove regPaymentFile from the if condition
content = content.replace(/\|\|\s*regPaymentFile/g, "");

fs.writeFileSync('pages/PartnerPanel.tsx', content);
console.log("Payment variables removed.");
