import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Partner } from '../types';
import { Star, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient';

export const PartnerManager: React.FC = () => {
    const { partners, updatePartner } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (partner: Partner, newStatus: 'available' | 'busy' | 'on_hold' | 'blocked' | 'pending') => {
        if (!window.confirm(`Are you sure you want to change ${partner.name}'s status to ${newStatus}?`)) return;
        
        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('primary_partners')
                .update({ status: newStatus === 'available' ? 'available' : newStatus })
                .eq('id', partner.id);

            if (error) throw error;

            updatePartner({ ...partner, status: newStatus });
            alert(`Partner status updated to ${newStatus}`);
        } catch (error: any) {
            console.error('Error updating partner status:', error);
            alert('Failed to update partner status: ' + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleVerify = async (partner: Partner) => {
        if (!window.confirm(`Reviewing ${partner.name}'s ID proof? Click OK to mark as VERIFIED and AVAILABLE.`)) return;
        await handleStatusChange(partner, 'available');
    };

    const filteredPartners = partners.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm) ||
        p.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (rating: number = 0) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                ))}
                <span className="ml-2 text-sm text-gray-600 font-medium">{rating.toFixed(1)}</span>
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Active</span>;
            case 'busy': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3"/> Busy</span>;
            case 'on_hold': return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3"/> On Hold</span>;
            case 'blocked': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Blocked</span>;
            case 'pending': return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3 animate-pulse"/> Verification</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter">Technician Directory</h2>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Quality Control & Action System</p>
                </div>
                <div className="w-full md:w-72">
                    <input 
                        type="text" 
                        placeholder="Search partners..." 
                        className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="p-4 text-sm font-semibold text-gray-600">Partner Name</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Contact</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Rating</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPartners.map(partner => (
                            <tr key={partner.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="font-medium text-gray-800">{partner.name}</div>
                                    <div className="text-xs text-gray-500">{partner.city || 'N/A'}</div>
                                    {partner.aadhar_number && (
                                        <div className="text-[10px] text-gray-500 mt-1 font-mono">Aadhaar: {partner.aadhar_number}</div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="text-sm text-gray-700">{partner.phone}</div>
                                    <div className="text-xs text-gray-500">{partner.email}</div>
                                </td>
                                <td className="p-4">
                                    {renderStars(partner.rating)}
                                    <div className="text-xs text-gray-500 mt-1">{partner.review_count || 0} reviews</div>
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(partner.status)}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-2">
                                        <select 
                                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-32"
                                            value={partner.status}
                                            onChange={(e) => handleStatusChange(partner, e.target.value as any)}
                                            disabled={isUpdating}
                                        >
                                            <option value="pending">Verification</option>
                                            <option value="available">Active</option>
                                            <option value="busy">Busy</option>
                                            <option value="on_hold">On Hold</option>
                                            <option value="blocked">Blocked</option>
                                        </select>
                                        
                                        {partner.status === 'pending' && (
                                            <button 
                                                onClick={() => handleVerify(partner)}
                                                className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 transition w-32 shadow-sm"
                                            >
                                                Verify Partner
                                            </button>
                                        )}

                                        {partner.aadhar_number && (
                                            <div className="text-[10px] text-gray-500 font-mono">ID: {partner.aadhar_number}</div>
                                        )}
                                        {partner.id_proof_url && (
                                            <a 
                                                href={partner.id_proof_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-indigo-600 font-bold hover:underline"
                                            >
                                                View ID Proof
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredPartners.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No partners found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
