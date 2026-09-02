const fs = require('fs');
let code = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const target = `        {/* Floating Helpline Pill */}`;
const replacement = `        {/* No Technician Popup Modal */}
        <AnimatePresence>
          {showNoTechnicianPopup && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col p-6 text-center"
              >
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-black text-indigo-950 mb-2">No Nearby Technicians</h3>
                <p className="text-sm font-semibold text-slate-600 mb-6">
                  Currently, there are no technicians available within 10km of your location. Please contact our Customer Care for immediate assistance.
                </p>
                <div className="space-y-3">
                  <a 
                    href="tel:8115983887"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95"
                  >
                    <Phone size={16} /> Call Customer Care
                  </a>
                  <button 
                    onClick={() => setShowNoTechnicianPopup(false)}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                  >
                    Close & Keep Waiting
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Floating Helpline Pill */}`;

code = code.replace(target, replacement);
fs.writeFileSync('pages/CustomerPanel.tsx', code);
