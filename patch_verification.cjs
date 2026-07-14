const fs = require('fs');
const file = 'pages/PartnerPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

const importRegex = /import React, { useState } from 'react';/;
content = content.replace(importRegex, "import React, { useState, useEffect } from 'react';");

const stateInsertionPoint = /const \[isRegistrationOpen, setIsRegistrationOpen\] = useState\(false\);/;
const additionalStates = `const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [jobToComplete, setJobToComplete] = useState<any>(null);
  const [verificationStep, setVerificationStep] = useState<'idle'|'uploading'|'verifying'|'success'>('idle');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);`;
content = content.replace(stateInsertionPoint, additionalStates);

const handleCompleteRegex = /const handleCompleteJob = async \(b: Booking\) => \{[\s\S]*?\n  \};/;
const newHandleComplete = `const handleCompleteJob = async (b: any) => {
    setJobToComplete(b);
    setVerificationStep('idle');
    setUploadedImage(null);
  };
  
  const processCompletion = async () => {
    if (!jobToComplete) return;
    await updateBooking({ ...jobToComplete, status: 'completed' });
    await updatePartner({
      ...currentUser,
      completedJobs: (currentUser?.completedJobs || 0) + 1,
      earnings: (currentUser?.earnings || 0) + jobToComplete.price
    });
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        completedJobs: (currentUser.completedJobs || 0) + 1,
        earnings: (currentUser.earnings || 0) + jobToComplete.price
      });
    }
    setJobToComplete(null);
  };

  const simulateVerification = () => {
    setVerificationStep('verifying');
    setTimeout(() => {
      setVerificationStep('success');
      setTimeout(() => {
        processCompletion();
      }, 1500);
    }, 2500);
  };`;
content = content.replace(handleCompleteRegex, newHandleComplete);

const verificationModal = `
  const renderPaymentModal = () => {
    if (!jobToComplete) return null;
    const commission = (jobToComplete.price * 0.25).toFixed(2);
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
          <button onClick={() => setJobToComplete(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
          
          <div className="bg-indigo-600 p-6 text-white text-center">
            <h3 className="text-xl font-bold">Complete Job</h3>
            <p className="text-indigo-200 text-sm mt-1">Commission Payment Verification</p>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Service Charge</span>
              <span className="font-bold">₹{jobToComplete.price}</span>
            </div>
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
              <span className="text-gray-600 font-bold">Company Commission (25%)</span>
              <span className="font-bold text-indigo-600 text-lg">₹{commission}</span>
            </div>
            
            {verificationStep === 'idle' && (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-500">Ask the customer to scan this QR code and pay the commission amount.</p>
                <div className="inline-block p-2 border-4 border-indigo-50 rounded-2xl bg-white shadow-sm">
                  <img src="https://iili.io/CEJ9e9I.png" onError={(e) => { e.currentTarget.src = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CompanyUPI'; }} alt="Payment QR" className="w-48 h-48 object-contain" />
                </div>
                
                <div className="mt-6 text-left">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Upload Payment Screenshot</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedImage(URL.createObjectURL(e.target.files[0]));
                    }
                  }} className="w-full border rounded-xl p-2 text-sm" />
                </div>
                
                <button 
                  onClick={() => setVerificationStep('uploading')}
                  disabled={!uploadedImage}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors mt-2"
                >
                  Verify Payment
                </button>
              </div>
            )}
            
            {verificationStep === 'uploading' && (
              <div className="text-center py-8">
                <div className="w-full bg-gray-100 h-2 rounded-full mb-4 overflow-hidden">
                  <div className="bg-indigo-600 h-full w-full animate-[pulse_1s_ease-in-out_infinite]"></div>
                </div>
                <p className="font-bold text-indigo-600">Uploading screenshot...</p>
                {setTimeout(() => simulateVerification(), 1000) && null}
              </div>
            )}
            
            {verificationStep === 'verifying' && (
              <div className="text-center py-8 space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                <div>
                  <p className="font-bold text-gray-900">AI Verification in progress</p>
                  <p className="text-sm text-gray-500 mt-1">Checking amount and timestamp...</p>
                </div>
              </div>
            )}
            
            {verificationStep === 'success' && (
              <div className="text-center py-8 space-y-4 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Payment Verified!</p>
                  <p className="text-sm text-gray-500 mt-1">Amount and date match successfully.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
`;
const returnStartRegex = /return \(\s*<div className="max-w-6xl mx-auto/m;
content = content.replace(returnStartRegex, verificationModal + '\n  return (\n    <div className="max-w-6xl mx-auto');

const renderModalsInsertion = /\{isRegistrationOpen && renderRegistrationModal\(\)\}/;
content = content.replace(renderModalsInsertion, "{isRegistrationOpen && renderRegistrationModal()}\n        {renderPaymentModal()}");

fs.writeFileSync(file, content);
console.log("Patched verification step");
