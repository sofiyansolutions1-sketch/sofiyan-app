const fs = require('fs');
let code = fs.readFileSync('hooks/useStore.ts', 'utf8');

// Fix addPartner
code = code.replace(
  /aadhar_number: newPartner\.aadhar_number,\n\s*status: newPartner\.status,/,
  "aadhar_number: newPartner.aadhar_number,\n      id_proof_url: newPartner.id_proof_url,\n      status: newPartner.status,"
);

// Fix updatePartner is already correct: it has `id_proof_url: updatedPartner.id_proof_url,`

fs.writeFileSync('hooks/useStore.ts', code);
console.log("hooks/useStore.ts patched");
