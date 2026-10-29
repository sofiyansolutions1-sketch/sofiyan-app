/**
 * Geo Service for Sofiyan Home Service Solutions
 * Provides Haversine distance calculations, Google Maps URL coordinate extraction,
 * coordinate resolution for leads/partners, and category matching.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

// Known coordinates for areas and cities to guarantee fallback resolution
export const KNOWN_LOCATION_COORDINATES: Record<string, LatLng> = {
  // Bangalore Areas & Landmarks
  'electronic city': { lat: 12.8452, lng: 77.6602 },
  'electronic city phase 1': { lat: 12.8452, lng: 77.6602 },
  'electronic city phase 2': { lat: 12.8398, lng: 77.6775 },
  'koramangala': { lat: 12.9352, lng: 77.6245 },
  'hsr layout': { lat: 12.9121, lng: 77.6446 },
  'indiranagar': { lat: 12.9784, lng: 77.6408 },
  'whitefield': { lat: 12.9698, lng: 77.7500 },
  'marathahalli': { lat: 12.9591, lng: 77.6974 },
  'btm layout': { lat: 12.9166, lng: 77.6101 },
  'btm': { lat: 12.9166, lng: 77.6101 },
  'bellandur': { lat: 12.9304, lng: 77.6784 },
  'jayanagar': { lat: 12.9308, lng: 77.5838 },
  'jp nagar': { lat: 12.9063, lng: 77.5857 },
  'hebbal': { lat: 13.0358, lng: 77.5970 },
  'yelahanka': { lat: 13.1007, lng: 77.5963 },
  'abbigere': { lat: 13.0768, lng: 77.5186 },
  'rajajinagar': { lat: 12.9982, lng: 77.5530 },
  'malleshwaram': { lat: 13.0031, lng: 77.5643 },
  'banashankari': { lat: 12.9255, lng: 77.5468 },
  'sarjapur': { lat: 12.8596, lng: 77.7874 },
  'sarjapur road': { lat: 12.9114, lng: 77.6834 },
  'bannerghatta': { lat: 12.8000, lng: 77.5770 },
  'bannerghatta road': { lat: 12.8940, lng: 77.5982 },
  'electronic': { lat: 12.8452, lng: 77.6602 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },

  // Mau & UP regions
  'mau': { lat: 25.9419, lng: 83.5609 },
  'ghosi': { lat: 26.1118, lng: 83.5412 },
  'kopaganj': { lat: 26.0195, lng: 83.5684 },
  'muhammadabad': { lat: 26.0357, lng: 83.3826 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'gorakhpur': { lat: 26.7606, lng: 83.3732 },
  'azamgarh': { lat: 26.0687, lng: 83.1859 },

  // Metro Cities fallback
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'kolkata': { lat: 22.5726, lng: 88.3639 }
};

/**
 * Calculates the Haversine distance in kilometers between two points
 */
export const calculateHaversineDistance = (
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number => {
  if (
    lat1 === undefined || lat1 === null || isNaN(lat1) ||
    lon1 === undefined || lon1 === null || isNaN(lon1) ||
    lat2 === undefined || lat2 === null || isNaN(lat2) ||
    lon2 === undefined || lon2 === null || isNaN(lon2)
  ) {
    return 99999;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return isNaN(distance) ? 99999 : distance;
};

/**
 * Formats distance into a human-readable string (e.g., '1.2 km away' or '< 50 m away')
 */
export const formatDistance = (distKm: number): string => {
  if (distKm === undefined || distKm === null || distKm >= 99999 || isNaN(distKm)) {
    return 'Distance unknown';
  }
  if (distKm < 0.05) {
    return '< 50 m away';
  }
  if (distKm < 1) {
    const meters = Math.round(distKm * 1000);
    return `${meters} m away`;
  }
  return `${distKm.toFixed(1)} km away`;
};

/**
 * Parses latitude and longitude from any Google Maps link format:
 * - https://www.google.com/maps/@12.8452,77.6602,15z
 * - https://maps.google.com/?q=12.8452,77.6602
 * - https://www.google.com/maps/place/12.8452,77.6602
 * - https://maps.google.com/maps?ll=12.8452,77.6602
 * - Raw "12.8452, 77.6602"
 */
export const extractCoordsFromMapLink = (url?: string | null): LatLng | null => {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  try {
    // 1. @lat,lng pattern (most standard Google Maps web link)
    const atMatch = cleanUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }

    // 2. Query param pattern: q=lat,lng or ll=lat,lng or query=lat,lng or destination=lat,lng
    const qMatch = cleanUrl.match(/[?&](?:q|ll|query|destination|daddr)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      const lat = parseFloat(qMatch[1]);
      const lng = parseFloat(qMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }

    // 3. /place/lat,lng or /dir/lat,lng
    const placeMatch = cleanUrl.match(/\/(?:place|dir)\/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (placeMatch) {
      const lat = parseFloat(placeMatch[1]);
      const lng = parseFloat(placeMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }

    // 4. Raw "lat, lng" coordinates text
    const rawCoordsMatch = cleanUrl.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
    if (rawCoordsMatch) {
      const lat = parseFloat(rawCoordsMatch[1]);
      const lng = parseFloat(rawCoordsMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
  } catch (err) {
    console.warn('extractCoordsFromMapLink error:', err);
  }

  return null;
};

/**
 * Resolves coordinates from entity fields (lat/lng, location_link, area, city, address)
 */
export const resolveCoordinates = (entity: {
  lat?: number | null;
  lng?: number | null;
  location_link?: string | null;
  area?: string | null;
  city?: string | null;
  address?: string | null;
  pinCode?: string | null;
  pincode?: string | null;
  service_areas?: string[] | null;
}): LatLng | null => {
  // 1. Direct valid coordinates
  if (
    entity.lat !== undefined && entity.lat !== null && !isNaN(entity.lat) &&
    entity.lng !== undefined && entity.lng !== null && !isNaN(entity.lng) &&
    (entity.lat !== 0 || entity.lng !== 0)
  ) {
    return { lat: Number(entity.lat), lng: Number(entity.lng) };
  }

  // 2. Extract from location_link
  if (entity.location_link) {
    const extracted = extractCoordsFromMapLink(entity.location_link);
    if (extracted) return extracted;
  }

  // 3. Match against known location dictionary
  const candidates: string[] = [];
  if (entity.area) candidates.push(entity.area.toLowerCase().trim());
  if (entity.city) candidates.push(entity.city.toLowerCase().trim());
  if (entity.address) {
    candidates.push(entity.address.toLowerCase().trim());
    // Also extract substrings
    const parts = entity.address.split(/[,\s-]+/);
    parts.forEach(p => {
      if (p.trim().length > 3) candidates.push(p.toLowerCase().trim());
    });
  }
  if (entity.service_areas && Array.isArray(entity.service_areas)) {
    entity.service_areas.forEach(sa => candidates.push(sa.toLowerCase().trim()));
  }

  for (const text of candidates) {
    for (const [key, coords] of Object.entries(KNOWN_LOCATION_COORDINATES)) {
      if (text.includes(key) || key.includes(text)) {
        return coords;
      }
    }
  }

  // 4. Default fallback: If city is Bangalore or Karnataka, use Bangalore center
  const allText = `${entity.city || ''} ${entity.address || ''} ${entity.area || ''}`.toLowerCase();
  if (allText.includes('bangalore') || allText.includes('bengaluru') || allText.includes('karnataka')) {
    return KNOWN_LOCATION_COORDINATES['bangalore'];
  }
  if (allText.includes('mau') || allText.includes('ghosi') || allText.includes('uttar pradesh')) {
    return KNOWN_LOCATION_COORDINATES['mau'];
  }

  return null;
};

/**
 * Checks if a partner's registered categories match the requested customer service
 */
export const isPartnerCategoryMatch = (
  partnerCategories: string[] | undefined | null,
  requestedCategory?: string | null,
  subServiceName?: string | null,
  cartItems?: any[] | null
): boolean => {
  if (!partnerCategories || partnerCategories.length === 0) {
    // If partner has no category restrictions, consider them a match
    return true;
  }

  const pCats = partnerCategories.map(c => c.toLowerCase().trim());
  const req = (requestedCategory || '').toLowerCase().trim();
  const sub = (subServiceName || '').toLowerCase().trim();

  // Helper to check match
  const matchCategory = (target: string): boolean => {
    if (!target) return false;
    const t = target.toLowerCase();

    // 1. Direct equality or inclusion
    if (pCats.some(pc => pc === t || pc.includes(t) || t.includes(pc))) return true;

    // 2. AC matching
    if (t.includes('ac') || t.includes('aircon') || t.includes('air condition')) {
      if (pCats.some(pc => pc.includes('ac') || pc.includes('aircon'))) return true;
    }

    // 3. Cleaning matching
    if (t.includes('clean') || t.includes('sofa') || t.includes('bathroom') || t.includes('kitchen') || t.includes('deep clean')) {
      if (pCats.some(pc => pc.includes('clean'))) return true;
    }

    // 4. Electrical matching
    if (t.includes('electr') || t.includes('wiring') || t.includes('inverter') || t.includes('switch') || t.includes('fan')) {
      if (pCats.some(pc => pc.includes('electr'))) return true;
    }

    // 5. Plumbing matching
    if (t.includes('plumb') || t.includes('water tank') || t.includes('pipe') || t.includes('tap') || t.includes('leakage')) {
      if (pCats.some(pc => pc.includes('plumb'))) return true;
    }

    // 6. Appliances matching
    if (
      t.includes('appliance') || t.includes('washing') || t.includes('refrigerator') ||
      t.includes('fridge') || t.includes('purifier') || t.includes('geyser') ||
      t.includes('microwave') || t.includes('chimney') || t.includes('tv') || t.includes('television')
    ) {
      if (pCats.some(pc => 
        pc.includes('appliance') || pc.includes('washing') || pc.includes('fridge') ||
        pc.includes('refrigerator') || pc.includes('purifier') || pc.includes('geyser') ||
        pc.includes('microwave') || pc.includes('chimney') || pc.includes('tv')
      )) {
        return true;
      }
    }

    return false;
  };

  if (matchCategory(req)) return true;
  if (matchCategory(sub)) return true;

  if (cartItems && Array.isArray(cartItems)) {
    for (const item of cartItems) {
      if (matchCategory(item.categoryName || item.name)) return true;
    }
  }

  return false;
};
