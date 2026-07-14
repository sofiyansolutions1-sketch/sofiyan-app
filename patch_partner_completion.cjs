const fs = require('fs');
const file = 'pages/PartnerPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /await updateBooking\(\{ \.\.\.jobToComplete, status: \'completed\' \}\);/,
  `await updateBooking({ ...jobToComplete, status: 'admin_review' });`
);

content = content.replace(
  /<p className="font-bold text-gray-900 text-lg">Payment Verified!<\/p>\s*<p className="text-sm text-gray-500 mt-1">Amount and date match successfully\.<\/p>/,
  `<p className="font-bold text-gray-900 text-lg">Payment Verified!</p>
                  <div className="bg-gray-50 p-3 rounded-lg mt-4 text-left border border-gray-100">
                    <p className="text-xs text-gray-600 mb-1"><strong>Identified Amount:</strong> ₹{jobToComplete?.price}</p>
                    <p className="text-xs text-gray-600 mb-1"><strong>Service Commission:</strong> ₹{(jobToComplete?.price * 0.25).toFixed(2)}</p>
                    <p className="text-xs text-gray-600"><strong>Date & Time:</strong> {new Date().toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-green-600 mt-4 font-bold">Sent to Admin for Review & Rating</p>`
);

fs.writeFileSync(file, content);
console.log("Patched PartnerPanel completion flow");
