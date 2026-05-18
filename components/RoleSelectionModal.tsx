import React from 'react';
import { motion } from 'motion/react';
import { User, Wrench } from 'lucide-react';

interface RoleSelectionModalProps {
  onSelect: (role: 'customer' | 'technician') => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden border border-white/20"
      >
        <div className="p-6 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.1 }}
            className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100"
          >
            <User className="text-white" size={32} />
          </motion.div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight leading-tight">Are you a customer or are you a technician?</h2>
          <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">Please select your role to proceed</p>
          
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => onSelect('customer')}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group text-left relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300 transform group-hover:scale-110">
                <User className="text-indigo-600 group-hover:text-white" size={24} />
              </div>
              <div>
                <div className="font-extrabold text-gray-900 text-base">Customer</div>
                <div className="text-xs text-gray-500 font-semibold opacity-80">Book a service</div>
              </div>
            </button>
            
            <button
              onClick={() => onSelect('technician')}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-600 hover:bg-emerald-50/50 transition-all group text-left relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 transition-all duration-300 transform group-hover:scale-110">
                <Wrench className="text-emerald-600 group-hover:text-white" size={24} />
              </div>
              <div>
                <div className="font-extrabold text-gray-900 text-base">Technician</div>
                <div className="text-xs text-gray-500 font-semibold opacity-80">Partner with us</div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="py-4 bg-gray-50 border-t border-gray-100 text-center flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
            Trusted by 10,000+ Users
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
};
