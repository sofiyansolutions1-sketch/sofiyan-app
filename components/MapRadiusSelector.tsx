import React, { useState, useEffect } from 'react';
import { Loader2, Navigation, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAreasByPincode } from '../services/pincodeService';

// Fix default Leaflet marker icon
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Helper to reliably extract area / locality, city, pincode, and address from reverse geocoding
async function parseGeocodedAddress(geoData: any): Promise<{ address: string; city: string; area: string; pincode: string }> {
  if (!geoData) {
    return { address: '', city: '', area: '', pincode: '' };
  }

  const addr = geoData.address || {};
  const detectedAddress = geoData.display_name || '';

  // Extract 6-digit pincode
  let detectedPincode = addr.postcode || '';
  const pinMatch = (detectedPincode || detectedAddress).match(/\b\d{6}\b/);
  if (pinMatch) {
    detectedPincode = pinMatch[0];
  }

  // Extract City
  const detectedCity =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    addr.state_district ||
    '';

  // Extract Area / Locality from all possible OSM address hierarchy levels
  let detectedArea =
    addr.suburb ||
    addr.neighbourhood ||
    addr.residential ||
    addr.subdivision ||
    addr.subdistrict ||
    addr.city_district ||
    addr.quarter ||
    addr.district ||
    addr.hamlet ||
    addr.village ||
    addr.town ||
    addr.locality ||
    addr.road ||
    addr.municipality ||
    '';

  // If detectedArea is missing or generic, try India Post Postal API via fetchAreasByPincode
  if ((!detectedArea || detectedArea.trim() === '') && detectedPincode && detectedPincode.length === 6) {
    try {
      const areaRes = await fetchAreasByPincode(detectedPincode);
      if (areaRes && areaRes.success && areaRes.areas && areaRes.areas.length > 0) {
        detectedArea = areaRes.areas[0];
      }
    } catch (e) {
      console.warn("India Post fallback error:", e);
    }
  }

  // If still empty, parse leading components from display_name (e.g. "Ghosi, Mau, Uttar Pradesh, 275301, India")
  if (!detectedArea || detectedArea.trim() === '') {
    if (detectedAddress) {
      const segments = detectedAddress
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);

      const filtered = segments.filter(
        (s: string) =>
          !s.toLowerCase().includes('india') &&
          !s.toLowerCase().includes('uttar pradesh') &&
          !s.toLowerCase().includes('maharashtra') &&
          !s.toLowerCase().includes('karnataka') &&
          !s.toLowerCase().includes('delhi') &&
          !s.toLowerCase().includes('tamil nadu') &&
          !s.toLowerCase().includes('west bengal') &&
          !s.toLowerCase().includes('rajasthan') &&
          !s.toLowerCase().includes('gujarat') &&
          !s.toLowerCase().includes('telangana') &&
          !s.toLowerCase().includes('bihar') &&
          !s.toLowerCase().includes('madhya pradesh') &&
          !/^\d{6}$/.test(s)
      );

      if (filtered.length > 0) {
        detectedArea = filtered[0];
      } else if (segments.length > 0) {
        detectedArea = segments[0];
      }
    }
  }

  return {
    address: detectedAddress,
    city: detectedCity,
    area: detectedArea,
    pincode: detectedPincode
  };
}

// Component to dynamically fit bounds to the circle radius
const MapBoundsFitter = ({ center, radius }: { center: [number, number]; radius: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center && radius) {
      // Add a slight delay to let the modal animation complete and container size to compute
      const timer = setTimeout(() => {
        map.invalidateSize(); // Fixes Leaflet rendering in a newly opened modal
        const latLng = L.latLng(center[0], center[1]);
        const bounds = latLng.toBounds(radius * 1000); // radius is in km, toBounds needs meters
        map.fitBounds(bounds, { animate: true, maxZoom: 15 });
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [center, radius, map]);
  return null;
};

interface MapRadiusSelectorProps {
  onPincodesFound: (pincodes: string[], lat?: number, lng?: number, radius?: number, addressDetails?: { address: string; city: string; area: string; pincode: string }) => void;
  onLocationDetected?: (lat: number, lng: number, addressDetails?: { address: string; city: string; area: string; pincode: string }) => void;
}

export const MapRadiusSelector: React.FC<MapRadiusSelectorProps> = ({ onPincodesFound, onLocationDetected }) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState<number>(5); // default 5km
  const [isFetchingOverpass, setIsFetchingOverpass] = useState(false);
  
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      alert("Location tracking is not supported by your browser.");
      return;
    }
    
    setIsAutoDetecting(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMapCenter([lat, lng]);
        setRadius(5); // default to 5
        setShowMapModal(true);
        setIsAutoDetecting(false);
        
        if (onLocationDetected) {
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
              { headers: { 'User-Agent': 'sofiyan-home-service/1.0.0' } }
            );
            const geoData = await geoRes.json();
            const addressDetails = await parseGeocodedAddress(geoData);
            onLocationDetected(lat, lng, addressDetails);
          } catch (err) {
            console.warn("Reverse geocoding failed during auto-detect", err);
            onLocationDetected(lat, lng);
          }
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to fetch exact location. Please ensure location permissions are granted and GPS is turned on.");
        setIsAutoDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleFindPincodes = async () => {
    if (!mapCenter) return;
    setIsFetchingOverpass(true);
    
    const [lat, lng] = mapCenter;
    // Bounding box for overpass query based on radius
    // 1 deg lat is approx 111 km. 1 deg lng is approx 111 * cos(lat) km.
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos(lat * Math.PI / 180));
    
    const s = lat - latDelta;
    const n = lat + latDelta;
    const w = lng - lngDelta;
    const e = lng + lngDelta;

    const query = `
      [out:json][timeout:25];
      (
        node["postal_code"](${s},${w},${n},${e});
        way["postal_code"](${s},${w},${n},${e});
        relation["postal_code"](${s},${w},${n},${e});
        
        node["addr:postcode"](${s},${w},${n},${e});
        way["addr:postcode"](${s},${w},${n},${e});
        relation["addr:postcode"](${s},${w},${n},${e});
      );
      out tags;
    `;

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      
      const data = await res.json();
      const pincodes = new Set<string>();
      
      
      if (data && data.elements) {
        data.elements.forEach((el: any) => {
          const p = el.tags?.postal_code || el.tags?.['addr:postcode'];
          if (p) {
            const match = p.match(/\b\d{6}\b/);
            if (match) {
              pincodes.add(match[0]);
            }
          }
        });
      }
      
      let addressDetails = undefined;
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { 'User-Agent': 'sofiyan-home-service/1.0.0' } }
        );
        const geoData = await geoRes.json();
        addressDetails = await parseGeocodedAddress(geoData);
        if (addressDetails.pincode) {
          pincodes.add(addressDetails.pincode);
        }
      } catch (err) {
        console.warn("Reverse geocoding failed", err);
      }
      
      onPincodesFound(Array.from(pincodes), mapCenter[0], mapCenter[1], radius, addressDetails);

      setShowMapModal(false);
      
    } catch (err) {
      console.warn(err);
      // Fallback if overpass fails
      onPincodesFound([], mapCenter[0], mapCenter[1], radius);
      setShowMapModal(false);
    } finally {
      setIsFetchingOverpass(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleAutoDetect}
        disabled={isAutoDetecting}
        className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
      >
        {isAutoDetecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
        {isAutoDetecting ? 'Detecting Location...' : 'Use Current Location'}
      </button>

      {showMapModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10 relative">
              <div>
                <h3 className="font-black text-slate-900 text-xl sm:text-2xl tracking-tight flex items-center gap-2">
                  <MapPin className="text-indigo-600" />
                  Service Area Map
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Adjust your operational radius around your location</p>
              </div>
              <button 
                 type="button"
                 onClick={() => setShowMapModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full w-10 h-10 flex items-center justify-center font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row h-full min-h-[400px] md:min-h-[500px]">
              {/* Map Area */}
              <div className="flex-1 relative h-[300px] md:h-auto bg-slate-100">
                {mapCenter && (
                  <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    {/* Esri World Imagery (Satellite) for a 3D-like rich view */}
                    <TileLayer
                      attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    {/* Overlay labels for satellite */}
                    <TileLayer
                      attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    />
                    
                    <Marker position={mapCenter} />
                    <Circle 
                       center={mapCenter} 
                       radius={radius * 1000} 
                       pathOptions={{ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.25, weight: 3 }} 
                     />
                    <MapBoundsFitter center={mapCenter} radius={radius} />
                  </MapContainer>
                )}
                
                {/* Floating overlay for radius display */}
                <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-white/20">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-0.5">Current Radius</p>
                  <p className="text-2xl font-black text-indigo-600">{radius} <span className="text-sm text-indigo-400">km</span></p>
                </div>
              </div>
              
              {/* Controls Area */}
              <div className="w-full md:w-80 bg-white p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] z-10">
                <div className="space-y-6">
                    <div>
                        <label className="flex justify-between items-center mb-3">
                          <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Adjust Range</span>
                        </label>
                        <input 
                           type="range" 
                           min="5" 
                           max="10" 
                           step="1"
                           value={radius} 
                           onChange={(e) => setRadius(parseInt(e.target.value))}
                           className="w-full h-3 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                            <span>5 km</span>
                            <span>10 km</span>
                        </div>
                    </div>
                    
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                        <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                            We will automatically match you with customer bookings within a <strong>{radius}km</strong> radius of your current location.
                        </p>
                    </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleFindPincodes}
                  disabled={isFetchingOverpass}
                  className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200/50 flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  {isFetchingOverpass ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                  ) : (
                    <><Navigation className="w-4 h-4" /> Confirm & Save</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
