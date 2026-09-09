import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { SERVICES } from '../constants';

export const Breadcrumb = ({ className = "" }: { className?: string }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const cityUrl = pathnames[0];
  const serviceUrl = pathnames[1];
  const subServiceUrl = pathnames[2];

  const activeCity = cityUrl ? cityUrl.charAt(0).toUpperCase() + cityUrl.slice(1).toLowerCase() : '';

  let formattedService = serviceUrl;
  let formattedSubService = subServiceUrl;

  if (serviceUrl) {
    const serviceObj = SERVICES.find(s => s.name.replace(/\s+/g, '-').toLowerCase() === serviceUrl.toLowerCase() || s.name.toLowerCase() === serviceUrl.toLowerCase());
    formattedService = serviceObj?.name || serviceUrl.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    if (subServiceUrl && serviceObj) {
        const subServiceObj = serviceObj.subServices?.find(s => s.name.replace(/\s+/g, '-').toLowerCase() === subServiceUrl.toLowerCase() || s.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() === subServiceUrl.toLowerCase());
        formattedSubService = subServiceObj?.name || subServiceUrl.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  if (pathnames.length === 0) return null;

  return (
    <nav className={`flex items-center text-xs sm:text-sm text-gray-500 font-medium overflow-x-auto whitespace-nowrap scrollbar-hide py-2 ${className}`}>
      <Link to="/" className="flex items-center hover:text-indigo-600 transition-colors">
        <Home size={14} className="mr-1 sm:mr-1.5" />
        Home
      </Link>
      
      {activeCity && (
        <>
          <ChevronRight size={14} className="mx-1 sm:mx-2 text-gray-400 flex-shrink-0" />
          {pathnames.length === 1 ? (
            <span className="text-gray-900 font-semibold capitalize">{activeCity}</span>
          ) : (
            <Link to={`/${cityUrl}`} className="hover:text-indigo-600 transition-colors capitalize">
              {activeCity}
            </Link>
          )}
        </>
      )}

      {formattedService && (
        <>
          <ChevronRight size={14} className="mx-1 sm:mx-2 text-gray-400 flex-shrink-0" />
          {pathnames.length === 2 ? (
            <span className="text-gray-900 font-semibold">{formattedService}</span>
          ) : (
            <Link to={`/${cityUrl}/${serviceUrl}`} className="hover:text-indigo-600 transition-colors">
              {formattedService}
            </Link>
          )}
        </>
      )}

      {formattedSubService && (
        <>
          <ChevronRight size={14} className="mx-1 sm:mx-2 text-gray-400 flex-shrink-0" />
          <span className="text-gray-900 font-semibold">{formattedSubService}</span>
        </>
      )}
    </nav>
  );
};
