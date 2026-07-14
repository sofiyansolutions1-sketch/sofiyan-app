/**
 * Pincode-Based Discovery & Matching System Service
 * Uses the FREE India Post API: https://api.postalpincode.in/
 */

const PIN_DICTIONARY: Record<string, string[]> = {
    'lajpat nagar': ['110024'],
    'koramangala': ['560034', '560047', '560095'],
    'indiranagar': ['560038', '560008'],
    'whitefield': ['560066'],
    'jayanagar': ['560041', '560011', '560069', '560070', '560082'],
    'hsr layout': ['560102'],
    'malleshwaram': ['560003'],
    'marathahalli': ['560037'],
    'hebbal': ['560024'],
    'gole market': ['110001'],
    'connaught place': ['110001'],
    'karol bagh': ['110005'],
    'south ext': ['110049'],
    'saket': ['110017'],
    'vasant kunj': ['110070'],
    'rajouri garden': ['110027'],
    'dwarka': ['110075'],
    'rohini': ['110085']
};

const AREA_DICTIONARY: Record<string, { areas: string[]; isBangalore: boolean }> = {
    '110024': { areas: ['Lajpat Nagar', 'Lajpat Nagar Double Storey'], isBangalore: false },
    '560034': { areas: ['Koramangala', 'Koramangala Iii Block'], isBangalore: true },
    '560038': { areas: ['Indiranagar', 'Indiranagar H.O'], isBangalore: true },
    '560066': { areas: ['Whitefield', 'Ramagondanahalli'], isBangalore: true },
    '560102': { areas: ['HSR Layout', 'Agara'], isBangalore: true },
    '560003': { areas: ['Malleshwaram', 'Vyalikaval'], isBangalore: true },
    '560037': { areas: ['Marathahalli', 'Kundalahalli'], isBangalore: true }
};

/**
 * Iterates through an array of area names, querying the India Post API
 * to extract all unique 6-digit pincodes associated with those local areas.
 * 
 * @param areaNames Array of area names (e.g., ['Koramangala', 'Whitefield'])
 * @returns Promise<string[]> Array of unique 6-digit pincodes
 */
export async function fetchPincodesByArea(areaNames: string[]): Promise<string[]> {
    const allPincodes = new Set<string>();

    for (let area of areaNames) {
        area = area.trim();
        if (!area) continue;

        // Try local static dictionary first for instant performance
        const matchedLocal = PIN_DICTIONARY[area.toLowerCase()];
        if (matchedLocal && matchedLocal.length > 0) {
            matchedLocal.forEach(p => allPincodes.add(p));
            continue;
        }

        try {
            // Try proxy route first to bypass CORS
            let apiRes = await fetch(`/api/pincode/postoffice/${encodeURIComponent(area)}`).catch(() => null);
            
            // Fallback directly to the public API if proxy is unavailable or fails
            if (!apiRes || !apiRes.ok) {
                apiRes = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(area)}`);
            }
            
            if (apiRes && apiRes.ok) {
                const text = await apiRes.text();
                let data;
                try { data = JSON.parse(text); } catch { console.warn("Failed to parse", text); }
                
                // India Post API returns an array containing Status and PostOffice details
                if (data && data[0] && data[0].Status === 'Success') {
                    const postOffices = data[0].PostOffice;
                    postOffices.forEach((po: any) => {
                        if (po.Pincode) {
                            allPincodes.add(po.Pincode);
                        }
                    });
                }
            }
        } catch (error) {
            console.warn(`Pincode Discovery Error for area "${area}", details:`, error);
        }
    }

    // Secondary fallback in case no pincodes were fetched but we can match a substring
    if (allPincodes.size === 0) {
        for (const area of areaNames) {
            const lowerArea = area.toLowerCase();
            for (const key of Object.keys(PIN_DICTIONARY)) {
                if (lowerArea.includes(key) || key.includes(lowerArea)) {
                    PIN_DICTIONARY[key].forEach(p => allPincodes.add(p));
                }
            }
        }
    }

    return Array.from(allPincodes);
}

/**
 * Scans a customer's raw address string to reliably identify a Pincode.
 * - Extracts a standard 6-digit number if present.
 * - If absent, it splits the address to guess the area and queries the India Post API automatically.
 * 
 * @param addressText Full customer inputted address
 * @returns Promise<string | null> Extracted or discovered pincode
 */
export async function identifyPincode(addressText: string): Promise<string | null> {
    if (!addressText) return null;

    // 1. Regex check for direct 6 digit numeric input in the address string
    const regexMatch = addressText.match(/\b\d{6}\b/);
    if (regexMatch) {
        return regexMatch[0];
    }

    // 2. Fallback to API resolution using trailing address subsets (predictably area/locality names)
    const components = addressText.split(',').map(p => p.trim()).filter(p => p.length > 2);
    
    // We prioritize the last 3 chunks of an address (often Area, City, State demarcations)
    const areasToGuess = components.slice(-3).reverse(); 

    for (const area of areasToGuess) {
        try {
            const apiRes = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(area)}`);
            if (!apiRes.ok) continue;

            const text = await apiRes.text();
            let data;
            try { data = JSON.parse(text); } catch { console.warn("Failed to parse", text); }
            if (data && data[0] && data[0].Status === 'Success') {
                const postOffices = data[0].PostOffice;
                if (postOffices.length > 0 && postOffices[0].Pincode) {
                    return postOffices[0].Pincode;
                }
            }
        } catch (error) {
            console.warn(`Could not resolve API fallback for segment: ${area}`, error);
        }
    }

    return null; // Fallback entirely if not discernible
}

/**
 * Reverse-lookups a 6-digit Pincode to return associated area names and checking if it sits in Bangalore.
 * @param pincode 6-digit numeric Pincode
 * @returns Promise with areas and isBangalore flag
 */
export async function fetchAreasByPincode(pincode: string): Promise<{ success: boolean; areas: string[]; isBangalore: boolean; error?: string }> {
    if (!pincode || pincode.length !== 6 || isNaN(Number(pincode))) {
        return { success: false, areas: [], isBangalore: false, error: 'Invalid PIN configuration' };
    }

    // Try local static dictionary lookups first for instant result
    const localMatch = AREA_DICTIONARY[pincode];
    if (localMatch) {
        return { success: true, areas: localMatch.areas, isBangalore: localMatch.isBangalore };
    }

    try {
        // Try proxy path first to bypass CORS
        let apiRes = await fetch(`/api/pincode/code/${pincode}`).catch(() => null);

        if (!apiRes || !apiRes.ok) {
            apiRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        }

        if (!apiRes.ok) return { success: false, areas: [], isBangalore: false, error: 'API unreachable' };

        const text = await apiRes.text();
        let data;
        try { data = JSON.parse(text); } catch { console.warn("Failed to parse", text); }
        if (data && data[0] && data[0].Status === 'Success') {
            const postOffices = data[0].PostOffice || [];
            
            // Collect the names of matching local areas
            const areas = postOffices.map((po: any) => po.Name);
            
            // Determine if these belong to Bangalore City mapping
            // Note: the APIs sometimes use 'Bangalore', 'Bengaluru', 'Bengaluru Rural', etc. 
            const isBangalore = postOffices.some((po: any) => 
                (po.District && po.District.toLowerCase().includes('bangalore')) ||
                (po.District && po.District.toLowerCase().includes('bengaluru')) ||
                (po.Region && po.Region.toLowerCase().includes('bangalore')) ||
                (po.Division && po.Division.toLowerCase().includes('bangalore'))
            );

            return { success: true, areas, isBangalore };
        } else {
            return { success: false, areas: [], isBangalore: false, error: 'Pincode not found' };
        }
    } catch (error) {
        console.warn(`Error resolving Pincode ${pincode}, fallback lookup used:`, error);
        
        // If everything fails, try to see if pincode fits Delhi / Bangalore standard range
        // Bangalore pincodes start with 560
        // Delhi pincodes start with 110
        const isBangaloreGroup = pincode.startsWith('560');
        const isDelhiGroup = pincode.startsWith('110');
        if (isBangaloreGroup || isDelhiGroup) {
            return { 
                success: true, 
                areas: [isBangaloreGroup ? 'Bangalore Area' : 'Delhi Area'], 
                isBangalore: isBangaloreGroup 
            };
        }

        return { success: false, areas: [], isBangalore: false, error: 'Network error connecting to resolution service' };
    }
}

