const fs = require('fs');
let code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect, useRef } from 'react';");
code = code.replace(/import \{ Briefcase, CheckCircle, MapPin, LogOut, Clock, User as UserIcon, Loader2, ShieldCheck, Star, X\} from 'lucide-react';/, "import { Briefcase, CheckCircle, MapPin, LogOut, Clock, User as UserIcon, Loader2, ShieldCheck, Star, X, Camera, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';");

fs.writeFileSync('pages/PartnerPanel.tsx', code);
