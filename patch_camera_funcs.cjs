const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

const target = `  const toggleAvailability = async () => {`;
const replacement = `
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      alert("Could not access camera. Please allow permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], "profile.jpg", { type: 'image/jpeg' });
            setProfilePhoto(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const toggleAvailability = async () => {`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('pages/PartnerPanel.tsx', code);
  console.log("Camera functions added.");
} else {
  console.log("Could not find target for camera functions.");
}
