import { Service } from './types';
import { 
  Wrench, Zap, Droplet, PaintBucket, Wind, Disc, Snowflake, 
  Flame, Filter, Sparkles, Cloud, Tv, Video 
} from 'lucide-react';

export const BUSINESS_NAME = "Sofiyan Home Service";
export const HELPLINE = "9219345455";
export const EMAIL = "sofiyansolutions1@gmail.com";
export const ADMIN_PASSWORD = "ta7867@#";

// Custom Image Mapping
export const CATEGORY_IMAGES: Record<string, string> = {
  "Electrician": "https://i.postimg.cc/dts84RjY/Whats-App-Image-2026-01-13-at-1-49-19-AM.jpg",
  "Plumbing": "https://i.postimg.cc/MKLvV1P8/Whats-App-Image-2026-01-13-at-1-01-12-AM.jpg",
  "AC Repair": "https://i.postimg.cc/B6ZqdvYF/Whats-App-Image-2026-01-12-at-11-13-39-PM.jpg",
  "Appliances": "https://i.postimg.cc/Jhx8cLrX/Whats-App-Image-2026-01-12-at-10-43-01-PM-(1).jpg",
  "Cleaning": "https://i.postimg.cc/7L2sw1cy/Whats-App-Image-2026-01-12-at-11-52-39-PM.jpg",
  "Pest Control": "https://i.postimg.cc/25Shrn5Z/Whats-App-Image-2026-01-13-at-1-49-20-AM.jpg",
  "Television": "https://i.postimg.cc/Ss5hbvjM/Chat-GPT-Image-Mar-26-2026-07-07-43-PM.png",
};

// Real Database Data
export const DB_DATA = {
  Services: {
    "Electrician": [
      {name: "Switchbox installation", price: 189},
      {name: "AC switchbox installation", price: 189},
      {name: "Switch board installation", price: 279},
      {name: "Smart switch installation", price: 299},
      {name: "Smart appliance controller", price: 249},
      {name: "Wi-Fi smart switch installation", price: 239},
      {name: "Switch / Socket replacement", price: 149},
      {name: "Switch board / switchbox repair", price: 179},
      {name: "Fan uninstallation (any type)", price: 180},
      {name: "Fan replacement (any type)", price: 299},
      {name: "Fan repair (any type)", price: 349},
      {name: "Fan regulator repair/replacement", price: 180},
      {name: "Fan installation", price: 249},
      {name: "Bulb/tubelight holder install", price: 149},
      {name: "CFL to LED replacement", price: 229},
      {name: "Decorative lights install (per 5m)", price: 109},
      {name: "Light uninstallation (per light)", price: 129},
      {name: "Chandelier installation", price: 649},
      {name: "Wall ceiling light installation", price: 149},
      {name: "New external wiring (per 5m)", price: 109},
      {name: "New internal wiring (per 5m)", price: 249},
      {name: "Doorbell installation", price: 199},
      {name: "Doorbell replacement", price: 199},
      {name: "Single-Pole MCB installation", price: 179},
      {name: "Double-pole MCB installation", price: 229},
      {name: "MCB / fuse replacement", price: 180},
      {name: "Sub-meter installation", price: 349},
      {name: "3-phase changeover switch", price: 349},
      {name: "Inverter installation", price: 699},
      {name: "Inverter uninstallation", price: 499},
      {name: "Stabilizer installation", price: 229},
      {name: "Inverter fuse replacement", price: 169},
      {name: "Inverter servicing", price: 349},
      {name: "Inverter repair", price: 299},
      {name: "Book a Consultation", price: 199}
    ],
    "Plumbing": [
      {name: "Bath accessory installation", price: 249},
      {name: " pipe blockage repair", price: 399},
      {name: "Shower installation", price: 249},
      {name: "Wash basin installation", price: 499},
      {name: "Waste pipe replacement", price: 249},
      {name: "Sink drainage removal", price: 249},
      {name: "Waste coupling installation", price: 199},
      {name: "Bathroom tile grouting", price: 999},
      {name: "Shower filter installation", price: 249},
      {name: "Washing machine filter install", price: 249},
      {name: "Drainage cover installation", price: 249},
      {name: "Bathroom drainage removal", price: 399},
      {name: "Balcony drainage removal", price: 309},
      {name: "Toilet seat cover replacement", price: 199},
      {name: "Flush tank repair (external pvc)", price: 199},
      {name: "Flush tank repair (concealed)", price: 249},
      {name: "Flush tank repair (ext ceramic)", price: 349},
      {name: "Western toilet repair (floor)", price: 799},
      {name: "Toilet pipe blockage removal", price: 1299},
      {name: "Jet spray installation", price: 199},
      {name: "Western toilet replacement", price: 1699},
      {name: "Indian toilet installation", price: 1699},
      {name: "Flush tank replacement", price: 549},
      {name: "Western toilet installation", price: 1499},
      {name: "Tap repair", price: 149},
      {name: "Geyser Water Pipe Fix", price: 249},
      {name: "Water mixer tap repair", price: 299},
      {name: "Tap installation", price: 149},
      {name: "Water mixer installation", price: 399},
      {name: "Water nozzle installation", price: 149},
      {name: "Tap replacement", price: 149},
      {name: "Water tank repair", price: 249},
      {name: "Overhead water tank installation", price: 649},
      {name: "Water tank cleaning (left placed)", price: 1099},
      {name: "Overhead tank cleaning", price: 649},
      {name: "Underground tank cleaning", price: 1299},
      {name: "Pipeline leakage repair", price: 299},
      {name: "Water meter installation", price: 399},
      {name: "Motor air cavity removal", price: 199},
      {name: "Motor installation/replacement", price: 449},
      {name: "Washing machine inlet install", price: 200},
      {name: "Connecting hose installation", price: 199},
      {name: "Plumber consultation", price: 149}
    ],
    "AC": [
      {name: "AC Basic Check-up/Cooling Issue", price: 199},
      {name: "AC Basic Repair (Minor/Gas Check)", price: 399}, 
      {name: "Premium AC Service (Split)", price: 599},
      {name: "Premium AC Service (Window)", price: 449},
      {name: "Lite ac service", price: 499},
      {name: "Front-jet AC Deep Cleaning", price: 599},
      {name: "AC Less/No Cooling Repair", price: 299},
      {name: "AC Power Issue Repair", price: 499},
      {name: "Full Gas Refill", price: 2599},
      {name: "AC Installation – Split", price: 1499},
      {name: "AC Uninstallation – Split", price: 649},
      {name: "AC Installation – Window", price: 799},
      {name: "AC Uninstallation – Window", price: 649},
      {name: "Copper Pipe Fitting (per foot)", price: 50},
      {name: "AC Water Leakage Repair", price: 599},
      {name: "AC Noise / Smell Repair", price: 499},
      {name: "Stabilizer Connection/Wiring", price: 299},
      {name: "PCB Repair Labor", price: 499},
      {name: "Compressor Relay/Capacitor", price: 299},
      {name: "AC Shifting (same site)", price: 1299},
      {name: "AC Shifting (new location)", price: 1699},
      {name: "Book a Consultation", price: 249}
    ],
    "WashingMachine": [
      {name: "Auto Top Load Checkup", price: 149},
      {name: "Auto Front Load Checkup", price: 249},
      {name: "Washing Machine Deep-Cleaning", price: 349},
      {name: "Semi Auto Checkup", price: 249},
      {name: "Washing machine servicing", price: 399},
      {name: "Basic Check-up/Error/Water", price: 349},
      {name: "Drain/Inlet Valve Clean/Replace", price: 349},
      {name: "Spin / Drum Jam Fix", price: 399},
      {name: "Door Lock / Sensor Fix", price: 349},
      {name: "Display/Panel/Buttons Diagnosis", price: 299},
      {name: "PCB Fault Diagnosis", price: 299},
      {name: "PCB Repair Labor", price: 499},
      {name: "Water Leakage Fix", price: 349},
      {name: "Bearing Replacement Labor", price: 699},
      {name: "Shock Absorber Replace Labor", price: 499},
      {name: "Clutch Plate/Coupling Labor", price: 499},
      {name: "Motor Repair/Replacement", price: 599},
      {name: "Heating System/Dryer Fix", price: 399},
      {name: "Drum Removal & Refitting", price: 699},
      {name: "Outer Tub/Drum Replace Labor", price: 999},
      {name: "Drain Pump Replace Labor", price: 399},
      {name: "Installation – Front Load", price: 399},
      {name: "Installation – Top Load", price: 399},
      {name: "Uninstallation – Front Load", price: 349},
      {name: "Uninstallation – Top Load", price: 349},
      {name: "Water Inlet + Drain Setup", price: 299},
      {name: "Book a Consultation", price: 199}
    ],
    "Refrigerator": [
      {name: "Power Issue", price: 349},
      {name: "Refrigerator Deep Cleaning", price: 349},
      {name: "Excess Cooling", price: 349},
      {name: "No Cooling", price: 349},
      {name: "Noise Issue", price: 349},
      {name: "Water Leakage", price: 349},
      {name: "Less Cooling", price: 349},
      {name: "Compartment Water Leakage", price: 349},
      {name: "Door Issue", price: 349}
    ],
    "Geyser": [
        {name: "Geyser Check-up", price: 249},
        {name: "Geyser Repair", price: 349},
        {name: "Geyser Service", price: 599},
        {name: "Geyser Deep Cleaning", price: 349},
        {name: "Geyser Installation", price: 499},
        {name: "Geyser Uninstallation", price: 399}
    ],
    "WaterPurifier": [
        {name: "Water purifier check-up", price: 199},
        {name: "Filter check-up", price: 199},
        {name: "Water purifier installation", price: 449},
        {name: "Water purifier uninstallation", price: 349}
    ],
    "Cleaning": [
        {name: "Full Home 1BHK", price: 3499},
        {name: "Full Home 2BHK", price: 3899},
        {name: "Full Home 3BHK", price: 4799},
        {name: "Full Home 4BHK", price: 6199},
        {name: "Full Home 5BHK", price: 7299},
        {name: "Unfurnished Full Home 1BHK", price: 3079},
        {name: "Unfurnished Full Home 2BHK", price: 3699},
        {name: "Unfurnished Full Home 3BHK", price: 4499},
        {name: "Unfurnished Full Home 4BHK", price: 5699},
        {name: "Unfurnished Full Home 5BHK", price: 6599},
        {name: "Furnished Bungalow Cleaning (1000-2000 sqft)", price: 5179},
        {name: "Furnished Bungalow Cleaning (2000-3000 sqft)", price: 8099},
        {name: "Furnished Bungalow Cleaning (3000-4000 sqft)", price: 10879},
        {name: "Furnished Bungalow Cleaning (4000-5000 sqft)", price: 12899},
        {name: "Furnished Bungalow Cleaning (5000-6000 sqft)", price: 15839},
        {name: "UnFurnished Bungalow Cleaning (1000-2000 sqft)", price: 4899},
        {name: "UnFurnished Bungalow Cleaning (2000-3000 sqft)", price: 7899},
        {name: "UnFurnished Bungalow Cleaning (3000-4000 sqft)", price: 10499},
        {name: "UnFurnished Bungalow Cleaning (4000-5000 sqft)", price: 12659},
        {name: "UnFurnished Bungalow Cleaning (5000-6000 sqft)", price: 15579},
        {name: "Kitchen Deep Cleaning", price: 1599},
        {name: "Chimney Outer Cleaning", price: 899},
        {name: "Chimney Full Deep Cleaning", price: 1300},
        {name: "Bathroom Deep Cleaning", price: 549},
        {name: "Toilet Cleaning Only", price: 499},
        {name: "Utensil Removal & Replacement", price: 399},
        {name: "Fridge Inside Cleaning", price: 249},
        {name: "Microwave Inside Cleaning", price: 149},
        {name: "Sofa Cleaning (3 seats)", price: 499},
        {name: "Sofa Cleaning (4 seats)", price: 649},
        {name: "Sofa Cleaning (5 seats)", price: 749},
        {name: "Sofa Cleaning (6 seats)", price: 899},
        {name: "Sofa Cleaning (7 seats)", price: 999},
        {name: "Sofa Cleaning (8 seats)", price: 1149},
        {name: "Sofa Cleaning (9 seats)", price: 1249},
        {name: "Sofa Cleaning (10 seats)", price: 1349},
        {name: "Sofa Cleaning (11 seats)", price: 1599},
        {name: "Sofa Cleaning (12 seats)", price: 1699},
        {name: "Carpet Cleaning Extra Small (upto 25 sq ft)", price: 399},
        {name: "Carpet Cleaning Small (upto 25-50 sq ft)", price: 599},
        {name: "Carpet Cleaning Medium (upto 50-100 sq ft)", price: 799},
        {name: "Carpet Cleaning Large (upto 100-150 sq ft)", price: 949},
        {name: "Carpet Cleaning Extra Large (upto 150-200 sq ft)", price: 1099},
        {name: "Dining table & chairs cleaning (4 Seats)", price: 299},
        {name: "Dining table & chairs cleaning (5 Seats)", price: 349},
        {name: "Dining table & chairs cleaning (6 Seats)", price: 399},
        {name: "Dining table & chairs cleaning (7 Seats)", price: 449},
        {name: "Dining table & chairs cleaning (8 Seats)", price: 499},
        {name: "Dining table & chairs cleaning (9 Seats)", price: 549},
        {name: "Dining table & chairs cleaning (10 Seats)", price: 599},
        {name: "Mattress Single Bed", price: 399},
        {name: "Mattress Double Bed", price: 699},
        {name: "Window Glass Cleaning (per window)", price: 149},
        {name: "Balcony Cleaning", price: 599},
        {name: "Washing Machine Drum Clean", price: 249},
        {name: "Wardrobe Cleaning (per unit)", price: 299},
        {name: "Water Tank Cleaning (1000L)", price: 749},
        {name: "Water Tank Cleaning (2000L)", price: 1299},
        {name: "Consultation", price: 249}
    ],
    "Chimney": [
        {name: "Deep Service (2 visits)", price: 1200},
        {name: "Chimney Repair", price: 449},
        {name: "Basic Chimney Service", price: 999},
        {name: "Deep Chimney Service", price: 1099},
        {name: "Chimney Installation", price: 599},
        {name: "Chimney Uninstallation", price: 449}
    ],
    "TV": [
        {name: "TV Check-up", price: 199},
        {name: "TV Installation", price: 399},
        {name: "TV Uninstallation", price: 349}
    ],
    "CCTV": [
        {name: "CCTV Install (1 Camera)", price: 299},
        {name: "CCTV Install (2 Cameras)", price: 599},
        {name: "CCTV Install (4 Cameras)", price: 1199},
        {name: "CCTV Install (8 Cameras)", price: 2399},
        {name: "CCTV Install (16 Cameras)", price: 4499},
        {name: "Camera Replace/Unmount", price: 249},
        {name: "DVR/NVR Config", price: 499},
        {name: "Mobile App Config", price: 299},
        {name: "Wire Routing (per cam)", price: 149},
        {name: "Joint/Connector Fix", price: 149},
        {name: "Power Supply Fix", price: 199},
        {name: "Full System Shifting (Same site)", price: 1499},
        {name: "Full System Shifting (New loc)", price: 1799},
        {name: "HDD Replacement", price: 299},
        {name: "Router/LAN Setup", price: 249},
        {name: "No Signal Diagnosis", price: 249},
        {name: "Complete Maintenance (4 cams)", price: 799},
        {name: "Cam Cleaning/Tightening", price: 49},
        {name: "Consultation", price: 249}
    ]
  }
};

// Metadata for styling (Fallbacks)
const CATEGORY_METADATA: Record<string, { icon: string, color: string, description: string }> = {
  "Electrician": { icon: 'Zap', color: 'bg-yellow-500', description: 'Expert electrical repairs & installs' },
  "Plumbing": { icon: 'Droplet', color: 'bg-blue-500', description: 'Leak fixes, pipes & fittings' },
  "AC Repair": { icon: 'Wind', color: 'bg-cyan-500', description: 'Cooling, repair & gas refill' },
  "Appliances": { icon: 'Disc', color: 'bg-indigo-500', description: 'Washer, Fridge, TV & more' },
  "Cleaning": { icon: 'Sparkles', color: 'bg-green-500', description: 'Deep home & tank cleaning' },
  "Pest Control": { icon: 'Sparkles', color: 'bg-red-500', description: 'Pest control services' },
  "Carpentry": { icon: 'Wrench', color: 'bg-orange-500', description: 'Woodwork & furniture repair' },
  "Painting": { icon: 'PaintBucket', color: 'bg-purple-500', description: 'Home painting & waterproofing' },
};

// Use window.masterServicesData if available, otherwise fallback to a default structure
const getMasterData = () => {
  if (typeof window !== 'undefined' && (window as any).masterServicesData) {
    return (window as any).masterServicesData;
  }
  return {
    "Cleaning": {},
    "Electrician": {},
    "Plumbing": {},
    "Appliances": {},
    "AC Repair": {},
    "Pest Control": {},
    "Carpentry": {},
    "Painting": {}
  };
};

// Transform masterServicesData into the application's Service structure
export const SERVICES: Service[] = Object.keys(getMasterData()).map((key) => {
  const categoryData = getMasterData()[key];
  
  // Flatten all sub-services for the search/grid functionality
  const allSubServices: any[] = [];
  Object.keys(categoryData).forEach(subcat => {
      categoryData[subcat].forEach((s: any) => {
          allSubServices.push({
              id: s.id || `${key}-${subcat}-${s.name}`.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
              name: s.name,
              price: s.price
          });
      });
  });

  return {
    id: key.toLowerCase().replace(/\s+/g, '-'),
    name: key,
    icon: CATEGORY_METADATA[key]?.icon || 'Wrench',
    image: CATEGORY_IMAGES[key] || 'https://images.unsplash.com/photo-1581578731117-104f2a41272c?auto=format&fit=crop&q=80',
    color: CATEGORY_METADATA[key]?.color || 'bg-gray-500',
    description: CATEGORY_METADATA[key]?.description || 'Professional Home Service',
    subServices: allSubServices
  };
});

export const getIcon = (name: string) => {
  switch (name) {
    case 'Droplet': return <Droplet className="w-8 h-8 text-white" />;
    case 'Zap': return <Zap className="w-8 h-8 text-white" />;
    case 'PaintBucket': return <PaintBucket className="w-8 h-8 text-white" />;
    case 'Wrench': return <Wrench className="w-8 h-8 text-white" />;
    case 'Wind': return <Wind className="w-8 h-8 text-white" />;
    case 'Disc': return <Disc className="w-8 h-8 text-white" />;
    case 'Snowflake': return <Snowflake className="w-8 h-8 text-white" />;
    case 'Flame': return <Flame className="w-8 h-8 text-white" />;
    case 'Filter': return <Filter className="w-8 h-8 text-white" />;
    case 'Sparkles': return <Sparkles className="w-8 h-8 text-white" />;
    case 'Cloud': return <Cloud className="w-8 h-8 text-white" />;
    case 'Tv': return <Tv className="w-8 h-8 text-white" />;
    case 'Video': return <Video className="w-8 h-8 text-white" />;
    default: return <Wrench className="w-8 h-8 text-white" />;
  }
};
