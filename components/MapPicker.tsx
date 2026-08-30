import React, { useState, useEffect, } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { X, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fix Leaflet marker icons issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const MapPicker: React.FC<MapPickerProps> = ({ isOpen, onClose, onConfirm, initialLat, initialLng }) => {
  const [position, setPosition] = useState<[number, number]>([initialLat || 20.5937, initialLng || 78.9629]);
  const [loading, setLoading] = useState(false);

  const handleCurrentLocation = () => {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
            setPosition([pos.coords.latitude, pos.coords.longitude]);
            setLoading(false);
        },
        (err) => {
            console.error(err);
            setLoading(false);
            if (!initialLat) {
               // Default to India Center if error and no initial
               setPosition([20.5937, 78.9629]);
            }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
  };

  useEffect(() => {
    if (isOpen) {
       if (initialLat && initialLng) {
           
           if (!position || position[0] !== initialLat || position[1] !== initialLng) {
               setPosition([initialLat, initialLng]);
           }
       } else {
           handleCurrentLocation();
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialLat, initialLng]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-950/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[800px]"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tight">Pinpoint Exact Location</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Tap on the map to adjust the pin precisely</p>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 relative z-10">
                <MapContainer center={position} zoom={initialLat ? 18 : 5} className="h-full w-full">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}></Marker>
                    <MapEvents onLocationSelect={(lat, lng) => setPosition([lat, lng])} />
                </MapContainer>
                
                <button 
                  onClick={handleCurrentLocation}
                  disabled={loading}
                  className="absolute bottom-6 right-6 z-[1000] bg-white p-4 rounded-full shadow-xl border border-gray-100 text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="My Location"
                >
                    <Navigation size={24} className={loading ? 'animate-spin opacity-50' : ''} />
                </button>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
               <button 
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors"
               >
                   Cancel
               </button>
               <button 
                  onClick={() => onConfirm(position[0], position[1])}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 transition-colors"
               >
                   Confirm Location
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
