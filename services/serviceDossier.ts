// Service Dossier - Detailed Scope, What's Included & What's Excluded

export interface ServiceScope {
  title: string;
  includes: string[];
  excludes?: string[];
  timeEstimate?: string;
}

export function getServiceDossier(rawServiceName: string, categoryName: string = ''): ServiceScope {
  const serviceName = rawServiceName || '';
  const clean = serviceName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Try resolving from window.serviceOptionsCatalog if available
  if (typeof window !== 'undefined') {
    const catalog = (window as any).serviceOptionsCatalog;
    const findFn = (window as any).findServiceOptions;
    if (findFn && typeof findFn === 'function') {
      const found = findFn(serviceName);
      if (found && found.includes) {
        return {
          title: serviceName,
          includes: found.includes,
          excludes: found.excludes,
          timeEstimate: found.options?.[0]?.duration
        };
      }
    } else if (catalog) {
      for (const key of Object.keys(catalog)) {
        if (clean.includes(key.toLowerCase().replace(/[^a-z0-9]/g, '')) || key.toLowerCase().replace(/[^a-z0-9]/g, '').includes(clean)) {
          return {
            title: key,
            includes: catalog[key].includes || [],
            excludes: catalog[key].excludes || [],
            timeEstimate: catalog[key].options?.[0]?.duration
          };
        }
      }
    }
  }

  // 2. Full Home Cleaning Specific Matches
  if (clean.includes('furnished') && clean.includes('essential')) {
    return {
      title: 'Furnished Apartment Essential',
      includes: [
        'Bathroom & kitchen deep descaling & machine wash',
        'Machine cleaning of floors, doors & window tracks',
        'Ceiling dusting, cobweb removal & fan blades cleaning',
        'Balcony & utility area wet wiping & floor scrub',
        'Exterior cabinet, wardrobe & furniture wet wiping'
      ],
      excludes: ['Cupboard interior wet wiping', 'Sofa/carpet shampooing'],
      timeEstimate: '3h 45m'
    };
  }

  if (clean.includes('furnished') && clean.includes('premium')) {
    return {
      title: 'Furnished Apartment Premium',
      includes: [
        'Everything included in Essential package',
        'Cupboard interior & exterior deep cleaning (if empty)',
        'Kitchen cabinets interior degreasing with utensil removal & repositioning',
        'Exhaust fan, slab & tile joint deep steam sanitization'
      ],
      excludes: ['Sofa & carpet fabric shampooing'],
      timeEstimate: '4h 15m'
    };
  }

  if (clean.includes('furnished') && clean.includes('elite')) {
    return {
      title: 'Furnished Apartment Elite',
      includes: [
        'Everything included in Premium package',
        'Fabric sofa shampooing & deep moisture suction',
        'Living room carpet & rug rotary machine shampooing',
        'Mattress sanitization & allergen dust mite extraction',
        'Bathroom grout line steam jet sterilization'
      ],
      excludes: ['Wet wall washing or exterior facade cleaning'],
      timeEstimate: '4h 45m'
    };
  }

  if (clean.includes('unfurnished') && clean.includes('essential')) {
    return {
      title: 'Unfurnished Apartment Essential',
      includes: [
        'Complete bathroom & kitchen deep descaling',
        'Rotary machine scrubbing of floors, doors & window tracks',
        'Ceiling dusting, fan wiping & cobweb removal',
        'Balcony floor jet washing'
      ],
      excludes: ['Cabinet interior cleaning'],
      timeEstimate: '3h'
    };
  }

  if (clean.includes('unfurnished') && clean.includes('premium')) {
    return {
      title: 'Unfurnished Apartment Premium',
      includes: [
        'Everything in Essential package',
        'Interior & exterior cleaning of all empty wardrobes & cupboards',
        'Kitchen cabinets interior wipe & degreasing',
        'Hard water scale buffing on all chrome & glass'
      ],
      excludes: ['Paint drop removal (included in Post Interior Work)'],
      timeEstimate: '3h 40m'
    };
  }

  if (clean.includes('postinterior') || clean.includes('interiorwork')) {
    return {
      title: 'Post Interior Renovation Cleaning',
      includes: [
        'Everything in Premium move-in package',
        'Sticker, tape gum & interior debris removal',
        'Paint droplets & cement stain scrubbing (high removal efficacy)',
        'Fine wood sawdust extraction from slider tracks & corners'
      ],
      excludes: ['External civil debris disposal'],
      timeEstimate: '6h'
    };
  }

  if (clean.includes('villa') && clean.includes('essential')) {
    return {
      title: 'Villa Essential Deep Clean',
      includes: [
        'Bathroom & kitchen deep cleaning across all floors',
        'Complete floor rotary mopping & sweeping',
        'Cobweb removal & wall dry dusting for high ceilings & stairs',
        'Balcony, staircase railing & utility area cleaning'
      ],
      excludes: ['Terrace pressure wash without drainage'],
      timeEstimate: '5h 20m'
    };
  }

  if (clean.includes('villa') && clean.includes('premium')) {
    return {
      title: 'Villa Premium Deep Clean',
      includes: [
        'Bathroom & kitchen deep descaling & sanitization',
        'High-ceiling cobweb extraction & stairwell dusting',
        'Dry vacuuming of sofas, carpets & cushioned chairs',
        'Rotary machine scrubbing of floors, doors & windows',
        'Inside-out wipe of empty wardrobes & furniture'
      ],
      excludes: ['Facade cleaning beyond 15 ft height'],
      timeEstimate: '5h 50m'
    };
  }

  // Kitchen Specific
  if (clean.includes('kitchen') && clean.includes('steam')) {
    return {
      title: 'Kitchen Power Steam Sanitization',
      includes: [
        '140°C thermal steam degreasing of tiles, slabs & stove',
        'Exhaust fan, sink & under-sink pipeline steam blast',
        'Utensil removal, cabinet interior wiping & careful replacement',
        'Complete grease lifting from tile grouts & corners'
      ],
      excludes: ['Internal appliance motor repairs'],
      timeEstimate: '2h 30m'
    };
  }

  if (clean.includes('kitchen') && clean.includes('eco')) {
    return {
      title: 'Kitchen Eco-Smart Organic Clean',
      includes: [
        'Plant-based organic enzyme degreasing (no caustic fumes)',
        'Food-safe sanitization ideal for baby & pet utensils',
        'Complete countertop, hob & wall tile scrub',
        'Sink & drain bio-enzyme deodorization'
      ],
      excludes: ['Corrosive acid treatments'],
      timeEstimate: '2h 15m'
    };
  }

  if (clean.includes('kitchen')) {
    return {
      title: 'Kitchen Deep Cleaning',
      includes: [
        'Degreasing of wall tiles, floor slab & gas stove/hob',
        'Sink, under-sink, exhaust & fan dusting',
        'Floors, windows & switchboard cleaning',
        'Exterior cabinet wiping & stain removal'
      ],
      excludes: ['Utensil removal (available in Power Steam)'],
      timeEstimate: '1h 30m'
    };
  }

  // Bathroom Specific
  if (clean.includes('bathroom') && clean.includes('steam')) {
    return {
      title: 'Bathroom Power Steam Sanitization',
      includes: [
        '140°C thermal steam jet sanitization of commode & tile joints',
        'Eliminates 99.9% germs, mildew & bacteria',
        'Chrome taps & shower head descaling with high gloss finish',
        'Mirror buffing & drain deodorization'
      ],
      excludes: ['Broken grout replacement'],
      timeEstimate: '1h 20m'
    };
  }

  if (clean.includes('bathroom') && clean.includes('eco')) {
    return {
      title: 'Bathroom Eco-Smart Clean',
      includes: [
        'Plant-derived acid-free descalers (non-corrosive, family-safe)',
        'Anti-allergen formulation for tiles, basin & toilet pot',
        'Mirror streak-free polish & drain bio-enzyme clean',
        'Floor rotary scrubbing & fixture shine buffing'
      ],
      excludes: ['Harsh hydrochloric acid wash'],
      timeEstimate: '1h 10m'
    };
  }

  if (clean.includes('bathroom')) {
    return {
      title: 'Bathroom Deep Cleaning',
      includes: [
        'Hard water stain removal from tiles & fixtures',
        'Toilet pot, washbasin & mirror deep scrub',
        'Floor machine scrubbing & stain lifting',
        'Exhaust fan wiping & cobweb removal'
      ],
      excludes: ['Tile regrouting'],
      timeEstimate: '1h'
    };
  }

  // Sofa & Carpet
  if (clean.includes('sofa') && (clean.includes('leather') || clean.includes('shining'))) {
    return {
      title: 'Leather Sofa Deep Conditioning & Polish',
      includes: [
        'pH-neutral foaming leather cleanser application',
        'Microfiber dirt & sweat oil extraction',
        'Rich leather conditioner buffing to prevent cracks & restore sheen'
      ],
      excludes: ['Leather tear patching'],
      timeEstimate: '45m'
    };
  }

  if (clean.includes('sofa')) {
    return {
      title: 'Fabric Sofa Shampooing & Extraction',
      includes: [
        '3-step injection-extraction foam shampooing',
        'High-power moisture vacuum suction (semi-dry in 3-4 hours)',
        'Food & sweat spot stain treatment & deodorization'
      ],
      excludes: ['Fabric dye color restoration'],
      timeEstimate: '1h 15m'
    };
  }

  if (clean.includes('carpet')) {
    return {
      title: 'Carpet & Rug Rotary Shampooing',
      includes: [
        'Industrial rotary machine brush shampooing',
        'High-suction moisture & deep fibre dirt extraction',
        'Anti-microbial sanitization & freshness deodorizing'
      ],
      excludes: ['Fringe reweaving'],
      timeEstimate: '1h'
    };
  }

  if (clean.includes('mattress')) {
    return {
      title: 'Mattress Sanitization & Deep Clean',
      includes: [
        'Dual-side high suction dust mite & allergen extraction',
        'Spot stain treatment for common spills',
        'Anti-bacterial disinfectant spray'
      ],
      excludes: ['Internal spring repairs'],
      timeEstimate: '45m'
    };
  }

  if (clean.includes('floor')) {
    return {
      title: 'Floor Machine Scrubbing',
      includes: [
        'Single-disc rotary scrubbing machine with polishing pad',
        'Deep grout line cleaning & stubborn stain buffing',
        'Microfiber dry mopping for a pristine finish'
      ],
      excludes: ['Marble diamond crystallization (charged separately)'],
      timeEstimate: '1h'
    };
  }

  if (clean.includes('balcony')) {
    return {
      title: 'Balcony Jet Wash & Deep Clean',
      includes: [
        'Floor machine scrub & high-pressure jet wash',
        'Railing wiping & bird droppings removal',
        'Drain pipe unclogging & sliding glass door cleaning'
      ],
      excludes: ['Exterior ledge cleaning without safety grill'],
      timeEstimate: '45m'
    };
  }

  // AC Services
  if (categoryName.toLowerCase().includes('ac') || clean.includes('ac')) {
    if (clean.includes('gas') || clean.includes('leak')) {
      return {
        title: 'AC Gas Leak Fix & Refilling',
        includes: [
          'High-pressure nitrogen testing to detect hidden leaks',
          'Copper brazing repair & flare nut tightening',
          'Complete vacuuming to eliminate moisture',
          'Pure 100% refrigerant gas refill as per tonnage specs'
        ],
        excludes: ['Compressor replacement'],
        timeEstimate: '1h 30m'
      };
    }
    if (clean.includes('foam') || clean.includes('powerjet') || clean.includes('jet')) {
      return {
        title: 'Foam & Power Jet AC Service',
        includes: [
          'Specialized antibacterial foam wash on cooling coils',
          'High-pressure power jet cleaning of indoor cooling fins',
          'Outdoor unit condenser coil deep wash',
          'Drain tray flush & gas pressure diagnostic'
        ],
        excludes: ['Spare parts replacement'],
        timeEstimate: '45m'
      };
    }
    return {
      title: 'Premium AC Service & Checkup',
      includes: [
        'Indoor unit air filter, cooling coil & blower cleaning',
        'Outdoor unit condenser wash for maximum heat dissipation',
        'Operating current (Amps) & cooling airflow temperature check',
        'Drain pipe flushing to prevent water leakage'
      ],
      excludes: ['Gas refill'],
      timeEstimate: '45m'
    };
  }

  // Electrical Services
  if (categoryName.toLowerCase().includes('electr') || clean.includes('fan') || clean.includes('switch') || clean.includes('wiring') || clean.includes('mcb')) {
    return {
      title: 'Certified Electrician Service',
      includes: [
        'Complete electrical safety inspection & grounding test',
        'Professional installation / repair using calibrated tools',
        'Spark-free terminal tightening & load checking',
        'Clean post-service cleanup and operation testing'
      ],
      excludes: ['Material / spare parts cost (charged at transparent MRP)'],
      timeEstimate: '30m - 1h'
    };
  }

  // Plumbing Services
  if (categoryName.toLowerCase().includes('plumb') || clean.includes('tap') || clean.includes('pipe') || clean.includes('leak') || clean.includes('tank')) {
    return {
      title: 'Expert Plumbing Service',
      includes: [
        'Problem diagnostic & water line pressure testing',
        'High-grade Teflon sealing & precision fixture installation',
        'Blockage removal using commercial unblocking tools',
        'Zero-leakage verification under active line pressure'
      ],
      excludes: ['New pipe / tap material costs'],
      timeEstimate: '30m - 1h'
    };
  }

  // Appliance Services
  return {
    title: serviceName || 'Professional Home Service',
    includes: [
      'Comprehensive diagnostic checkup by verified specialist',
      'Professional cleaning, repair & performance calibration',
      'Quality spare check with post-service operational testing',
      '30-day service warranty on labour & workmanship'
    ],
    excludes: ['Commercial / industrial equipment'],
    timeEstimate: '45m - 1h'
  };
}
