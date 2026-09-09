const fs = require('fs');
let content = fs.readFileSync('pages/ServicePage.tsx', 'utf8');

// The original section we want to replace
const targetStart = '{/* 6. Services/features included (Sub-services List) */}';
const targetEnd = '</section>';

// Read until we find the end of the first section
const startIndex = content.indexOf(targetStart);
if (startIndex !== -1) {
  const endIndex = content.indexOf(targetEnd, startIndex) + targetEnd.length;
  
  const newSection = `
            {/* Sub-services List (Original Style) */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">Available {formattedService} Options</h2>
              <div className="grid gap-3">
                {service.subServices.map((sub, index) => {
                   const srvSlug = service.name.toLowerCase().replace(/\\s+/g, '-');
                   const subSlug = sub.name.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                   const linkUrl = \`/\${activeCity.toLowerCase()}/\${srvSlug}/\${subSlug}\`;
                   
                   const cartItem = cart.find(c => c.id === sub.id);
                   const hash = sub.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
                   const discounts = [20, 25, 30, 40];
                   const discountPercentage = discounts[hash % discounts.length];
                   const fakeMRP = Math.round(sub.price / (1 - (discountPercentage / 100)));
                   const savings = fakeMRP - sub.price;
                   const tags = [
                      { text: "🔥 Bestseller", classes: "bg-yellow-400 text-yellow-900" },
                      { text: "⚡ Limited Time Offer", classes: "bg-red-500 text-white" },
                      { text: "⭐ Top Rated", classes: "bg-blue-500 text-white" },
                      null
                   ];
                   const tag = tags[hash % tags.length];

                   return (
                    <div
                      key={sub.id}
                      onClick={() => window.location.href = linkUrl}
                      className="relative p-5 pt-7 border border-indigo-50 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center group overflow-hidden cursor-pointer"
                    >
                      {tag && (
                        <div className={\`absolute top-0 left-0 \${tag.classes} text-[9px] font-black px-2.5 py-1 rounded-br-xl shadow-sm z-10 uppercase tracking-wider\`}>
                          {tag.text}
                        </div>
                      )}
                      
                      <div className="flex-1 w-full mb-4 sm:mb-0 pr-4">
                        <h4 className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors text-lg leading-tight mb-2">{sub.name}</h4>
                        
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-xl font-black text-indigo-950">₹{sub.price}</span>
                          <span className="text-xs text-slate-400 line-through">₹{fakeMRP}</span>
                          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-tighter">
                            {discountPercentage}% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1.5 bg-emerald-50/50 w-fit px-2 py-0.5 rounded-md border border-emerald-100/30">
                           <CheckCircle size={10} className="fill-emerald-600/10" /> Super Save: ₹{savings}
                        </p>
                      </div>
                      
                      <div className="w-full sm:w-auto flex justify-end" onClick={(e) => e.stopPropagation()}>
                        {cartItem ? (
                          <div className="flex items-center gap-3 bg-indigo-50 rounded-xl border border-indigo-100 px-2 py-1.5 shadow-inner">
                              <button onClick={() => useStore.getState().updateQuantity(cartItem.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white hover:bg-indigo-100 rounded-lg text-indigo-700 shadow-sm transition-all"><span className="font-bold">-</span></button>
                              <span className="font-black text-indigo-900 w-6 text-center text-sm">{cartItem.quantity}</span>
                              <button onClick={() => useStore.getState().updateQuantity(cartItem.id, 1)} className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white shadow-sm transition-all"><span className="font-bold text-white">+</span></button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              addToCart(sub, service.name);
                              if ((window as any).syncVanillaCartUI) {
                                (window as any).syncVanillaCartUI();
                              }
                            }} 
                            className="bg-white border-2 border-indigo-100 text-indigo-700 font-black px-8 py-2.5 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 shadow-sm transition-all uppercase tracking-wider text-xs w-full sm:w-auto"
                          >
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                   );
                })}
              </div>
            </section>`;

  content = content.substring(0, startIndex) + newSection + content.substring(endIndex);
  
  // Need to import cart state
  content = content.replace('const addToCart = useStore(state => state.addToCart);', 'const cart = useStore(state => state.cart);\n  const addToCart = useStore(state => state.addToCart);');
  
  fs.writeFileSync('pages/ServicePage.tsx', content);
  console.log("ServicePage updated with original list style.");
} else {
  console.log("Could not find section to replace.");
}
