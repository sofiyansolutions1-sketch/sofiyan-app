const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');
content = content.replace('import { Briefcase, CheckCircle, MapPin, LogOut, Clock, User as UserIcon,  Loader2, ShieldCheck, Star, X } from \'lucide-react\';', 'import { Briefcase, CheckCircle, MapPin, LogOut, Clock, User as UserIcon,  Loader2, ShieldCheck, Star, X, Navigation } from \'lucide-react\';');
fs.writeFileSync('pages/PartnerPanel.tsx', content);
console.log("Fixed import");
