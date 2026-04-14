import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Partner } from '../types';
import { Star, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient';

export const PartnerManager: React.FC = () => {
    const { partners, updatePartner } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (partner: Partner, newStatus: 'available' | 'busy' | 'on_hold' | 'blocked') => {
        if (!window.confirm(`Are you sure you want to change ${partner.name}'s status to ${newStatus}?`)) return;
        
        setIsUpdating(true);
        try {
            const table = partner.partner_type === 'Primary' ? 'primary_partners' : 'secondary_partners';
            const { error } = await supabase
                .from(table)
                .update({ status: newStatus })
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
            case 'available': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Available</span>;
            case 'busy': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3"/> Busy</span>;
            case 'on_hold': return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3"/> On Hold</span>;
            case 'blocked': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Blocked</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Quality Control & Action System</h2>
                <div className="w-64">
                    <input 
                        type="text" 
                        placeholder="Search partners..." 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                            <th className="p-4 text-sm font-semibold text-gray-600">Type</th>
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
                                </td>
                                <td className="p-4">
                                    <div className="text-sm text-gray-700">{partner.phone}</div>
                                    <div className="text-xs text-gray-500">{partner.email}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${partner.partner_type === 'Primary' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'}`}>
                                        {partner.partner_type}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {renderStars(partner.rating)}
                                    <div className="text-xs text-gray-500 mt-1">{partner.review_count || 0} reviews</div>
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(partner.status)}
                                </td>
                                <td className="p-4">
                                    <select 
                                        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={partner.status}
                                        onChange={(e) => handleStatusChange(partner, e.target.value as any)}
                                        disabled={isUpdating}
                                    >
                                        <option value="available">Available</option>
                                        <option value="busy">Busy</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
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
