const fs = require('fs');
let code = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const targetRegex = /\/\/ Forward to WhatsApp\s+try \{\s+const templateMsg = `🆕 NEW ONLINE BOOKING\\n` \+[\s\S]*?console\.warn\("WhatsApp logic failed",\);\s+\}/;

const replacement = `      // Determine if there are nearby technicians
      const calculateDistance = (lat1?: number | null, lon1?: number | null, lat2?: number | null, lon2?: number | null): number => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
        return R * c;
      };

      const hasNearbyTechnician = partners.some(p => {
        if (p.status === 'blocked' || p.status === 'pending') return false;
        if (!p.categories?.includes(categoryName)) return false;
        if (formData.lat && formData.lng) {
          return calculateDistance(formData.lat, formData.lng, p.lat, p.lng) <= 10;
        } else {
          return p.city?.toLowerCase() === formData.city?.toLowerCase();
        }
      });

      if (!hasNearbyTechnician) {
        setShowNoTechnicianPopup(true);
        setShowHelplineBanner(true);

        // Forward to WhatsApp
        try {
          const templateMsg = \`🆕 NEW ONLINE BOOKING (NO NEARBY TECH)\\n\` +
            \`───────────────────\\n\` +
            \`👤 Customer Info:\\n\` +
            \`Name: \${formData.name}\\n\` +
            \`Phone: \${formData.contact}\\n\\n\` +
            \`🛠️ Service Details:\\n\` +
            \`Category: \${categoryName}\\n\` +
            \`Items: \${subServiceName}\\n\` +
            \`Total Amount: ₹\${finalTotal}\\n\\n\` +
            \`📍 Address:\\n\` +
            \`City: \${formData.city} -\\n\` +
            \`Detail: \${formData.address}\\n\` +
            (formData.locationLink ? \`🔗 Location: \${formData.locationLink}\\n\` : '') +
            \`\\n⏰ Schedule:\\n\` +
            \`Date: \${formData.date}\\n\` +
            \`Time: \${formData.time}\\n\` +
            \`───────────────────\\n\` +
            \`⚠️ NO TECHNICIANS IN 10KM RADIUS!\\n\` +
            \`Sent via Sofiyan Home Service App\`;
  
          // 1. Automatic send to admin via Server API
          const adminPhone = ((import.meta as any).env.VITE_ADMIN_PHONE || '8115983887').replace(/\\+/g, '');
          
          fetch('/api/send-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              number: adminPhone,
              message: templateMsg
            })
          }).catch(err => console.error("Auto WhatsApp Error:", err));
        } catch {
          console.warn("WhatsApp logic failed");
        }
      }`;

if (targetRegex.test(code)) {
    code = code.replace(targetRegex, replacement);
    fs.writeFileSync('pages/CustomerPanel.tsx', code);
    console.log("Replaced using Regex!");
} else {
    console.log("Could not find the target string!");
}
