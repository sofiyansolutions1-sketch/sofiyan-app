const fs = require('fs');
let code = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

const target = `         <button onClick={() => { if(cart.length > 0) setBookingStep('form') }} className="pointer-events-auto bg-indigo-950 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/30 border border-indigo-800 text-white hover:scale-105 transition-all relative">
            <ShoppingCart size={20} />`;

const replacement = `         <button onClick={() => window.dispatchEvent(new Event('sofiyan_open_cart'))} className="pointer-events-auto bg-indigo-950 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-900/30 border border-indigo-800 text-white hover:scale-105 transition-all relative">
            <ShoppingCart size={20} />`;

code = code.replace(target, replacement);
fs.writeFileSync('pages/CustomerPanel.tsx', code);
console.log("Done");
