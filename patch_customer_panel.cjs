const fs = require('fs');
let code = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const target = `    window.addEventListener('sofiyan_open_profile', handleOpenProfile);
    window.addEventListener('sofiyan_open_cart', handleOpenCart);

    return () => {
      window.removeEventListener('sofiyan_open_profile', handleOpenProfile);
      window.removeEventListener('sofiyan_open_cart', handleOpenCart);
    };`;

const replacement = `    const handleGlobalCartUpdate = () => {
      const saved = localStorage.getItem('sofiyan_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    };

    window.addEventListener('sofiyan_open_profile', handleOpenProfile);
    window.addEventListener('sofiyan_open_cart', handleOpenCart);
    window.addEventListener('sofiyan_global_cart_updated', handleGlobalCartUpdate);

    return () => {
      window.removeEventListener('sofiyan_open_profile', handleOpenProfile);
      window.removeEventListener('sofiyan_open_cart', handleOpenCart);
      window.removeEventListener('sofiyan_global_cart_updated', handleGlobalCartUpdate);
    };`;
code = code.replace(target, replacement);
fs.writeFileSync('pages/CustomerPanel.tsx', code);
console.log("Done");
