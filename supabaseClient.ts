import { createClient } from '@supabase/supabase-js';

// Use environment variables for Netlify, but keep hardcoded values as fallback so it works instantly.
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://bvtqginkszmzzmetdjdm.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_F0wwfftZVcsHQhoNStUQqw_UgPaOyYq";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Attach to window object so inline onclick="" can access it anywhere
(window as any).cancelLeadByAdmin = async function(bookingId: string) {
    if(!confirm("Are you sure you want to CANCEL this lead? It will be removed from the active list.")) {
        return;
    }
    
    // Visual feedback during processing
    const event = (window as any).event;
    const btn = event?.currentTarget || event?.target;
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelling...';
        btn.disabled = true;
    }

    try {
        // Update Supabase Database
        const { error } = await supabase
            .from('bookings')
            .update({ status: 'Cancelled', assigned_partner_id: null })
            .eq('id', bookingId);
            
        if (error) throw error;
        
        alert('Lead Cancelled Successfully!');
        
        // Refresh the leads list securely
        if (typeof (window as any).fetchAdminLeads === 'function') {
            (window as any).fetchAdminLeads(); 
        } else {
            // Fallback if fetchAdminLeads is also scoped
            window.location.reload(); 
        }
        
    } catch (error) {
        console.error('Error cancelling lead:', error);
        alert('Failed to cancel lead. Please check the console.');
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};