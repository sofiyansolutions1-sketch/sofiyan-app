const fs = require('fs');
let content = fs.readFileSync('components/MapRadiusSelector.tsx', 'utf8');

const oldModal = `{showMapModal && (
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
      )}`;

const newModal = `{showMapModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-fadeIn">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur">
              <div>
                <h3 className="font-black text-gray-900 text-lg sm:text-xl uppercase tracking-tighter">Select Service Radius</h3>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">From {selectedPO?.Name} ({selectedPO?.Pincode})</p>
              </div>
              <button 
                onClick={() => setShowMapModal(false)}
                className="text-gray-400 hover:text-gray-700 bg-white shadow-sm border border-gray-200 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
              {isGeocoding ? (
                <div className="flex-1 min-h-[300px] bg-slate-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-gray-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                  <p className="text-xs font-bold uppercase tracking-widest">Locating on map...</p>
                </div>
              ) : geocodeError ? (
                <div className="flex-1 min-h-[300px] bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-red-600 p-6 text-center">
                  <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm font-bold">{geocodeError}</p>
                </div>
              ) : mapCenter ? (
                <div className="flex flex-col gap-5 h-full">
                  <div className="h-[250px] sm:h-[400px] shrink-0 w-full rounded-2xl overflow-hidden border border-gray-200 z-0 shadow-inner relative">
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
                  
                  <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 flex flex-col gap-4">
                    <label className="flex justify-between items-center">
                      <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Search Radius</span>
                      <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-widest">{radius} km</span>
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
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                  >
                    {isFetchingOverpass ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Scanning Area for Pincodes...</>
                    ) : (
                      <><Navigation className="w-4 h-4 sm:w-5 sm:h-5" /> Find Pincodes in {radius}km Radius</>
                    )}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}`;

content = content.replace(oldModal, newModal);
fs.writeFileSync('components/MapRadiusSelector.tsx', content);
