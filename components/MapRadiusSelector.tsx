import React, { useState, useEffect, } from 'react';
import { Loader2, Navigation, AlertCircle, MapPin, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Component to dynamically fit bounds to the circle radius
const MapBoundsFitter = ({ center, radius }: { center: [number, number]; radius: number }) => {
  const map = useMap();
  useEffect(() => {
    if (center && radius) {
      const latLng = L.latLng(center[0], center[1]);
      const bounds = latLng.toBounds(radius * 1000); // radius is in km, toBounds needs meters
      map.fitBounds(bounds, { animate: false });
    }
  }, [center, radius, map]);
  return null;
};

interface PostOffice {
  Name: string;
  District: string;
  State: string;
  Pincode: string;
}

interface MapRadiusSelectorProps {
  onPincodesFound: (pincodes: string[]) => void;
}

export const MapRadiusSelector: React.FC<MapRadiusSelectorProps> = ({ onPincodesFound }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PostOffice[]>([]);
  const [searchError, setSearchError] = useState('');

  const [selectedPO, setSelectedPO] = useState<PostOffice | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState<number>(5); // default 5km
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isFetchingOverpass, setIsFetchingOverpass] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);
    
    try {
      const isNumeric = /^\d+$/.test(searchQuery.trim());
      const endpoint = isNumeric 
        ? `https://api.postalpincode.in/pincode/${searchQuery.trim()}`
        : `https://api.postalpincode.in/postoffice/${searchQuery.trim()}`;
        
      const res = await fetch(endpoint);
      const textRes = await res.text();
      let data;
      try {
        data = JSON.parse(textRes);
      } catch {
        console.warn("Failed to parse response as JSON.");
        throw new Error("Invalid response from Overpass API");
      }
      
      if (data && data[0] && data[0].Status === 'Success') {
        setSearchResults(data[0].PostOffice || []);
      } else {
        setSearchError('No results found. Try a different name or valid 6-digit pincode.');
      }
    } catch (err) {
      console.warn(err);
      setSearchError('Failed to search. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  const geocodeAddress = async (po: PostOffice) => {
    setIsGeocoding(true);
    setGeocodeError('');
    
    const cleanName = po.Name.replace(/\s*\(.*?\)\s*/g, '').replace(/B\.O|S\.O|H\.O|Branch Office|Sub Office|Head Office/g, '').trim();
    const query1 = `${cleanName}, ${po.District}, ${po.State}, India`;
    const query2 = `${po.District}, ${po.State}, India`;
    
    try {
      // Primary Geocoding
      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query1)}`);
      let textRes = await res.text();
      let data;
      try {
        data = JSON.parse(textRes);
      } catch {
        console.warn("Nominatim primary failed:", textRes);
        data = [];
      }
      
      if (!data || data.length === 0) {
        // Fallback Geocoding
        console.warn(`Could not geocode specific name: ${query1}, falling back to: ${query2}`);
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query2)}`);
        textRes = await res.text();
        try {
          data = JSON.parse(textRes);
        } catch {
          console.warn("Nominatim fallback failed:", textRes);
          data = [];
        }
      }
      
      if (data && data.length > 0) {
        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        setGeocodeError('Could not find location coordinates on the map. Please try a different post office.');
      }
    } catch (err) {
      console.warn(err);
      setGeocodeError('Geocoding failed due to network error.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectPO = (po: PostOffice) => {
    setSelectedPO(po);
    setShowMapModal(true);
    setMapCenter(null);
    geocodeAddress(po);
  };

  const handleFindPincodes = async () => {
    if (!mapCenter) return;
    setIsFetchingOverpass(true);
    
    try {
      const radiusInMeters = radius * 1000;
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="post_office"](around:${radiusInMeters},${mapCenter[0]},${mapCenter[1]});
          node["postal_code"](around:${radiusInMeters},${mapCenter[0]},${mapCenter[1]});
        );
        out body;
      `;
      
      const endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass.openstreetmap.ru/api/interpreter'
      ];
      
      let textRes2 = '';
      let fetchSuccess = false;
      
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            body: 'data=' + encodeURIComponent(overpassQuery.trim()),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });
          if (res.ok) {
            textRes2 = await res.text();
            
            // Basic validation to see if it's an HTML error page from overpass
            if (!textRes2.includes('OSM3S Response') && !textRes2.includes('runtime error') && !textRes2.includes('<html')) {
              fetchSuccess = true;
              break;
            }
          }
        } catch {
          console.warn("Overpass endpoint failed:", endpoint, e);
        }
      }
      
      if (!fetchSuccess) {
        throw new Error("All Overpass endpoints failed or returned errors.");
      }
      let data;
      const pincodes = new Set<string>();
      if (selectedPO) {
          pincodes.add(selectedPO.Pincode);
      }
      try {
        data = JSON.parse(textRes2);
      } catch {
        console.warn("Failed to parse response as JSON.");
        console.warn("Overpass API failed. Falling back to selected Pincode only.");
        onPincodesFound(Array.from(pincodes));
        setShowMapModal(false);
        setIsFetchingOverpass(false);
        return;
      }
      
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
      
      onPincodesFound(Array.from(pincodes));
      setShowMapModal(false);
      
    } catch (err) {
      console.warn(err);
      // Fallback
      if (selectedPO) {
        onPincodesFound([selectedPO.Pincode]);
        setShowMapModal(false);
      } else {
        alert('Failed to fetch nearby pincodes. Please try again later.');
      }
    } finally {
      setIsFetchingOverpass(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search Post Office name or 6-digit Pincode..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center min-w-[100px]"
        >
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
        </button>
      </div>
      
      {searchError && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-sm mb-4">
          <AlertCircle className="w-4 h-4" />
          <p>{searchError}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
        {searchResults.map((po, idx) => (
          <div key={`${po.Name}-${idx}`} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:border-indigo-300 transition-colors flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">{po.Name}</h4>
              <div className="flex items-center text-xs text-gray-500 gap-1 mb-1">
                <MapPin className="w-3 h-3" />
                <span>{po.District}, {po.State}</span>
              </div>
              <div className="inline-block bg-gray-100 text-gray-700 text-xs font-mono px-2 py-0.5 rounded mt-1 mb-3">
                {po.Pincode}
              </div>
            </div>
            <button
              onClick={() => handleSelectPO(po)}
              className="w-full bg-slate-800 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3 h-3" /> Select Radius
            </button>
          </div>
        ))}
      </div>

      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fadeIn">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800">Select Service Radius</h3>
                <p className="text-xs text-gray-500">Define how far you can travel for service from {selectedPO?.Name} ({selectedPO?.Pincode})</p>
              </div>
              <button 
                onClick={() => setShowMapModal(false)}
                className="text-gray-400 hover:text-gray-700 bg-white shadow-sm border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-4">
              {isGeocoding ? (
                <div className="flex-1 min-h-[300px] bg-slate-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                  <p className="text-sm">Locating on map...</p>
                </div>
              ) : geocodeError ? (
                <div className="flex-1 min-h-[300px] bg-red-50 rounded-xl border border-red-100 flex flex-col items-center justify-center text-red-600 p-6 text-center">
                  <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                  <p>{geocodeError}</p>
                </div>
              ) : mapCenter ? (
                <div className="flex flex-col gap-4">
                  <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 z-0">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={mapCenter} />
                      <Circle 
                        center={mapCenter} 
                        radius={radius * 1000} 
                        pathOptions={{ color: '#4f46e5', fillColor: '#4f46e5', fillOpacity: 0.15, weight: 2 }} 
                      />
                      <MapBoundsFitter center={mapCenter} radius={radius} />
                    </MapContainer>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3">
                    <label className="text-sm font-bold text-gray-700 flex justify-between">
                      <span>Search Radius</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{radius} km</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="50" 
                      step="1"
                      value={radius} 
                      onChange={(e) => setRadius(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  
                  <button
                    onClick={handleFindPincodes}
                    disabled={isFetchingOverpass}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isFetchingOverpass ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Scanning Area for Pincodes...</>
                    ) : (
                      <><Navigation className="w-5 h-5" /> Find Pincodes in {radius}km Radius</>
                    )}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
