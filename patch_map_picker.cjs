const fs = require('fs');
let content = fs.readFileSync('components/MapPicker.tsx', 'utf8');

// replace useEffect and handleCurrentLocation order
const regex = /useEffect\(\(\) => \{[\s\S]*?\}, \[isOpen, initialLat, initialLng\]\);[\s\S]*?const handleCurrentLocation = \(\) => \{[\s\S]*?\};/;

const handleFn = `const handleCurrentLocation = () => {
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
           setPosition([initialLat, initialLng]);
       } else {
           handleCurrentLocation();
       }
    }
  }, [isOpen, initialLat, initialLng]);`;

content = content.replace(regex, handleFn);
// fix useRef defined but never used
content = content.replace('import React, { useState, useEffect, useRef } from "react";', 'import React, { useState, useEffect } from "react";');

fs.writeFileSync('components/MapPicker.tsx', content);
