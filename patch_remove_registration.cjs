const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// 1. regStep definition
const oldRegStepDef = `const [regStep, setRegStep] = useState<"personal" | "expertise" | "location" | "verify" | "payment" | "success">("personal");`;
const newRegStepDef = `const [regStep, setRegStep] = useState<"personal" | "expertise" | "location" | "verify" | "success">("personal");`;
content = content.replace(oldRegStepDef, newRegStepDef);

// 2. Remove payment state vars
const oldPaymentStates = `const [regPaymentCode, setRegPaymentCode] = useState<string | null>(null);
  const [regPaymentFile, setRegPaymentFile] = useState<File | null>(null);
  const [regPaymentImage, setRegPaymentImage] = useState<string | null>(null);
  const [regPaymentStatus, setRegPaymentStatus] = useState<"idle" | "verifying" | "verified">("idle");
  const [regPaymentError, setRegPaymentError] = useState<string | null>(null);`;
content = content.replace(oldPaymentStates, "");

// 3. Delete handleVerifyAndSubmitRegistration function
const verifyFuncRegex = /const handleVerifyAndSubmitRegistration = async \(\) => \{[\s\S]*?\n  \};\n/g;
content = content.replace(verifyFuncRegex, "");

// 4. Update the stepper array & remove REGISTRATION circle
const oldStepperFull = `          <div className="flex justify-between items-center mb-8 relative px-1 sm:px-2">
            <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-100 -z-10"></div>

            <div className="flex flex-col items-center">
              <div
                className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold \${
                  ["personal", "expertise", "location", "verify", "payment", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }\`}
              >
                1
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">PERSONAL</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold \${
                  ["expertise", "location", "verify", "payment", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }\`}
              >
                2
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">EXPERTISE</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold \${
                  ["location", "verify", "payment", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }\`}
              >
                3
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">LOCATION</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold \${
                  ["verify", "payment", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }\`}
              >
                4
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">VERIFY</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold \${
                  ["payment", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }\`}
              >
                5
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">REGISTRATION</span>
            </div>
          </div>`;

const newStepperFull = `          <div className="flex justify-between items-center mb-8 relative px-1 sm:px-2 max-w-md mx-auto">
            <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-100 -z-10"></div>

            <div className="flex flex-col items-center">
              <div
                className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold \${
                  ["personal", "expertise", "location", "verify", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }\`}
              >
                1
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">PERSONAL</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold \${
                  ["expertise", "location", "verify", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }\`}
              >
                2
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">EXPERTISE</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold \${
                  ["location", "verify", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }\`}
              >
                3
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">LOCATION</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={\`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm text-xs font-bold \${
                  ["verify", "success"].includes(regStep)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border-2 border-slate-200 text-slate-400"
                }\`}
              >
                4
              </div>
              <span className="text-[9px] sm:text-[10px] mt-2 font-bold tracking-wider text-slate-600">VERIFY</span>
            </div>
          </div>`;
content = content.replace(oldStepperFull, newStepperFull);

// 6. Replace the Next button in the verify step
const oldVerifyButton = `<button
                  type="button"
                  onClick={() => {
                    if (!regPaymentCode) {
                      setRegPaymentCode(Math.floor(100000 + Math.random() * 900000).toString());
                    }
                    setRegStep("payment");
                  }}
                  disabled={isSubmitting || !profilePhoto || (regData.aadharNumber.length < 12 && !aadhaarPhoto)}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>Next: Registration Fee (₹499)</span>
                  <ArrowRight size={16} />
                </button>`;
                
const newVerifyButton = `<button
                  type="button"
                  onClick={() => handleRegistrationSubmit()}
                  disabled={isSubmitting || !profilePhoto || (regData.aadharNumber.length < 12 && !aadhaarPhoto)}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>`;
content = content.replace(oldVerifyButton, newVerifyButton);

// 7. Remove the payment step block
// We can use regex to remove the whole block.
// It starts with {/* STEP 5: REGISTRATION FEE / PAYMENT */} and ends before {/* STEP 5: SUCCESS */}
const paymentBlockRegex = /\{\/\* STEP 5: REGISTRATION FEE \/ PAYMENT \*\/\}[\s\S]*?(?=\{\/\* STEP 5: SUCCESS \*\/\}|\{\/\* STEP 4: SUCCESS \*\/\}|\{\/\* STEP 5: SUCCESS)/;
content = content.replace(paymentBlockRegex, "");

// Make sure to rename SUCCESS comment to STEP 5: SUCCESS or just SUCCESS
content = content.replace(/\{\/\* STEP 5: SUCCESS \*\/\}/, "{/* STEP 5: SUCCESS */}");

fs.writeFileSync('pages/PartnerPanel.tsx', content);
console.log("Registration step removed.");
