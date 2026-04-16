import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const acRateList = [
  {
    category: "Electrical Parts",
    items: [
      { description: "Non-Inverter PCB repaired", charge: "₹1500" },
      { description: "Inverter PCB repaired", charge: "₹4500" },
      { description: "LVT (Transformer)", charge: "₹900", labour: "₹349 (Labour)" },
      { description: "Replace sensor", charge: "₹350", labour: "₹499 (Labour)" },
      { description: "Contactor replaced", charge: "₹500", labour: "₹499 (Labour)" },
      { description: "Contactor Daikin/ O-General", charge: "₹1500", labour: "₹449 (Labour)" },
      { description: "Convert PCB with remote", charge: "₹1500" },
      { description: "Fan Capacitor - 2.5 to 10 mfd", charge: "₹250", labour: "₹449 (Labour)" },
      { description: "Comp Capacitor - 25 to 60 mfd", charge: "₹400", labour: "₹449 (Labour)" },
      { description: "Combo Capacitor (Comp+Fan)", charge: "₹500", labour: "₹449 (Labour)" },
      { description: "Fuse Change in PCB", charge: "₹150", labour: "₹299 (Labour)" },
    ]
  },
  {
    category: "Gas Charging",
    items: [
      { description: "Gas Charging", charge: "₹2800" },
      { description: "Flair nut replaced", charge: "₹150" },
      { description: "Copper Coil Condensor 1 ton Split", charge: "₹4000" },
      { description: "Copper Coil Condensor 1.5 ton Split", charge: "₹4800" },
      { description: "Copper Coil Condensor 2 ton Split", charge: "₹5300" },
      { description: "Copper Cooling Coil (Split AC)", charge: "₹6500" },
      { description: "Capillary and filter replaced", charge: "₹350" },
      { description: "Compressor 0.8-1 ton", charge: "₹6500" },
      { description: "Compressor 1.5 ton", charge: "₹8500" },
      { description: "Compressor 2 ton", charge: "₹10000" },
      { description: "Expansion valve replaced", charge: "₹1200" },
      { description: "Copper Cooling Coil/Condensor Coil (Window AC)", charge: "₹5000" },
      { description: "Replacement Compressor (1 Ton)", charge: "₹4000" },
      { description: "Replacement Compressor (1.5 Ton)", charge: "₹4500" },
      { description: "Replacement Compressor (2 Ton)", charge: "₹5000" },
      { description: "Service valve replaced - 1/4", charge: "₹400" },
      { description: "Service valve replaced - 1/2", charge: "₹400" },
      { description: "Service valve replaced - 5/8", charge: "₹500" },
      { description: "Copper Cooling Coil (Split AC) - 1 Ton", charge: "₹5500" },
      { description: "Copper Cooling Coil (Split AC) - 1.5 Ton", charge: "₹6500" },
      { description: "Copper Cooling Coil (Split AC) - 2 Ton", charge: "₹7500" },
      { description: "Copper Cooling Coil (Split AC) O General & Mitshubishi - 1.5 Ton", charge: "₹7500" },
      { description: "Copper Cooling Coil/Condensor Coil (Window AC) - 1 Ton", charge: "₹4500" },
      { description: "Copper Cooling Coil/Condensor Coil (Window AC) - 1.5 Ton", charge: "₹5000" },
      { description: "Copper Cooling Coil/Condensor Coil (Window AC) - 2 Ton", charge: "₹5500" },
      { description: "Cooling coil repair with Anti-rust coating", charge: "₹899" },
      { description: "Left side U band replacement", charge: "₹1500" },
    ]
  },
  {
    category: "Fan Motors",
    items: [
      { description: "Fan motor - Split AC", charge: "₹1800", labour: "₹499 (Labour)" },
      { description: "Blower motor - Split AC", charge: "₹2200", labour: "₹499 (Labour)" },
      { description: "Blower replaced", charge: "₹1100", labour: "₹499 (Labour)" },
      { description: "Replace Flap/Swing Motor", charge: "₹400", labour: "₹499 (Labour)" },
      { description: "Motor Bearing Change", charge: "₹1000" },
      { description: "Fan motor - Window AC", charge: "₹2600", labour: "₹499 (Labour)" },
      { description: "Blower motor (DC) - Split AC", charge: "₹3800" },
      { description: "Fan motor (DC) - Split AC", charge: "₹3800" },
    ]
  },
  {
    category: "Service & Installation",
    items: [
      { description: "1 ft copper pipe set (insulation, wire per ft)", charge: "₹350" },
      { description: "Split AC Wall stand", charge: "₹750" },
      { description: "Outdoor unit reinstalled", charge: "₹799" },
      { description: "Indoor unit reinstalled", charge: "₹699" },
      { description: "Fastner complete set", charge: "₹200" },
      { description: "Floor stand", charge: "₹550" },
      { description: "Universal back plate", charge: "₹300" },
      { description: "Foam-jet AC service", charge: "₹599" },
      { description: "AC installation", charge: "₹1499" },
      { description: "AC uninstallation", charge: "₹699" },
      { description: "Anti-rust spray (avoid gas leak)", charge: "₹249" },
      { description: "Lite AC service", charge: "₹499" },
      { description: "Drain Pipe replacement (1m)", charge: "₹100" },
      { description: "3/4 Core Wire (per meter)", charge: "₹120" },
      { description: "Outdoor/Indoor Connector", charge: "₹150" },
    ]
  },
  {
    category: "Minor Repairs",
    items: [
      { description: "Water Leakage Repaired- Split AC", charge: "₹599" },
      { description: "Adjust Grill Locks", charge: "₹0", labour: "₹349 (Labour)" },
      { description: "Adjust pipe and tight compressor screw", charge: "₹0", labour: "₹349 (Labour)" },
      { description: "Connector wires replaced (1m)", charge: "₹100", labour: "₹349 (Labour)" },
      { description: "Tighten/ Replace Thimble", charge: "₹50", labour: "₹349 (Labour)" },
      { description: "External Dust/stick removal", charge: "₹0", labour: "₹399 (Labour)" },
    ]
  }
];

export const RateList = () => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>("Electrical Parts");

  const toggleSection = (category: string) => {
    setOpenSection(openSection === category ? null : category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Home Services - Rate List</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">AC Services</h2>
        
        {/* Standard rate card banner */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-teal-600" size={24} />
            <span className="font-bold text-teal-800 text-lg">uccover</span>
            <span className="text-gray-700 font-medium">Standard rate card</span>
          </div>
          <ChevronDown size={20} className="text-gray-400 -rotate-90" />
        </div>

        {/* Rate List Accordion */}
        <div className="space-y-4">
          {acRateList.map((section) => (
            <div key={section.category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section.category)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                <span className="font-semibold">{section.category}</span>
                {openSection === section.category ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              
              {openSection === section.category && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 w-2/3">Description</th>
                        <th className="px-6 py-4 text-center">Service Charge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {section.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-gray-800">{item.description}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="font-medium text-gray-900">{item.charge}</div>
                            {item.labour && (
                              <div className="text-xs text-gray-500 mt-1">{item.labour}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RateList;
