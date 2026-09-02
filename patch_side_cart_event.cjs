const fs = require('fs');
let code = fs.readFileSync('components/Layout.tsx', 'utf8');

const target = `    window.addEventListener('sofiyan_cart_changed', handleCartChange);
    return () => {
      window.removeEventListener('sofiyan_cart_changed', handleCartChange);
    };`;

const replacement = `    const handleOpenSideCart = () => setIsCartOpen(true);
    window.addEventListener('sofiyan_cart_changed', handleCartChange);
    window.addEventListener('sofiyan_open_side_cart', handleOpenSideCart);
    return () => {
      window.removeEventListener('sofiyan_cart_changed', handleCartChange);
      window.removeEventListener('sofiyan_open_side_cart', handleOpenSideCart);
    };`;

code = code.replace(target, replacement);
fs.writeFileSync('components/Layout.tsx', code);
console.log("Done");
