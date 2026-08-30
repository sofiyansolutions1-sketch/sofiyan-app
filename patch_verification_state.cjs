const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const target = `  const [otpError, setOtpError] = useState('');`;
const replacement = `  const [otpError, setOtpError] = useState('');

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [businessPhotos, setBusinessPhotos] = useState<File[]>([]);
  const [aadhaarPhoto, setAadhaarPhoto] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('pages/PartnerPanel.tsx', code);
  console.log("State variables added.");
} else {
  console.log("Could not find target for state variables.");
}
