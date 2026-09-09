const fs = require('fs');
let content = fs.readFileSync('pages/CustomerPanel.tsx', 'utf8');

// Add Home icon
content = content.replace("HelpCircle, Copy } from 'lucide-react';", "HelpCircle, Copy, Home } from 'lucide-react';");

// The breadcrumb component logic
const breadcrumbCode = `      {renderProfileModal()}

      {/* Breadcrumb Navigation */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        <nav className="flex items-center text-xs sm:text-sm text-gray-500 font-medium overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
          <Link to="/" className="flex items-center hover:text-indigo-600 transition-colors">
            <Home size={14} className="mr-1 sm:mr-1.5" />
            Home
          </Link>
          {activeCity && (
            <>
              <ChevronRight size={14} className="mx-1 sm:mx-2 text-gray-400 flex-shrink-0" />
              <Link to={\`/\${activeCity.toLowerCase()}\`} className="hover:text-indigo-600 transition-colors capitalize">
                {activeCity}
              </Link>
            </>
          )}
          {formattedService && (
            <>
              <ChevronRight size={14} className="mx-1 sm:mx-2 text-gray-400 flex-shrink-0" />
              <span className="text-gray-900 font-semibold">{formattedService}</span>
            </>
          )}
        </nav>
      </div>`;

content = content.replace("{renderProfileModal()}", breadcrumbCode);

fs.writeFileSync('pages/CustomerPanel.tsx', content);
console.log("Breadcrumbs patched");
