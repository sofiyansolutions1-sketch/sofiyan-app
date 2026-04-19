/**
 * Pincode-Based Discovery & Matching System Service
 * Uses the FREE India Post API: https://api.postalpincode.in/
 */

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

        try {
            const apiRes = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(area)}`);
            if (!apiRes.ok) continue;

            const data = await apiRes.json();
            
            // India Post API returns an array containing Status and PostOffice details
            if (data && data[0] && data[0].Status === 'Success') {
                const postOffices = data[0].PostOffice;
                postOffices.forEach((po: any) => {
                    if (po.Pincode) {
                        allPincodes.add(po.Pincode);
                    }
                });
            }
        } catch (error) {
            console.error(`Pincode Discovery Error for area "${area}":`, error);
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

            const data = await apiRes.json();
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

    try {
        const apiRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        if (!apiRes.ok) return { success: false, areas: [], isBangalore: false, error: 'API unreachable' };

        const data = await apiRes.json();
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
        console.error(`Error resolving Pincode ${pincode}:`, error);
        return { success: false, areas: [], isBangalore: false, error: 'Network error connecting to resolution service' };
    }
}

