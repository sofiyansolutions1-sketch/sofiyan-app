import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PartnerRegistrationSuccess = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 }
    });
    
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative overflow-hidden"
      >
        <CheckCircle className="text-green-500 w-12 h-12 relative z-10" />
      </motion.div>
      <h3 className="text-3xl font-black text-slate-800 mb-2">Welcome Aboard! 🎉</h3>
      <p className="text-slate-600 max-w-sm mx-auto mb-8 text-sm">
        Registration successful! Your profile is verified. Redirecting to your Partner Dashboard...
      </p>
    </motion.div>
  );
};
