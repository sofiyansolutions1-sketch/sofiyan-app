const fs = require('fs');
const file = 'pages/CustomerPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">\s*<CheckCircle className="w-10 h-10 text-green-600" \/>\s*<\/div>\s*<h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!<\/h3>\s*<p className="text-gray-600 mb-8">\s*Your booking has been confirmed\. A partner will be assigned shortly\.\s*<\/p>\s*<button\s*onClick=\{resetFlow\}\s*className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"\s*>\s*Back to Home\s*<\/button>/,
  `<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                Your booking is placed successfully. A partner will be assigned shortly.
              </p>
              
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl w-full mb-8 shadow-sm text-left">
                <h4 className="font-bold text-indigo-900 mb-2 text-lg">Customer Dashboard</h4>
                <p className="text-sm text-indigo-700 mb-4">Track your booking or contact our service center directly for any assistance.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="tel:7625046788" className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-md">
                    <Phone size={18} /> Call Helpline (7625046788)
                  </a>
                  <button onClick={resetFlow} className="flex-1 bg-white border-2 border-indigo-200 text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-50 transition">
                    View My Bookings
                  </button>
                </div>
              </div>`
);

fs.writeFileSync(file, content);
console.log("Patched CustomerPanel success screen");
