const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The card currently is created as a div:
// const card = document.createElement("div");
// card.className = "relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all flex justify-between items-center group overflow-hidden";

// We want to add an onclick to the whole card, but prevent it on the button area.
// OR we can make the title a link. The user requested: "जब भी यूजर किसी भी सब-सर्विसेज पे प्रोफाइल पे टैप करता है... तो एक डायनेमिक पेज आना चाहिए".
// We can wrap the title/left-section in a clickable link/div.

const targetInnerHTML = `                      \${badgeHtml}
                      <div class="flex-1 pr-4">
                          <h4 class="font-black text-slate-900 text-base leading-tight mb-1 group-hover:text-indigo-600 transition-colors">\${service.name}</h4>
                          <div class="flex items-center gap-2 mt-2">
                              <span class="font-black text-xl text-slate-900">₹\${service.price}</span>
                              <span class="text-xs text-slate-400 line-through">₹\${originalPrice}</span>
                              <span class="bg-green-50 text-green-600 text-[10px] font-black px-1.5 py-0.5 rounded border border-green-100 uppercase tracking-tighter">\${discount}% OFF</span>
                          </div>
                          <p class="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium"><i class="fas fa-history text-[8px] text-indigo-400"></i> Takes approx. 45-60 mins</p>
                      </div>
                      <div class="flex-shrink-0">
                          \${buttonHtml}
                      </div>`;

const newInnerHTML = `                      \${badgeHtml}
                      <div class="flex-1 pr-4 cursor-pointer" onclick="window.goToSubService('\${categoryName}', '\${service.name.replace(/'/g, "\\'")}')">
                          <h4 class="font-black text-slate-900 text-base leading-tight mb-1 group-hover:text-indigo-600 transition-colors">\${service.name}</h4>
                          <div class="flex items-center gap-2 mt-2">
                              <span class="font-black text-xl text-slate-900">₹\${service.price}</span>
                              <span class="text-xs text-slate-400 line-through">₹\${originalPrice}</span>
                              <span class="bg-green-50 text-green-600 text-[10px] font-black px-1.5 py-0.5 rounded border border-green-100 uppercase tracking-tighter">\${discount}% OFF</span>
                          </div>
                          <p class="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium"><i class="fas fa-history text-[8px] text-indigo-400"></i> Takes approx. 45-60 mins</p>
                      </div>
                      <div class="flex-shrink-0" onclick="event.stopPropagation()">
                          \${buttonHtml}
                      </div>`;

if(content.includes(targetInnerHTML)) {
  content = content.replace(targetInnerHTML, newInnerHTML);
  
  // also add the global window.goToSubService function
  const goToScript = `
      window.goToSubService = function(categoryName, subServiceName) {
        const city = localStorage.getItem('preferredCity') || 'Bangalore';
        const serviceSlug = categoryName.toLowerCase().replace(/\\s+/g, '-');
        const subServiceSlug = subServiceName.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // Hide modal
        const modal = document.getElementById("full-service-modal");
        if (modal) {
          modal.classList.add("hidden");
          modal.classList.remove("flex");
        }
        document.body.style.overflow = "";
        
        // Navigate
        window.location.href = '/' + city.toLowerCase() + '/' + serviceSlug + '/' + subServiceSlug;
      };
      
      window.openCategoryView = function (categoryName) {`;

  content = content.replace('window.openCategoryView = function (categoryName) {', goToScript);
  
  fs.writeFileSync('index.html', content);
  console.log("index.html patched with goToSubService");
} else {
  console.log("Could not find the target innerHTML in index.html");
}
