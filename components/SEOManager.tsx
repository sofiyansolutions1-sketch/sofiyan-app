import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SERVICES } from '../constants';

export const SEOManager = () => {
  const location = useLocation();

  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const cityUrl = pathParts[0] || '';
    const serviceUrl = pathParts[1] || '';
    const subServiceUrl = pathParts[2] || '';

    // Active City Format
    const activeCity = cityUrl ? cityUrl.charAt(0).toUpperCase() + cityUrl.slice(1).toLowerCase() : 'Bangalore';

    // Default SEO Defaults
    let title = 'Best Home Services | AC, Plumbing, Electrician | Sofiyan';
    let description = 'Book top-rated professionals for home services, AC repair, plumbing, and more with Sofiyan.';

    // Logic based on route depth
    if (serviceUrl && !subServiceUrl) {
      // It's a category page like /delhi/ac
      const serviceObj = SERVICES.find(s => s.name.replace(/\s+/g, '-').toLowerCase() === serviceUrl.toLowerCase() || s.name.toLowerCase() === serviceUrl.toLowerCase());
      const formattedService = serviceObj?.name || serviceUrl.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      title = `Best ${formattedService} Services in ${activeCity} | Sofiyan`;
      description = `Looking for top-rated ${formattedService} services in ${activeCity}? Book reliable professionals at your doorstep with Sofiyan. Verified experts, transparent pricing.`;
    } else if (serviceUrl && subServiceUrl) {
      // It's a sub-service page like /delhi/ac/ac-repair
      const serviceObj = SERVICES.find(s => s.name.replace(/\s+/g, '-').toLowerCase() === serviceUrl.toLowerCase() || s.name.toLowerCase() === serviceUrl.toLowerCase());
      let formattedSubService = subServiceUrl.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      if (serviceObj && serviceObj.subServices) {
        const subObj = serviceObj.subServices.find(s => s.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === subServiceUrl.toLowerCase());
        if (subObj) formattedSubService = subObj.name;
      }

      title = `Expert ${formattedSubService} in ${activeCity} | Sofiyan`;
      description = `Get professional ${formattedSubService} services in ${activeCity}. Sofiyan connects you with top-rated, verified experts for seamless, hassle-free service right at your doorstep.`;
    } else if (cityUrl && pathParts.length === 1) {
      // Non-service root pages or city pages
      const nonCityRoutes = ['blogs', 'admin', 'partner', 'rate-list', 'track'];
      if (nonCityRoutes.includes(cityUrl.toLowerCase())) {
         const routeName = cityUrl.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
         title = `${routeName} | Sofiyan`;
         description = `Access Sofiyan's ${routeName} page.`;
      } else {
         // It's a city index page like /delhi
         title = `Best Home Services in ${activeCity} | AC, Plumbing, Electrician | Sofiyan`;
         description = `Looking for home services in ${activeCity}? Book top-rated professionals for AC repair, plumbing, and more with Sofiyan.`;
      }
    } else if (pathParts.length === 0) {
      // Root /
      title = 'Best Home Services | AC, Plumbing, Electrician | Sofiyan';
      description = 'Looking for home services? Book top-rated professionals for AC repair, plumbing, and more with Sofiyan.';
    }

    // Update Title
    document.title = title;

    // Update Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', `https://www.sofiyanhomeservice.com${location.pathname}`);

  }, [location.pathname]);

  return null;
};
