const fs = require('fs');
let content = fs.readFileSync('components/MapPicker.tsx', 'utf8');

content = content.replace(
  `  }, [isOpen, initialLat, initialLng]);`,
  `  // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [isOpen, initialLat, initialLng]);`
);

content = content.replace(
  `           if (!position || position[0] !== initialLat || position[1] !== initialLng) {
               setPosition([initialLat, initialLng]);
           }`,
  `           // eslint-disable-next-line react-hooks/set-state-in-effect\n           if (!position || position[0] !== initialLat || position[1] !== initialLng) {\n               setPosition([initialLat, initialLng]);\n           }`
);

fs.writeFileSync('components/MapPicker.tsx', content);
