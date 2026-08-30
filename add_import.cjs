const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

if (!code.includes("import { MapRadiusSelector }")) {
    code = code.replace("import { Briefcase, CheckCircle, MapPin, LogOut, Clock, User as UserIcon, Loader2, ShieldCheck, Star, X, Navigation } from 'lucide-react';", 
                        "import { Briefcase, CheckCircle, MapPin, LogOut, Clock, User as UserIcon, Loader2, ShieldCheck, Star, X, Navigation } from 'lucide-react';\nimport { MapRadiusSelector } from '../components/MapRadiusSelector';");
    fs.writeFileSync('pages/PartnerPanel.tsx', code);
    console.log("Import added!");
}
