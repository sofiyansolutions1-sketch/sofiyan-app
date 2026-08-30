const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf-8');

// Add confetti import
if (!content.includes("import confetti")) {
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport confetti from 'canvas-confetti';");
}

// Modify the submit button
const buttonMatch = `<button onClick={() => {
                setRegStep('verifying');
                setTimeout(() => {
                  setRegStep('success');
                  setTimeout(() => {
                    handleRegistrationSubmit();
                  }, 2000);
                }, 2500);
              }}`;

const newButton = `<button onClick={() => {
                setRegStep('verifying');
                setTimeout(() => {
                  setRegStep('success');
                  confetti({
                    particleCount: 200,
                    spread: 90,
                    origin: { y: 0.6 }
                  });
                  setTimeout(() => {
                    handleRegistrationSubmit();
                  }, 3000);
                }, 2500);
              }}`;

if (content.includes(buttonMatch)) {
    content = content.replace(buttonMatch, newButton);
} else {
    console.log("Could not find buttonMatch");
}

// Modify the success screen
const successMatch = `{regStep === 'success' && (
          <div className="space-y-6 text-center py-20 animate-in zoom-in duration-500 fade-in">
            <div className="w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 relative shadow-lg"> 
               <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-50 delay-150"></div>
               <CheckCircle className="w-16 h-16 text-emerald-600 relative z-10 animate-bounce" />
            </div>
            <h3 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Congratulations! 🎉</h3>
            <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed">Your identity has been verified successfully. Redirecting you to your brand new dashboard...</p>
          </div>
        )}`;

const newSuccess = `{regStep === 'success' && (
          <div className="space-y-6 text-center py-10 animate-in zoom-in duration-500 fade-in">
            <div className="w-40 h-40 mx-auto mb-6 relative"> 
               <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-30 delay-150"></div>
               <img src="https://media.giphy.com/media/11s7Ke7jcNxCHS/giphy.gif" alt="Anime Celebrate" className="w-full h-full object-cover rounded-full shadow-2xl relative z-10 border-4 border-emerald-400" />
            </div>
            <h3 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Congratulations! 🎉</h3>
            <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed">Your identity has been verified! Welcome to the squad. Redirecting to your dashboard...</p>
          </div>
        )}`;

if (content.includes(successMatch)) {
    content = content.replace(successMatch, newSuccess);
} else {
    console.log("Could not find successMatch");
}

fs.writeFileSync('pages/PartnerPanel.tsx', content);
console.log('Update success step with anime and confetti');
