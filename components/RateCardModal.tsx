import React, { useState, useEffect } from 'react';
import { X, Download, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface RateCardItem {
  name: string;
  price: string;
}

export const rateCardDatabase: Record<string, Record<string, RateCardItem[]>> = {
  "AC Service": {
    "Electrical Parts": [
      { name: "Non-Inverter PCB repaired", price: "₹1650" },
      { name: "Inverter PCB repaired", price: "₹4950" },
      { name: "LVT (Transformer)", price: "₹990 + ₹384 (Labour)" },
      { name: "Replace sensor", price: "₹385 + ₹549 (Labour)" },
      { name: "Contactor replaced", price: "₹550 + ₹549 (Labour)" },
      { name: "Contactor Daikin O-General", price: "₹1650 + ₹494 (Labour)" },
      { name: "Convert PCB with remote", price: "₹1650" },
      { name: "Fan Capacitor (2.5 to 10 mfd)", price: "₹275 + ₹494 (Labour)" },
      { name: "Comp Capacitor (25 to 60 mfd)", price: "₹440 + ₹494 (Labour)" },
      { name: "Combo Capacitor (Comp + Fan)", price: "₹550 + ₹494 (Labour)" },
      { name: "Fuse Change in PCB", price: "₹165 + ₹329 (Labour)" }
    ],
    "Gas Charging": [
      { name: "Gas Charging", price: "₹3080" },
      { name: "Flair nut replaced", price: "₹165" },
      { name: "Copper Coil Condenser (1 ton Split)", price: "₹4400" },
      { name: "Copper Coil Condenser (1.5 ton Split)", price: "₹5060" },
      { name: "Copper Coil Condenser (2 ton Split)", price: "₹5830" },
      { name: "Copper Cooling Coil (Split AC)", price: "₹7150" },
      { name: "Capillary and filter replaced", price: "₹385" },
      { name: "Compressor (0.8–1 ton)", price: "₹7150" },
      { name: "Compressor (1.5 ton)", price: "₹9350" },
      { name: "Compressor (2 ton)", price: "₹11000" },
      { name: "Expansion valve replaced", price: "₹1320" },
      { name: "Copper Cooling Coil/Condenser Coil (Window AC)", price: "₹5500" },
      { name: "Replacement Compressor (1 Ton)", price: "₹4400" },
      { name: "Replacement Compressor (1.5 Ton)", price: "₹4950" },
      { name: "Replacement Compressor (2 Ton)", price: "₹5500" },
      { name: "Service valve replaced (1/4)", price: "₹440" },
      { name: "Service valve replaced (1/2)", price: "₹440" },
      { name: "Service valve replaced (5/8)", price: "₹550" },
      { name: "Copper Cooling Coil (Split AC - 1 Ton)", price: "₹6050" },
      { name: "Copper Cooling Coil (Split AC - 1.5 Ton)", price: "₹7150" },
      { name: "Copper Cooling Coil (Split AC - 2 Ton)", price: "₹8250" },
      { name: "Copper Cooling Coil (O General & Mitsubishi - 1.5 Ton)", price: "₹8250" },
      { name: "Copper Cooling Coil/Condenser Coil (Window AC - 1 Ton)", price: "₹4950" },
      { name: "Copper Cooling Coil/Condenser Coil (Window AC - 1.5 Ton)", price: "₹5500" },
      { name: "Copper Cooling Coil/Condenser Coil (Window AC - 2 Ton)", price: "₹6050" },
      { name: "Cooling coil repair with Anti-rust coating", price: "₹989" },
      { name: "Left side U band replacement", price: "₹1650" }
    ],
    "Fan Motors": [
      { name: "Fan motor - Split AC", price: "₹1760 + ₹549 (Labour)" },
      { name: "Blower motor - Split AC", price: "₹2420 + ₹549 (Labour)" },
      { name: "Blower replaced", price: "₹1210 + ₹549 (Labour)" },
      { name: "Replace Flap/Swing Motor", price: "₹462 + ₹549 (Labour)" },
      { name: "Motor Bearing Change", price: "₹1100" },
      { name: "Fan motor - Window AC", price: "₹2860 + ₹549 (Labour)" },
      { name: "Blower motor (DC) - Split AC", price: "₹4180" },
      { name: "Fan motor (DC) - Split AC", price: "₹3960" }
    ],
    "Service & Installation": [
      { name: "1 ft copper pipe set (installation, wire per ft)", price: "₹385" },
      { name: "Split AC Wall stand", price: "₹825" },
      { name: "Outdoor unit reinstalled", price: "₹879" },
      { name: "Indoor unit reinstalled", price: "₹769" },
      { name: "Fastener complete set", price: "₹220" },
      { name: "Floor stand", price: "₹605" },
      { name: "Universal back plate", price: "₹330" },
      { name: "Foam jet AC service", price: "₹659" },
      { name: "AC installation", price: "₹1649" },
      { name: "AC uninstallation", price: "₹769" },
      { name: "Anti-rust spray (avoid gas leak)", price: "₹274" },
      { name: "Lite AC service", price: "₹549" },
      { name: "Drain Pipe replacement (1m)", price: "₹110" },
      { name: "3/4 Core Wire (per meter)", price: "₹132" },
      { name: "Outdoor/Indoor Connector", price: "₹165" }
    ],
    "Minor Repairs": [
      { name: "Water Leakage Repaired - Split AC", price: "₹659" },
      { name: "Adjust Grill Locks", price: "₹0 / ₹384 (Labour)" },
      { name: "Adjust pipe and tight compressor screw", price: "₹0 / ₹384 (Labour)" },
      { name: "Connector wires replaced (1m)", price: "₹110 + ₹384 (Labour)" },
      { name: "Tighten/Replace Thimble", price: "₹55 + ₹384 (Labour)" },
      { name: "External Dust/stick removal", price: "₹0 + ₹329 (Labour)" }
    ],
    "Other Parts": [
      { name: "AC fan blade", price: "₹770 + ₹549 (Labour)" },
      { name: "Grill Cover", price: "₹1650 + ₹384 (Labour)" },
      { name: "Swing blade replaced", price: "₹440 + ₹384 (Labour)" },
      { name: "Universal remote", price: "₹880" },
      { name: "Water tray", price: "₹550 + ₹220 (Labour)" },
      { name: "Stabilizer repair", price: "₹1650" },
      { name: "Sleeves (per piece)", price: "₹55" },
      { name: "Stabilizer connection", price: "₹0 + ₹439 (Labour)" }
    ]
  },
  "Washing Machine": {
    "Semi Automatic WM – Power Unit": [
      { name: "Power 3 Pin Plug Top", price: "₹220" },
      { name: "Power Cord", price: "₹385" },
      { name: "Re wiring (Heavy damage)", price: "₹715" }
    ],
    "Semi Automatic WM – Wash Issue": [
      { name: "Timer Wash (Electro Mechanical)", price: "₹1100" },
      { name: "Pulsator Snap", price: "₹220" },
      { name: "Thermostat", price: "₹440" },
      { name: "Pulsator with snap", price: "₹935" },
      { name: "Gear Box (With Pulley)", price: "₹1540" },
      { name: "Heater", price: "₹880" },
      { name: "Motor Pulley", price: "₹605" },
      { name: "Spin & Wash Capacitor", price: "₹539 (Labour ₹329)" },
      { name: "Wash Motor", price: "₹1945" },
      { name: "Wash Timer", price: "₹825" },
      { name: "V Belt", price: "₹385" }
    ],
    "Semi Automatic WM – Spin Issue": [
      { name: "Spin Lid", price: "₹770" },
      { name: "Spin Lid Switch", price: "₹275" },
      { name: "Spin Tub", price: "₹1320" },
      { name: "Spin tub bellow", price: "₹495" },
      { name: "Timer Spin", price: "₹694" },
      { name: "Assembly Shocker 3 Qty", price: "₹495" },
      { name: "Spin Motor", price: "₹2200" },
      { name: "Coupler / Brake Wheel", price: "₹440" },
      { name: "Coupler Bush", price: "₹165" },
      { name: "Brake Shoe", price: "₹220" },
      { name: "Brake Plate", price: "₹385" },
      { name: "Lid Spring", price: "₹165" },
      { name: "Brake Wire", price: "₹220" }
    ],
    "Semi Automatic WM – Water Leakage": [
      { name: "Drain Bellow", price: "₹275" },
      { name: "Drain Valve Assembly", price: "₹550" },
      { name: "Drain Valve Spring", price: "₹55" },
      { name: "Drain Case Cleaning", price: "₹330" }
    ],
    "Semi Automatic WM – Accessories": [
      { name: "Panel Top Cover", price: "₹1100" },
      { name: "Descaling Powder", price: "₹165" },
      { name: "Rat Mesh", price: "₹440" },
      { name: "Wash Lid", price: "₹880" },
      { name: "Back Cover", price: "₹550" },
      { name: "Drain Strip", price: "₹110" },
      { name: "Over Flow Pipe", price: "₹242" },
      { name: "Spin Cap", price: "₹220" },
      { name: "Outer Body / Cabinet", price: "₹2750" },
      { name: "Drain Selector", price: "₹110" },
      { name: "Drain Pipe", price: "₹220" },
      { name: "Lint / Magic filter", price: "₹275" },
      { name: "Knob", price: "₹175" },
      { name: "Inlet Pipe", price: "₹220" },
      { name: "Washing Machine Cover", price: "₹550" }
    ],
    "Top Load WM – Power Unit": [
      { name: "Repair - Inverter PCB (Top Load)", price: "₹2475" },
      { name: "Power 3 Pin Plug Top", price: "₹220" },
      { name: "Power Cord", price: "₹385" },
      { name: "Wiring Kit", price: "₹0" },
      { name: "Replace (New) Display PCB (Top Load)", price: "₹1 + ₹329 (Labour)" },
      { name: "Replace (New) PCB (Top Load)", price: "₹1 + ₹329 (Labour)" },
      { name: "LVT", price: "₹715" },
      { name: "Repair - PCB (Top Load)", price: "₹1870" },
      { name: "Tap Adaptor", price: "₹330" },
      { name: "Filter cleaning", price: "₹0 + ₹329 (Labour)" }
    ],
    "Top Load WM – Wash Issue": [
      { name: "Capacitor", price: "₹495" },
      { name: "Motor Pulley", price: "₹495" },
      { name: "Pulsator Snap", price: "₹376" },
      { name: "Pressure sensor with pipe", price: "₹1045" },
      { name: "Agitator", price: "₹935" },
      { name: "Outer tub", price: "₹2200" },
      { name: "Pulsator with snap", price: "₹1155" },
      { name: "Sensor Pipe", price: "₹199" },
      { name: "Drain Cleaning", price: "₹330" },
      { name: "Door Lock (Top Load)", price: "₹1595" },
      { name: "Brake Arm (Whirlpool)", price: "₹1320" },
      { name: "AC Inlet Valve 1 way", price: "₹825" },
      { name: "AC Inlet Valve 2 way", price: "₹1100" },
      { name: "AC inlet valve 3/4 way", price: "₹1540" },
      { name: "DC Inlet Valve 1 way", price: "₹1099" },
      { name: "DC Inlet Valve 2 way", price: "₹1430" },
      { name: "DC inlet valve 3/4 way", price: "₹2200" },
      { name: "Main Motor", price: "₹2035" },
      { name: "Hall sensor", price: "₹990" },
      { name: "Direct Drive Motor", price: "₹4400" },
      { name: "Heater Sensor", price: "₹385" },
      { name: "Heater", price: "₹825" },
      { name: "Chuck Nut", price: "₹275" },
      { name: "V Belt", price: "₹385" },
      { name: "Pressure sensor wiring", price: "₹385" },
      { name: "Whirlpool Capacitor", price: "₹715" }
    ],
    "Top Load WM – Spin Issue": [
      { name: "Damper rod / Balancing Rods (4 Qty)", price: "₹1650" },
      { name: "Haier 6.5kg Clutch Assembly", price: "₹4180" },
      { name: "Lid/Magnet Switch", price: "₹418" },
      { name: "Spin lid", price: "₹605" },
      { name: "Inner drum Plastic / Steel", price: "₹2420" },
      { name: "DC Drain Motor", price: "₹1870" },
      { name: "Clutch assembly", price: "₹4015" },
      { name: "Whirlpool - TSP (Complete Mechanism with hub)", price: "₹4950" },
      { name: "AC Drain Motor", price: "₹1540" },
      { name: "Hub (Flange)", price: "₹1100" }
    ],
    "Top Load WM – Water Leakage": [
      { name: "Inner Drain Hose", price: "₹330" },
      { name: "Drain Case Assembly (D V Case Assembly)", price: "₹1045" },
      { name: "Drain Bellow", price: "₹319" },
      { name: "Drain Valve Spring", price: "₹110" },
      { name: "Drain Case Cleaning", price: "₹440" }
    ],
    "Top Load WM – Accessories": [
      { name: "Rat Mesh", price: "₹440" },
      { name: "Chemical Wash - Drum Dismantling & Assembling", price: "₹1430" },
      { name: "Inner Drain Hose", price: "₹330" },
      { name: "Outer Body / Cabinet", price: "₹3300" },
      { name: "Inner drum Plastic / Steel", price: "₹2420" },
      { name: "Stand/Trolley", price: "₹990" },
      { name: "Descaling Powder", price: "₹165" },
      { name: "Extension Inlet Pipe 4Mtr (with adaptor)", price: "₹660" },
      { name: "Tub/Drain/Detergent-drawer Hose Rubber pipe", price: "₹605" },
      { name: "Sensor Pipe", price: "₹165" },
      { name: "Back Cover (Top Load)", price: "₹715" },
      { name: "Inlet Pipe / 1.5 Mtr with adaptor", price: "₹495" },
      { name: "Drain Pipe", price: "₹330" },
      { name: "Lint / Magic filter", price: "₹330" },
      { name: "Spin lid", price: "₹605" },
      { name: "Inlay Panel / Control Panel", price: "₹550" },
      { name: "Pulsator with snap", price: "₹1155" },
      { name: "Pulsator Snap", price: "₹376" },
      { name: "Agitator", price: "₹935" },
      { name: "Power 3 Pin Plug Top", price: "₹220" },
      { name: "Outer tub", price: "₹2200" },
      { name: "Tap Adaptor", price: "₹330" },
      { name: "Motor Pulley", price: "₹495" },
      { name: "Knob", price: "₹110" },
      { name: "Washing Machine Cover", price: "₹550" },
      { name: "Water filter", price: "₹1320" }
    ],
    "Front Load WM – Power Unit": [
      { name: "Power 3 Pin Plug Top", price: "₹165" },
      { name: "Power Cord", price: "₹385" },
      { name: "Replace (New) - Display PCB (Front Load)", price: "₹1 + ₹329 (Labour)" },
      { name: "Replace (New) - PCB (Front Load)", price: "₹1 + ₹329 (Labour)" },
      { name: "LVT", price: "₹715" },
      { name: "Repair - PCB (Front Load)", price: "₹2860" },
      { name: "Timer", price: "₹2420" },
      { name: "Motor Control Unit (MCU)", price: "₹1595" },
      { name: "Repair - Inverter PCB (Front Load)", price: "₹3190" }
    ],
    "Front Load WM – Wash Issue": [
      { name: "DC Inlet valve 3/4 way", price: "₹2200" },
      { name: "Door Lock (Front Load)", price: "₹1595" },
      { name: "Complete drum assembly (Bosch / Siemens)", price: "₹9900" },
      { name: "AC Inlet valve 3/4 way", price: "₹1430" },
      { name: "Gasket / Door Diaphragm", price: "₹2200" },
      { name: "Complete Tub & Drum Assembly", price: "₹6600" },
      { name: "Front tub", price: "₹2530" },
      { name: "Back Tub (With bearings and seal)", price: "₹3630" },
      { name: "Capacitor", price: "₹440" },
      { name: "Pulley drive", price: "₹825" },
      { name: "Sensor Pipe", price: "₹165" },
      { name: "AC Inlet Valve 1 way", price: "₹825" },
      { name: "AC Inlet Valve 2 way", price: "₹1100" },
      { name: "Pressure sensor with pipe", price: "₹1155" },
      { name: "DC Inlet Valve 1 way", price: "₹1099" },
      { name: "DC Inlet Valve 2 way", price: "₹1430" },
      { name: "Hall sensor", price: "₹1155" },
      { name: "Direct Drive Motor", price: "₹4400" },
      { name: "Heater", price: "₹1100" },
      { name: "Heater Sensor", price: "₹550" },
      { name: "Motor Universal", price: "₹4400" },
      { name: "V Belt", price: "₹935" },
      { name: "Drum Pulley", price: "₹495" }
    ],
    "Front Load WM – Noise Issue": [
      { name: "Shocker Set - 3 Pieces", price: "₹2640" },
      { name: "Flange shaft Tri angle", price: "₹2860" },
      { name: "Drum Bearing / oil Seal with Cleaning", price: "₹2970" },
      { name: "Shocker Set - 2 pieces", price: "₹1650" }
    ],
    "Front Load WM – Spin Issue": [
      { name: "Drain Pump Motor", price: "₹1595" },
      { name: "Assembly Drain Pump", price: "₹1650" },
      { name: "Drain Pump Motor (Double way)", price: "₹2420" },
      { name: "DC Drain Pump Motor", price: "₹2420" }
    ],
    "Front Load WM – Water Leakage": [
      { name: "Drain Cleaning", price: "₹330" },
      { name: "Drain Rubber Hose", price: "₹770" }
    ],
    "Front Load WM – Accessories (Final Complete Version)": [
      { name: "Chemical Wash - Drum Dismantling & Assembling", price: "₹1650" },
      { name: "Frontload Trolly (Stand)", price: "₹1430" },
      { name: "Rat Mesh", price: "₹440" },
      { name: "Door Hinge", price: "₹1210" },
      { name: "Descaling Powder", price: "₹165" },
      { name: "Outer body / Cabinet", price: "₹3850" },
      { name: "Dispenser Angle", price: "₹495" },
      { name: "Water Filter (Front Load)", price: "₹1 + ₹329 (Labour)" },
      { name: "Extension Inlet Pipe 4Mtr (with adaptor)", price: "₹660" },
      { name: "Drain Rubber Hose", price: "₹770" },
      { name: "Drain Pipe", price: "₹440" },
      { name: "Inlet Pipe / 1.5 Mtr with adaptor", price: "₹495" },
      { name: "Knob", price: "₹110" },
      { name: "Noise Filter", price: "₹550" },
      { name: "Inlay Panel / Control Panel", price: "₹770" },
      { name: "Sensor Pipe", price: "₹165" },
      { name: "Tap Adaptor", price: "₹330" },
      { name: "Power 3 Pin Plug Top", price: "₹165" },
      { name: "Back Tub (With bearings and seal)", price: "₹3630" },
      { name: "Tub/Drain/Detergent-drawer Hose Rubber pipe", price: "₹605" },
      { name: "Power Cord", price: "₹385" },
      { name: "Gasket / Door Diaphragm", price: "₹2200" },
      { name: "Gasket Spring", price: "₹165" },
      { name: "Front holder / Door lever", price: "₹880" },
      { name: "Back holder", price: "₹660" },
      { name: "Washing Machine Cover", price: "₹880" },
      { name: "Pulley drive", price: "₹825" },
      { name: "Outer Tub", price: "₹2750" },
      { name: "Door assembly", price: "₹1980" }
    ],
    "Minor Repair – Semi Automatic (Final Version)": [
      { name: "Drain Pipe Adjustment", price: "₹0 + ₹329 (Labour)" },
      { name: "Wire Retaping", price: "₹0 + ₹329 (Labour)" },
      { name: "Machine Level Adjustment", price: "₹0 + ₹329 (Labour)" },
      { name: "Cloth/Coin stuck", price: "₹0 + ₹329 (Labour)" },
      { name: "Belt Adjustment", price: "₹0 + ₹329 (Labour)" },
      { name: "Body Cabinet Adjustment", price: "₹0 + ₹329 (Labour)" }
    ],
    "Installation": [
      { name: "Washing Machine Installation", price: "₹110 + ₹329 (Labour)" }
    ],
    "Descaling": [
      { name: "Descaling", price: "₹220" },
      { name: "Top load deep cleaning", price: "₹0" },
      { name: "Front load deep cleaning", price: "₹0" }
    ],
    "Minor Repair – Automatic (Final Version)": [
      { name: "Detergent Drawer Adjustment", price: "₹0 + ₹329 (Labour)" },
      { name: "Tap Adaptor fixing", price: "₹0 + ₹329 (Labour)" },
      { name: "Drain Pipe Adjustment", price: "₹0 + ₹329 (Labour)" },
      { name: "Filter cleaning", price: "₹329 (Labour)" },
      { name: "Electrical Plug Adjustment", price: "₹0 + ₹329 (Labour)" },
      { name: "Belt Adjustment", price: "₹0 + ₹329 (Labour)" },
      { name: "Cloth/Coin stuck", price: "₹0 + ₹329 (Labour)" },
      { name: "Machine Level Adjustment", price: "₹0 + ₹329 (Labour)" },
      { name: "Body Cabinet Adjustment", price: "₹0 + ₹329 (Labour)" },
      { name: "Wire Retaping", price: "₹0 + ₹329 (Labour)" },
      { name: "Washing Machine Jet Service", price: "₹0" }
    ]
  },
  "Refrigerator": {
    "Single Door – Power Unit": [
      { name: "Power Cord", price: "₹350" },
      { name: "Power 3 Pin Plug Top", price: "₹100" },
      { name: "Repair - Inverter PCB (Single Door)", price: "₹2000" },
      { name: "Replace (New) - Inverter PCB (Single Door)", price: "₹3201" },
      { name: "Repair - PCB (Single Door)", price: "₹1201" }
    ],
    "Single Door – Cooling Issue": [
      { name: "Damaged Door – Repair", price: "₹901" },
      { name: "Door / Gasket Adjust", price: "₹151" },
      { name: "Thermostat", price: "₹700" },
      { name: "Complete Door Gasket with Magnet (All Models)", price: "₹1000" },
      { name: "Defrost Sensor", price: "₹500" }
    ],
    "Single Door – Gas Charge": [
      { name: "Capillary", price: "₹350" },
      { name: "Dryer (Freezer)", price: "₹160" },
      { name: "Pin Valve", price: "₹80" },
      { name: "Condenser Coil", price: "₹900" },
      { name: "Cooling Coil with Capillary (Single Door)", price: "₹1350" },
      { name: "Refrigerant Gas Charge (Single Door > 100L)", price: "₹1600" }
    ],
    "Single Door – Compressor": [
      { name: "Inverter Compressor", price: "₹6500" },
      { name: "Capacitor", price: "₹150" },
      { name: "Relay", price: "₹350" },
      { name: "Over Load Protector (OLP)", price: "₹250" },
      { name: "Relay + OLP Combo", price: "₹600" },
      { name: "Compressor (Single Door) including Relay + OLP + Capacitor", price: "₹3500" }
    ],
    "Single Door – Accessories": [
      { name: "Drain Pipe", price: "₹100" },
      { name: "Drain Tray", price: "₹300" },
      { name: "Copper Pipe Insulation", price: "₹150" },
      { name: "Door Lock", price: "₹150" },
      { name: "Door Switch", price: "₹100" },
      { name: "Bulb", price: "₹75" },
      { name: "LED Light", price: "₹250" },
      { name: "Bulb Holder", price: "₹100" },
      { name: "Door Leg", price: "₹50" },
      { name: "Drain Cleaning", price: "₹100" },
      { name: "Freezer Door (Single Door > 200L)", price: "₹650" },
      { name: "Freezer Door (Single Door up to 200L)", price: "₹400" },
      { name: "Freezer Door Frame", price: "₹450" }
    ],
    "Single Door – Minor Repair": [
      { name: "Defrost Cycle Adjustment", price: "₹0 + ₹399 (Labour)" },
      { name: "Door Gap Fix", price: "₹0 + ₹399 (Labour)" },
      { name: "Electrical Contact Fixing", price: "₹0 + ₹399 (Labour)" },
      { name: "Pipe & Fan Blade Adjustment", price: "₹0 + ₹399 (Labour)" },
      { name: "Electrical Plug Adjustment", price: "₹0 + ₹399 (Labour)" },
      { name: "Refrigerator Levelling", price: "₹0 + ₹399 (Labour)" },
      { name: "Refrigerator Location Correction", price: "₹0 + ₹399 (Labour)" },
      { name: "Temperature Setting", price: "₹0 + ₹399 (Labour)" },
      { name: "Wire Retaping", price: "₹0 + ₹399 (Labour)" },
      { name: "Tray / Shelf Adjustment", price: "₹0 + ₹399 (Labour)" },
      { name: "Drain Tray Adjustment", price: "₹0 + ₹399 (Labour)" }
    ],
    "Double Door – Power Unit": [
      { name: "LVT", price: "₹750" },
      { name: "Power 3 Pin Plug Top", price: "₹100" },
      { name: "Power Cord", price: "₹350" },
      { name: "Repair – Inverter PCB (Double Door)", price: "₹2300" },
      { name: "Repair – PCB (Double Door)", price: "₹1550" },
      { name: "Replace (New) – PCB (Double Door)", price: "₹1 + ₹299 (Labour)" }
    ],
    "Double Door – Defrost Issue": [
      { name: "Coil Heater", price: "₹1650" },
      { name: "Defrost Sensor", price: "₹550" },
      { name: "Defrost Timer", price: "₹950" },
      { name: "Duct & Drain Cleaning", price: "₹350" },
      { name: "Glass Heater", price: "₹900" },
      { name: "P Cord Heater", price: "₹1000" },
      { name: "Bimetal", price: "₹500" },
      { name: "Thermal Fuse", price: "₹200" },
      { name: "Thermal Fuse & Bimetal (Both)", price: "₹700" },
      { name: "Defrost Sensor with Thermal Fuse", price: "₹700" },
      { name: "Rod Heater", price: "₹1000" }
    ],
    "Double Door – Gas Charge": [
      { name: "Capillary", price: "₹350" },
      { name: "Condenser Coil", price: "₹1200" },
      { name: "Cooling Coil (Double Door)", price: "₹2500" },
      { name: "Drain Tray Condenser", price: "₹550" },
      { name: "Dryer (Freezer)", price: "₹180" },
      { name: "Pin Valve", price: "₹80" },
      { name: "Refrigerant Gas Charge (Double Door)", price: "₹1950" },
      { name: "Step Valve", price: "₹1200" }
    ],
    "Double Door – Compressor Unit": [
      { name: "Capacitor", price: "₹150" },
      { name: "Compressor (< 500L, incl. Relay + OLP + Capacitor)", price: "₹5400" },
      { name: "Compressor (> 500L, incl. Relay + OLP + Capacitor)", price: "₹5830" },
      { name: "Inverter Compressor", price: "₹7500" },
      { name: "Over Load Protector (OLP)", price: "₹300" },
      { name: "Relay", price: "₹350" },
      { name: "Relay + OLP + Capacitor", price: "₹800" }
    ],
    "Double Door – Cooling Issue": [
      { name: "DC Fan Motor – Condenser", price: "₹1900" },
      { name: "AC Fan Motor", price: "₹1250" },
      { name: "Damaged Door – Repair", price: "₹901" },
      { name: "Damper Thermostat", price: "₹1000" },
      { name: "DC Fan Motor – Freezer", price: "₹1800" },
      { name: "DC Fan Motor – Refrigerator", price: "₹1900" },
      { name: "Defrost Sensor", price: "₹500" },
      { name: "Hitachi Door Repair (440L)", price: "₹1300" },
      { name: "Fan Blade", price: "₹120" },
      { name: "Refrigerator Door Gasket & Magnet (> 400L)", price: "₹2200" },
      { name: "Refrigerator Door Gasket & Magnet (< 400L)", price: "₹1700" },
      { name: "Room Sensor", price: "₹550" },
      { name: "Rotary Switch", price: "₹600" },
      { name: "Thermocol Duct Repair", price: "₹500" },
      { name: "Thermostat", price: "₹800" }
    ],
    "Double Door – Accessories": [
      { name: "Bulb", price: "₹60" },
      { name: "Bulb Holder", price: "₹150" },
      { name: "Copper Pipe Insulation", price: "₹170" },
      { name: "Door Lock", price: "₹435" },
      { name: "Door Switch", price: "₹290" },
      { name: "Drain Pipe", price: "₹100" },
      { name: "Drain Tray", price: "₹300" },
      { name: "LED Light", price: "₹290" },
      { name: "Magnetic Door Switch", price: "₹200" },
      { name: "Thermostat Knob", price: "₹50" },
      { name: "Door Leg", price: "₹50" }
    ],
    "Side-by-Side Door – Power Unit": [
      { name: "LVT", price: "₹750" },
      { name: "Power 3 Pin Plug Top", price: "₹120" },
      { name: "Power Cord", price: "₹350" },
      { name: "Repair – Inverter PCB (SBS)", price: "₹2800" },
      { name: "Repair – PCB (SBS)", price: "₹2000" },
      { name: "Replace (New) – PCB (SBS)", price: "₹1 + ₹299 (Labour)" }
    ],
    "Side-by-Side Door – Cooling Issue": [
      { name: "AC Fan Motor", price: "₹1200" },
      { name: "Damper Thermostat", price: "₹1050" },
      { name: "Fan Blade", price: "₹120" },
      { name: "Room Sensor", price: "₹600" },
      { name: "Rotary Switch", price: "₹850" },
      { name: "Thermocol Duct Repair", price: "₹500" },
      { name: "Thermostat", price: "₹850" },
      { name: "DC Fan Motor – Freezer", price: "₹1900" },
      { name: "DC Fan Motor – Refrigerator", price: "₹1900" },
      { name: "DC Fan Motor – Condenser", price: "₹1900" },
      { name: "Door / Gasket Adjust", price: "₹500" },
      { name: "Damaged Door – Repair", price: "₹901" }
    ],
    "Side-by-Side Door – Gas Charge": [
      { name: "Capillary", price: "₹350" },
      { name: "Condenser Coil", price: "₹1400" },
      { name: "Dryer (Freezer)", price: "₹180" },
      { name: "Pin Valve", price: "₹90" },
      { name: "Cooling Coil (Side-by-Side)", price: "₹2900" },
      { name: "Refrigerant Gas Charge (SBS)", price: "₹2400" },
      { name: "Sub Condenser", price: "₹850" },
      { name: "Drain Tray Condenser", price: "₹500" },
      { name: "Step Valve", price: "₹1200" }
    ],
    "Side-by-Side Door – Compressor Unit": [
      { name: "Capacitor", price: "₹175" },
      { name: "Inverter Compressor", price: "₹8000" },
      { name: "Over Load Protector (OLP)", price: "₹350" },
      { name: "Relay", price: "₹400" },
      { name: "Relay + OLP + Capacitor", price: "₹900" },
      { name: "Compressor (Side-by-Side) including Relay, OLP & Capacitor", price: "₹6599" }
    ],
    "Side-by-Side Door – Defrost Issue": [
      { name: "Thermal Fuse", price: "₹200" },
      { name: "Thermal Fuse & Bimetal (Both)", price: "₹700" },
      { name: "Defrost Sensor", price: "₹600" },
      { name: "Glass Heater", price: "₹900" },
      { name: "P Cord Heater", price: "₹1000" },
      { name: "Defrost Sensor with Thermal Fuse", price: "₹700" },
      { name: "Heater Coil", price: "₹1650" },
      { name: "Rod Heater", price: "₹1000" },
      { name: "Drain & Duct Cleaning", price: "₹300" },
      { name: "Defrost Timer", price: "₹1000" }
    ],
    "Side-by-Side Door – Ice / Water Dispenser": [
      { name: "Ice Maker Kit", price: "₹2500" },
      { name: "Cube Solenoid Valve", price: "₹1200" },
      { name: "Auger Motor", price: "₹1500" },
      { name: "Ice / Water Lever Switch", price: "₹250" },
      { name: "Ice / Water Solenoid Valve", price: "₹1200" },
      { name: "Ice Storage Box", price: "₹0" },
      { name: "Replace Ice Blade or Flap", price: "₹1" },
      { name: "Ice Tray", price: "₹550" },
      { name: "Water / Ice Dispenser Lever", price: "₹1200" },
      { name: "Water Filter", price: "₹2000" },
      { name: "Water Pipe / Connector (3 Meter)", price: "₹350" },
      { name: "Water Tank with Pipe", price: "₹1400" }
    ],
    "Side-by-Side Door – Accessories": [
      { name: "Bulb", price: "₹50" },
      { name: "Copper Pipe Insulation", price: "₹170" },
      { name: "Door Switch", price: "₹250" },
      { name: "Drain Pipe", price: "₹100" },
      { name: "Bulb Holder", price: "₹100" },
      { name: "Temperature Knob", price: "₹50" },
      { name: "Door Leg", price: "₹50" }
    ],
    "Side-by-Side Door – Minor Repair": [
      { name: "Defrost Cycle Adjustment", price: "₹0 + ₹399 (Labour)" },
      { name: "Door Gap Fix", price: "₹0 + ₹399 (Labour)" },
      { name: "Electrical Contact Fixing", price: "₹0 + ₹399 (Labour)" },
      { name: "Pipe & Fan Blade Adjustment", price: "₹0 + ₹399 (Labour)" },
      { name: "Refrigerator Levelling", price: "₹0 + ₹399 (Labour)" },
      { name: "Electrical Plug Adjustment", price: "₹0 + ₹399 (Labour)" },
      { name: "Refrigerator Location Correction", price: "₹0 + ₹399 (Labour)" },
      { name: "Temperature Setting", price: "₹0 + ₹399 (Labour)" },
      { name: "Wire Retaping", price: "₹0 + ₹399 (Labour)" },
      { name: "Tray / Shelf Adjustment", price: "₹0 + ₹399 (Labour)" },
      { name: "Drain Tray Adjustment", price: "₹0 + ₹399 (Labour)" },
      { name: "Minor Repair – Others", price: "₹0 + ₹299 (Labour)" }
    ]
  },
  "Water Purifier": {
    "Servicing / Installation": [
      { name: "Water Purifier Installation", price: "₹151 + ₹299 (Labour)" },
      { name: "Water Purifier Uninstallation", price: "₹101 + ₹299 (Labour)" },
      { name: "UTC Installation", price: "₹301 + ₹299 (Labour)" },
      { name: "High TDS Upgrade (3000 TDS)", price: "₹300 + ₹299 (Labour)" },
      { name: "Minor Repair – Joint / Connector Tightening", price: "₹50 + ₹299 (Labour)" },
      { name: "Minor Repair – Wire / Sensor Adjustment", price: "₹50 + ₹299 (Labour)" },
      { name: "Minor Repair – RO Reset", price: "₹50 + ₹299 (Labour)" },
      { name: "Minor Repair – Filter / Tank Cleaning", price: "₹50 + ₹299 (Labour)" }
    ],
    "UV Spares": [
      { name: "UV Model Clamp for Classic (Set)", price: "₹20 + ₹299 (Labour)" },
      { name: "UV Model Nylon Pipe (12 inch / per meter)", price: "₹10 + ₹299 (Labour)" },
      { name: "UV Model Pipe (PE Pipe 5/16 – 5/8 inch per meter)", price: "₹20 + ₹299 (Labour)" },
      { name: "UV Model 10 inch Pre Filter Housing Type for Wall Set (1 set)", price: "₹350 + ₹299 (Labour)" },
      { name: "UV Model ON/OFF Switch", price: "₹150 + ₹299 (Labour)" },
      { name: "UV Model Post Carbon Filter (4 inches)", price: "₹250 + ₹299 (Labour)" },
      { name: "UV Model Nozzle", price: "₹40 + ₹299 (Labour)" },
      { name: "UV Model SS Sensor (Purity Sensor)", price: "₹450 + ₹299 (Labour)" },
      { name: "UV Model Classic Body Pre Filter Housing without Filter (8–10 inch)", price: "₹750 + ₹299 (Labour)" },
      { name: "UV Model Cartridge/Candle (for Sediment Filter)", price: "₹250 + ₹299 (Labour)" },
      { name: "UV Model UF/Membrane Housing (RO/UV Ready Unit)", price: "₹850 + ₹299 (Labour)" },
      { name: "UV Model Classic Bowl Complete (RO Set + Charging String + Tap)", price: "₹1500 + ₹299 (Labour)" },
      { name: "UV Chamber (8 Watt / 250–350 GPD)", price: "₹400 + ₹299 (Labour)" },
      { name: "UV Chamber (10” Stainless Steel)", price: "₹600 + ₹299 (Labour)" },
      { name: "UV Lamp (8 Watt)", price: "₹450 + ₹299 (Labour)" },
      { name: "UV Model Solenoid Valve (½ inch Thread)", price: "₹150 + ₹299 (Labour)" },
      { name: "UV Lamp (11 Watt)", price: "₹450 + ₹299 (Labour)" },
      { name: "UV Model Pre/Post Carbon Filter (8–10 inch)", price: "₹450 + ₹299 (Labour)" },
      { name: "UV Lamp (11 Watt – OEM/All Models)", price: "₹500 + ₹299 (Labour)" },
      { name: "UV Model Inline Filter (8–10 inch)", price: "₹350 + ₹299 (Labour)" },
      { name: "UV Model Dual Compact Block Filter", price: "₹450 + ₹299 (Labour)" },
      { name: "UV Model Classic Inline Filter (8–10 inch)", price: "₹450 + ₹299 (Labour)" },
      { name: "UV Model UF Filter (8–10 inch)", price: "₹450 + ₹299 (Labour)" }
    ],
    "Generic Spares (Updated & Detailed)": [
      { name: "Pre Filter Housing Clamp", price: "₹50 + ₹299 (Labour)" },
      { name: "Carbon Block Cartridge (5L)", price: "₹450 + ₹299 (Labour)" },
      { name: "Carbon Block Filter (10” / 2.5” Standard)", price: "₹450 + ₹299 (Labour)" },
      { name: "Pre Filter Housing", price: "₹450 + ₹299 (Labour)" },
      { name: "UF Membrane (5L)", price: "₹450 + ₹299 (Labour)" },
      { name: "Alkaline Filter", price: "₹450 + ₹299 (Labour)" },
      { name: "Carbon Block Filter (20” Jumbo RO)", price: "₹1200 + ₹299 (Labour)" },
      { name: "Spun Filter (20” Jumbo RO)", price: "₹1200 + ₹299 (Labour)" },
      { name: "Membrane Filter (10 inch)", price: "₹450 + ₹299 (Labour)" },
      { name: "Membrane Filter (Inline)", price: "₹550 + ₹299 (Labour)" },
      { name: "Pressure Reducing Valve", price: "₹400 + ₹299 (Labour)" },
      { name: "Elbow (Connector)", price: "₹20 + ₹299 (Labour)" },
      { name: "T Joint Connector", price: "₹20 + ₹299 (Labour)" },
      { name: "Pipe Connector", price: "₹25 + ₹299 (Labour)" },
      { name: "Pipe Cutter", price: "₹150 + ₹299 (Labour)" },
      { name: "PP Spun Filter", price: "₹150 + ₹299 (Labour)" },
      { name: "Meter Valve", price: "₹25 + ₹299 (Labour)" },
      { name: "Normal Tap", price: "₹150 + ₹299 (Labour)" },
      { name: "Mixer Tap (Water Connection)", price: "₹450 + ₹299 (Labour)" },
      { name: "Faucet Tap", price: "₹150 + ₹299 (Labour)" },
      { name: "Ball Valve (½ inch)", price: "₹150 + ₹299 (Labour)" },
      { name: "Micro Switch", price: "₹150 + ₹299 (Labour)" },
      { name: "Gate Valve Connector (Jumbo Inlet Valve)", price: "₹350 + ₹299 (Labour)" },
      { name: "Pressure Tank", price: "₹1200 + ₹299 (Labour)" },
      { name: "NRV (Non Return Valve)", price: "₹150 + ₹299 (Labour)" },
      { name: "High Pressure Switch", price: "₹250 + ₹299 (Labour)" },
      { name: "TDS Controller", price: "₹550 + ₹299 (Labour)" },
      { name: "Float Valve", price: "₹142 + ₹299 (Labour)" },
      { name: "Flow Restrictor", price: "₹100 + ₹299 (Labour)" },
      { name: "Heavy Pre-Filter Housing", price: "₹299 + ₹299 (Labour)" },
      { name: "Low Pressure Switch", price: "₹239 + ₹299 (Labour)" },
      { name: "Filter Housing", price: "₹349 + ₹299 (Labour)" },
      { name: "Solenoid Valve", price: "₹179 + ₹299 (Labour)" },
      { name: "Flush Valve", price: "₹179 + ₹299 (Labour)" },
      { name: "Diode Valve", price: "₹299 + ₹299 (Labour)" },
      { name: "Cabinet Body (RO Body)", price: "₹1100 + ₹299 (Labour)" },
      { name: "Antiscalant Balls (Pack of 8)", price: "₹199 + ₹299 (Labour)" },
      { name: "UV Chamber", price: "₹750 + ₹299 (Labour)" },
      { name: "Pressure Reducer Valve with Pressure Gauge", price: "₹750 + ₹299 (Labour)" },
      { name: "UTC Body", price: "₹450 + ₹299 (Labour)" },
      { name: "Stand Wall Mount", price: "₹100 + ₹299 (Labour)" },
      { name: "New Wire Harness", price: "₹300 + ₹299 (Labour)" },
      { name: "RO Membrane (100 GPD / High TDS)", price: "₹1500 + ₹299 (Labour)" },
      { name: "Pre Filter (10”)", price: "₹200 + ₹299 (Labour)" },
      { name: "Sediment Filter (10”)", price: "₹400 + ₹299 (Labour)" },
      { name: "Post Carbon Filter (10”)", price: "₹250 + ₹299 (Labour)" },
      { name: "Pre Carbon Filter (10”)", price: "₹350 + ₹299 (Labour)" },
      { name: "Regular Service (10” without Pre-filter)", price: "₹900 + ₹299 (Labour)" },
      { name: "Regular Service (10”)", price: "₹1100 + ₹299 (Labour)" },
      { name: "Full Service (10” without Pre-filter)", price: "₹2500 + ₹299 (Labour)" },
      { name: "Regular Service (Nano)", price: "₹1100 + ₹299 (Labour)" },
      { name: "Pre Carbon Filter (Nano)", price: "₹350 + ₹299 (Labour)" },
      { name: "Full Service (Nano)", price: "₹1900 + ₹299 (Labour)" },
      { name: "Sediment Filter (Nano)", price: "₹450 + ₹299 (Labour)" },
      { name: "Regular Service Nano (without Pre-filter)", price: "₹900 + ₹299 (Labour)" },
      { name: "Membrane (Nano)", price: "₹1200 + ₹299 (Labour)" },
      { name: "Full Service (10”)", price: "₹2700 + ₹299 (Labour)" },
      { name: "Universal Wall Mount Stand", price: "₹600" }
    ],
    "Generic Electrical Parts": [
      { name: "PCB Repair", price: "₹1199 + ₹299 (Labour)" },
      { name: "Booster Pump (75–100 GPD)", price: "₹1799 + ₹299 (Labour)" },
      { name: "UV Choke", price: "₹299 + ₹299 (Labour)" },
      { name: "SMPS (24V / 36V)", price: "₹599 + ₹299 (Labour)" },
      { name: "UV Lamp / Tube (8W / 11W)", price: "₹350 + ₹299 (Labour)" },
      { name: "Booster Pump (100 GPD)", price: "₹1799 + ₹299 (Labour)" },
      { name: "Wiring Harness", price: "₹299 + ₹299 (Labour)" }
    ],
    "Aquaguard Spares": [
      { name: "Aquaguard Classic Aqua Kit", price: "₹850 + ₹299 (Labour)" },
      { name: "Aquaguard Magna Kit", price: "₹850 + ₹299 (Labour)" },
      { name: "Aquaguard Carbon Filter", price: "₹300 + ₹299 (Labour)" },
      { name: "Aquaguard Enhance Model Kit", price: "₹1250 + ₹299 (Labour)" },
      { name: "Aquaguard RO Model Cartridge", price: "₹750 + ₹299 (Labour)" },
      { name: "Aquaguard PCB", price: "₹1200 + ₹299 (Labour)" },
      { name: "Aquaguard SMPS / Main PCB", price: "₹1500 + ₹299 (Labour)" },
      { name: "Aquaguard Purity Sensor", price: "₹650 + ₹299 (Labour)" },
      { name: "Aquaguard Aquaflo / RO Model PCB", price: "₹1750 + ₹299 (Labour)" },
      { name: "Aquaguard Crystal / Compact / Classic Model PCB", price: "₹1500 + ₹299 (Labour)" },
      { name: "Aquaguard UV Lamp (8W / 11W)", price: "₹350 + ₹299 (Labour)" },
      { name: "Aquaguard Enhance Model Sediment Filter", price: "₹250 + ₹299 (Labour)" },
      { name: "Aquaguard Threaded Pre-Filter", price: "₹300 + ₹299 (Labour)" },
      { name: "Aquaguard Classic Model Wall Mount Filter", price: "₹850 + ₹299 (Labour)" },
      { name: "Aquaguard Model ON/OFF Switch", price: "₹150 + ₹299 (Labour)" },
      { name: "Aquaguard Enhance Model Post Carbon Filter", price: "₹300 + ₹299 (Labour)" },
      { name: "Aquaguard Enhance Model UF Filter", price: "₹750 + ₹299 (Labour)" },
      { name: "Aquaguard Enhance Model Pre Carbon Filter", price: "₹300 + ₹299 (Labour)" },
      { name: "Aquaguard Prime / Reviva Model Sediment Filter", price: "₹250 + ₹299 (Labour)" },
      { name: "Aquaguard Enhance Model Mineral Filter", price: "₹450 + ₹299 (Labour)" },
      { name: "Aquaguard Prime / Reviva Model Pre Carbon Filter", price: "₹300 + ₹299 (Labour)" },
      { name: "Aquaguard Prime / Reviva Model UF Filter", price: "₹750 + ₹299 (Labour)" },
      { name: "Aquaguard Prime / Reviva Model Post Carbon Filter", price: "₹300 + ₹299 (Labour)" },
      { name: "Aquaguard Booster Pump", price: "₹2500 + ₹299 (Labour)" },
      { name: "Aquaguard Prime / Reviva Model PCB", price: "₹1500 + ₹299 (Labour)" },
      { name: "Aquaguard Classic Model Kit", price: "₹850 + ₹299 (Labour)" },
      { name: "Aquaguard Magna Model Kit", price: "₹850 + ₹299 (Labour)" },
      { name: "Aquaguard Heavy Metal Remover Cartridge", price: "₹1800 + ₹299 (Labour)" },
      { name: "Aquaguard Magna / Nrich / Classic / Superb Model Kit", price: "₹3350 + ₹299 (Labour)" },
      { name: "Aquaguard Candle Filter", price: "₹450 + ₹299 (Labour)" },
      { name: "Aquaguard Solenoid Valve", price: "₹450 + ₹299 (Labour)" },
      { name: "Aquaguard Carbon Block Assembly", price: "₹850 + ₹299 (Labour)" },
      { name: "Aquaguard Dr. AG Compact Carbon Block Assembly", price: "₹900 + ₹299 (Labour)" },
      { name: "Aquaguard DX Filter Dual Cartridge", price: "₹1200 + ₹299 (Labour)" },
      { name: "Aquaguard Diaphragm Pump (BP-2000)", price: "₹3500 + ₹299 (Labour)" },
      { name: "Aquaguard Atom Model Post Carbon Assembly", price: "₹150 + ₹299 (Labour)" },
      { name: "Aquaguard RO + UV Nano RO Kit (Without Chip – Nano/Enhance/Magna Models)", price: "₹7750 + ₹299 (Labour)" },
      { name: "Aquaguard RO Membrane Filter Assembly (Reviva Spare)", price: "₹5000 + ₹299 (Labour)" },
      { name: "Aquaguard RO + UV Enhance RO Kit (Without Biotron – Reviva/Enhance Model)", price: "₹8550 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model HD Filter Assembly (New)", price: "₹525 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model HCBC Cartridge Assembly (Nano – 5/16”)", price: "₹850 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model Dust Free Carbon Block Assembly", price: "₹1400 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model HD Filter Cartridge / Assembly (New)", price: "₹1050 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model UF Filter (Micro Filter 4–6 Inch)", price: "₹1150 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV HCBC Cartridge Assembly (Magna / Pro / Origa)", price: "₹4657 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model Pre Silver Carbon Filter Assembly", price: "₹1250 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV Dr. Geneus UTC RO Kit (PM)", price: "₹4575 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV Reviva NXT RO Kit (PM)", price: "₹4500 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV UV Lamp Assembly", price: "₹1080 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV Dr. Aquaguard Magna RO Kit (EA)", price: "₹4500 + ₹299 (Labour)" },
      { name: "Aquaguard Geneus DX Kit (PL6 Model)", price: "₹5000 + ₹299 (Labour)" },
      { name: "Aquaguard AC/DC Adaptor PCB Assembly", price: "₹1575 + ₹299 (Labour)" },
      { name: "Aquaguard Display PCB with Harness", price: "₹3150 + ₹299 (Labour)" },
      { name: "Aquaguard Carbon Block (AG Neo)", price: "₹900 + ₹299 (Labour)" },
      { name: "Aquaguard AG Superb RO Kit", price: "₹4500 + ₹299 (Labour)" },
      { name: "Aquaguard Display PCB", price: "₹1080 + ₹299 (Labour)" },
      { name: "Aquaguard Dr. Geneus RO Kit (PL6)", price: "₹5000 + ₹299 (Labour)" },
      { name: "Aquaguard Crystal Plus UV Kit", price: "₹1345 + ₹299 (Labour)" },
      { name: "Aquaguard Diverter Valve", price: "₹399 + ₹299 (Labour)" },
      { name: "Aquaguard EP / Ulka / CP5 Pump", price: "₹2400 + ₹299 (Labour)" },
      { name: "Aquaguard Gear Pump", price: "₹2250 + ₹299 (Labour)" },
      { name: "Aquaguard Heptaflure Cartridge Carbon Block Assembly", price: "₹945 + ₹299 (Labour)" },
      { name: "Aquaguard Main PCB (Without Box – Dr. AG Classic+)", price: "₹2750 + ₹299 (Labour)" },
      { name: "Aquaguard Dr. AG Magna RO Kit (PL4)", price: "₹4500 + ₹299 (Labour)" },
      { name: "Aquaguard Main PCB – Dr. AG Classic", price: "₹2250 + ₹299 (Labour)" },
      { name: "Aquaguard Magic Filter Assembly", price: "₹650 + ₹299 (Labour)" },
      { name: "Aquaguard Dr. AG Classic + UV Kit", price: "₹1700 + ₹299 (Labour)" },
      { name: "Aquaguard Master Harness Assembly (Geneus)", price: "₹305 + ₹299 (Labour)" },
      { name: "Aquaguard Power Supply 12V DC / 1.7A (Socket Mount)", price: "₹1575 + ₹299 (Labour)" },
      { name: "Aquaguard New Infiniti PCB Assembly", price: "₹2100 + ₹299 (Labour)" },
      { name: "Aquaguard Reviva NXT EA UV Kit", price: "₹1700 + ₹299 (Labour)" },
      { name: "Aquaguard Power Adaptor Assembly (With Toroid)", price: "₹1200 + ₹299 (Labour)" },
      { name: "Aquaguard RO Active Copper Maxx Cartridge", price: "₹550 + ₹299 (Labour)" },
      { name: "Aquaguard RO Membrane Filter Assembly (Reviva)", price: "₹2500 + ₹299 (Labour)" },
      { name: "Aquaguard New Classic PCB Assembly", price: "₹1900 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV AG Superb UTC RO Kit", price: "₹4075 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV Dr. AG Magna RO + UV NXT Kit (EA)", price: "₹4500 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV UV Lamp Assembly", price: "₹545 + ₹299 (Labour)" },
      { name: "Aquaguard Cartridge for Miracle Heavy Metal Remover", price: "₹900 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV AG Classic + EA UV Kit", price: "₹2025 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV AG Classic + EA UV Kit (Variant)", price: "₹2550 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV AG Enhance UV Kit", price: "₹1775 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV Dr. AG Geneus UTC RO Kit", price: "₹4500 + ₹299 (Labour)" },
      { name: "Aquaguard RO+UV Enhance RO Kit", price: "₹4375 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model Dr Classic + UV Kit", price: "₹1700 + ₹299 (Labour)" },
      { name: "Aquaguard Sediment Filter Assembly (Atom / Nano)", price: "₹525 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model Carbon Block Assembly (Nano Model)", price: "₹850 + ₹299 (Labour)" },
      { name: "Aquaguard UV Lamp G11 T5", price: "₹675 + ₹299 (Labour)" },
      { name: "Aquaguard Booster Pump", price: "₹2945 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model Dual Cartridge (AG Compact)", price: "₹600 + ₹299 (Labour)" },
      { name: "Aquaguard SMPS PCB Assembly (FAD / DLX / ER / DX Models)", price: "₹1575 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model HCBC Cartridge Assembly (Nano – 5/16”)", price: "₹850 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model Drinking Outlet Tube", price: "₹100 + ₹299 (Labour)" },
      { name: "Aquaguard UV Carbon Block Filter (AG Classic)", price: "₹400 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model HD Filter Cartridge", price: "₹525 + ₹299 (Labour)" },
      { name: "Aquaguard UV Photoresistor Harness Assembly", price: "₹265 + ₹299 (Labour)" },
      { name: "Aquaguard UV Heptaflure Cartridge Carbon Block Assembly", price: "₹900 + ₹299 (Labour)" },
      { name: "Aquaguard UV Model Pre Silver Carbon Filter Assembly", price: "₹625 + ₹299 (Labour)" },
      { name: "Aquaguard Weight Sensor Assembly (AG)", price: "₹490 + ₹299 (Labour)" },
      { name: "Aquaguard Tap", price: "₹400 + ₹299 (Labour)" },
      { name: "Aquaguard UV Solenoid Valve", price: "₹350 + ₹299 (Labour)" },
      { name: "Aquaguard UV Post Carbon Assembly (Atom)", price: "₹150 + ₹299 (Labour)" }
    ],
    "Kent Spares": [
      { name: "Kent POWP RO Membrane (8” High Flow)", price: "₹2750 + ₹299 (Labour)" },
      { name: "Kent POWP RO Membrane Welded (8”)", price: "₹2750 + ₹299 (Labour)" },
      { name: "Kent UF Membrane Welded (8”)", price: "₹1000 + ₹299 (Labour)" },
      { name: "Kent Hollow Fiber Membrane (RO)", price: "₹900 + ₹299 (Labour)" },
      { name: "Kent Inline Carbon Filter (8”)", price: "₹600 + ₹299 (Labour)" },
      { name: "Kent Sediment Filter (10” – Excel / Elite)", price: "₹500 + ₹299 (Labour)" },
      { name: "Kent Inline Sediment Filter (8”)", price: "₹500 + ₹299 (Labour)" },
      { name: "Kent Activated Carbon Filter (Pre/Post – Inline)", price: "₹500 + ₹299 (Labour)" },
      { name: "Kent Pump (100–600 GPD)", price: "₹2400 + ₹299 (Labour)" },
      { name: "Kent Post Carbon Filter (Blue)", price: "₹400 + ₹299 (Labour)" },
      { name: "Kent SMPS (24V / 2.5A)", price: "₹350 + ₹299 (Labour)" },
      { name: "Kent POWP Pre Filter Sediment (10”)", price: "₹350 + ₹299 (Labour)" },
      { name: "Kent Electronic Ballast (Auto Flush PCB)", price: "₹350 + ₹299 (Labour)" },
      { name: "Kent SMPS (2.5 Amp – 20016)", price: "₹350 + ₹299 (Labour)" },
      { name: "Kent Tap", price: "₹150 + ₹299 (Labour)" },
      { name: "Kent UV Assembly with Barrel", price: "₹820 + ₹299 (Labour)" },
      { name: "Kent Water Level Sensor (Float)", price: "₹250 + ₹299 (Labour)" },
      { name: "Kent Diaphragm Pump (150)", price: "₹2800 + ₹299 (Labour)" }
    ],
    "Pureit Spares": [
      { name: "Pressure Reducer Valve (Pureit)", price: "₹999 + ₹299 (Labour)" },
      { name: "Pureit GK1", price: "₹2750 + ₹299 (Labour)" },
      { name: "Pureit GK2", price: "₹3499 + ₹299 (Labour)" },
      { name: "Pureit CSF Carbon Sediment Filter", price: "₹1050 + ₹299 (Labour)" },
      { name: "Pureit Mineral Filter", price: "₹2950 + ₹299 (Labour)" },
      { name: "Pureit PP Filter (Spun Filter 10” – Branded)", price: "₹350 + ₹299 (Labour)" },
      { name: "Pureit RC Boost UV (GKK0)", price: "₹2750 + ₹299 (Labour)" },
      { name: "Pureit RO+UV (GKK10)", price: "₹2750 + ₹299 (Labour)" },
      { name: "Pureit RO+UV (GKK20)", price: "₹3500 + ₹299 (Labour)" },
      { name: "Pureit UV G2 Kit", price: "₹1500 + ₹299 (Labour)" },
      { name: "Pureit Tap", price: "₹250 + ₹299 (Labour)" }
    ],
    "Livpure Spares": [
      { name: "Livpure RO Membrane (LWT12FLIT10109)", price: "₹550 + ₹299 (Labour)" },
      { name: "Livpure RO Membrane (LWT12MEM10009)", price: "₹2750 + ₹299 (Labour)" },
      { name: "Livpure Sediment Filter (LWT12FILT10108)", price: "₹550 + ₹299 (Labour)" },
      { name: "Livpure UV Lamp (4 Watts – 16000047)", price: "₹375 + ₹299 (Labour)" }
    ],
    "Philips Spares": [
      { name: "Philips UV Model Block Dual Cartridge (Branded)", price: "₹850 + ₹299 (Labour)" }
    ]
  }
};

export const RateCardModal: React.FC<{ isOpen: boolean; onClose: () => void; category: string | null }> = ({ isOpen, onClose, category }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && category && rateCardDatabase[category]) {
      document.body.style.overflow = 'hidden';
      // Open the first section by default
      const firstSection = Object.keys(rateCardDatabase[category])[0];
      if (firstSection) {
        setOpenSections({ [firstSection]: true });
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, category]);

  if (!isOpen || !category || !rateCardDatabase[category]) return null;

  const currentRateCardData = rateCardDatabase[category];

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    
    const originalSections = { ...openSections };
    
    const allExpanded: Record<string, boolean> = {};
    if (category && rateCardDatabase[category]) {
      Object.keys(rateCardDatabase[category]).forEach(key => {
        allExpanded[key] = true;
      });
    }
    setOpenSections(allExpanded);
    
    // Wait for DOM to update animations
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const content = document.getElementById('rate-card-content');
    if (content) {
      // Temporarily hide the close and download buttons for the PDF
      const headerBtns = document.querySelectorAll('.pdf-exclude');
      headerBtns.forEach(btn => (btn as HTMLElement).style.display = 'none');
      
      try {
        const canvas = await html2canvas(content, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        let position = 0;
        let heightLeft = pdfHeight;
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save(`${category}-Rate-Card.pdf`);
      } catch (error) {
        console.error("PDF Generation failed", error);
      } finally {
        // Restore buttons
        headerBtns.forEach(btn => (btn as HTMLElement).style.display = '');
      }
    }
    
    setOpenSections(originalSections);
    setIsDownloading(false);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #rate-card-content, #rate-card-content * {
              visibility: visible;
            }
            #rate-card-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-height: none !important;
              overflow: visible !important;
              padding: 0 !important;
              box-shadow: none !important;
            }
            .no-print {
              display: none !important;
            }
            /* Expand all sections for print */
            .print-expand {
              display: block !important;
            }
            .print-hide-chevron {
              display: none !important;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn no-print">
        <div 
          id="rate-card-content"
          className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all animate-scaleIn print:rounded-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl sticky top-0 z-10 w-full no-print">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sofiyan Home Service - {category} Rate Card</h2>
            </div>
            <button 
              onClick={onClose}
              className="pdf-exclude p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>

          <div className="hidden print:block mb-6 pb-4 border-b border-gray-300">
             <h2 className="text-2xl font-bold text-gray-900">Sofiyan Home Service - {category} Rate Card</h2>
             <p className="text-gray-500">Official Rate List</p>
          </div>

          {/* Sub-header / Action */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center no-print w-full">
            <p className="text-sm text-gray-600 font-medium">Clear pricing for all {category} services</p>
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="pdf-exclude flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isDownloading ? "Generating PDF..." : "Download as PDF"}
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto w-full print:overflow-visible print:max-h-none">
            <div className="p-6 space-y-4 print:p-0">
              {Object.entries(currentRateCardData).map(([sectionTitle, items]) => (
                <div key={sectionTitle} className="border border-gray-200 rounded-xl overflow-hidden bg-white print:border-none print:mb-6">
                  <button
                    onClick={() => toggleSection(sectionTitle)}
                    className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none no-print"
                  >
                    <span className="font-bold text-gray-800 text-left">{sectionTitle}</span>
                    <span className="text-gray-500 print-hide-chevron">
                      {openSections[sectionTitle] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>

                  <h3 className="hidden print:block text-lg font-bold text-gray-900 mb-2 py-2 border-b border-gray-800">
                    {sectionTitle}
                  </h3>

                  <div className={`${openSections[sectionTitle] ? 'block' : 'hidden'} print-expand`}>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white text-gray-500 border-t print:border-none border-gray-200 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3 font-semibold w-2/3">Item Description</th>
                          <th className="px-5 py-3 font-semibold text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors print:break-inside-avoid">
                            <td className="px-5 py-3.5 text-gray-800 font-medium">{item.name}</td>
                            <td className="px-5 py-3.5 text-right text-gray-700 font-semibold">{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              <div className="pt-6 pb-2 text-center text-xs text-gray-400 font-medium hidden print:block">
                Prices may vary slightly based on actual inspection. Taxes as applicable.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
