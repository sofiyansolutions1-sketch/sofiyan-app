const fs = require('fs');
let content = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// Add supabase import if not present
if (!content.includes("import { supabase }")) {
    content = content.replace("import { useStore } from '../hooks/useStore';", "import { useStore } from '../hooks/useStore';\nimport { supabase } from '../supabaseClient';");
}

// Add state for RPC matched leads
if (!content.includes("const [rpcMatchedLeadIds, setRpcMatchedLeadIds]")) {
    const stateHook = `
  const [rpcMatchedLeadIds, setRpcMatchedLeadIds] = useState<string[]>([]);
  const [isRpcMatching, setIsRpcMatching] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.status !== 'available' || !currentUser.lat || !currentUser.lng) return;
    
    let radiusStr = (currentUser.service_areas && currentUser.service_areas.length > 0) ? currentUser.service_areas[0] : '5';
    let serviceRadius = parseFloat(radiusStr) || 5;

    const fetchMatches = async () => {
      setIsRpcMatching(true);
      try {
        // Call the server-side PostgreSQL function (RPC)
        const { data, error } = await supabase.rpc('get_nearby_leads', {
          p_lat: currentUser.lat,
          p_lng: currentUser.lng,
          p_radius_km: serviceRadius
        });
        
        if (data && !error) {
          setRpcMatchedLeadIds(data.map((d: any) => d.id));
        }
      } catch (err) {
        console.error("RPC distance matching failed:", err);
      } finally {
        setIsRpcMatching(false);
      }
    };

    fetchMatches();
  }, [bookings, currentUser]);
`;
    // Insert after currentUser definition
    content = content.replace('const [currentUser, setCurrentUser] = useState<Partner | null>(null);', 'const [currentUser, setCurrentUser] = useState<Partner | null>(null);\n' + stateHook);
}

// Update newLeads filter to use rpcMatchedLeadIds
const filterRegex = /const newLeads = bookings\.filter\(b => \{[\s\S]*?return true; \/\/ As long as pincode and category matches, show the lead to the partner\s*\}\);/;

const filterReplacement = `const newLeads = bookings.filter(b => {
    if (b.status !== 'pending') return false;
    
    // Advanced condition: Partner must be 'available' to receive new automatic leads
    if (currentUser.status !== 'available') return false;
    
    const partnerPins = currentUser.service_pincodes || [];
    const bPin = String(b.pinCode || '').trim();
    const pPin = String(currentUser.pincode || '').trim();
        
    let hasLocationMatch = false;
    
    // Use server-side RPC match if available, otherwise fallback to local haversine
    if (rpcMatchedLeadIds.length > 0) {
        hasLocationMatch = rpcMatchedLeadIds.includes(b.id);
    } else {
        // Fallback Local Smart Radius Matching
        const pLat = currentUser.lat;
        const pLng = currentUser.lng;
        const bLat = b.lat;
        const bLng = b.lng;
        
        let radiusStr = (currentUser.service_areas && currentUser.service_areas.length > 0) ? currentUser.service_areas[0] : '5';
        let serviceRadius = parseFloat(radiusStr) || 5;

        if (pLat && pLng && bLat && bLng) {
           const toRad = (value) => (value * Math.PI) / 180;
           const R = 6371; // Earth radius in km
           const dLat = toRad(bLat - pLat);
           const dLng = toRad(bLng - pLng);
           const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                     Math.cos(toRad(pLat)) * Math.cos(toRad(bLat)) *
                     Math.sin(dLng / 2) * Math.sin(dLng / 2);
           const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
           const distance = R * c;
           
           if (distance <= serviceRadius) {
               hasLocationMatch = true;
           }
        }
    }
    
    // Fallback to Pincode/Area Matching if not matched by radius
    if (!hasLocationMatch) {
       hasLocationMatch = bPin === pPin || partnerPins.includes(bPin);
    }

    if (!hasLocationMatch) return false;

    const partnerCategories = currentUser.categories || [];
    const mapCustomerCategoryToPartner = (cat: string) => {
      const lowerCat = (cat || '').toLowerCase();
      if (['ac', 'washingmachine', 'refrigerator', 'waterpurifier', 'geyser', 'microwave', 'television', 'chimney', 'home appliances'].includes(lowerCat)) return 'Home Appliances';
      if (lowerCat.includes('plumb') || lowerCat === 'plumber') return 'Plumber';
      if (lowerCat.includes('clean') || lowerCat.includes('pest')) return 'Cleaning & Pest Control';
      if (lowerCat.includes('electrician')) return 'Electrician';
      if (lowerCat.includes('carpenter')) return 'Carpenters';
      return cat;
    };

    const hasCategoryMatch = partnerCategories.length === 0 || 
      partnerCategories.includes(mapCustomerCategoryToPartner(b.serviceCategory)) || 
      (b.cartItems && b.cartItems.some(item => partnerCategories.includes(mapCustomerCategoryToPartner(item.categoryName))));
      
    if (!hasCategoryMatch) return false;

    return true; // As long as location and category matches, show the lead
  });`;

content = content.replace(filterRegex, filterReplacement);

fs.writeFileSync('pages/PartnerPanel.tsx', content);
