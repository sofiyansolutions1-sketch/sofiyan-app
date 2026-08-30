const fs = require('fs');
const file = 'pages/PartnerPanel.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `  const [rpcMatchedLeadIds, setRpcMatchedLeadIds] = useState<string[]>([]);`;
const replacement = `  const [rpcMatchedLeadIds, setRpcMatchedLeadIds] = useState<string[]>([]);
  const [otpBookingId, setOtpBookingId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(file, code);
  console.log('Fixed state declarations.');
} else {
  console.log('Target not found.');
}
