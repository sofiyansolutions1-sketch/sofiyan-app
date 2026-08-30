import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Partner } from '../types';
import { Star, ShieldAlert, CheckCircle, Clock, Eye, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getSignedAppFileUrl } from '../services/storageService';

export const PartnerManager: React.FC = () => {
    const { partners, updatePartner } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [previewDocs, setPreviewDocs] = useState<{ name: string; docs: any } | null>(null);

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
        p.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.categories && p.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())))
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

    const openDocumentPreview = async (partner: Partner) => {
        if (!partner.id_proof_url) return;
        try {
            let parsed: any;
            try {
                parsed = JSON.parse(partner.id_proof_url);
            } catch {
                parsed = { profilePhoto: partner.id_proof_url };
            }

            // Immediately set whatever we have to show the modal
            setPreviewDocs({ name: partner.name, docs: parsed });

            // Fetch signed URLs for all storage items asynchronously
            const [signedProfile, signedAadhaar, signedShop, signedRegFee] = await Promise.all([
                getSignedAppFileUrl(parsed.profilePhoto),
                getSignedAppFileUrl(parsed.aadhaarPhoto),
                getSignedAppFileUrl(parsed.shopPhoto),
                getSignedAppFileUrl(parsed.registrationFeeScreenshot)
            ]);

            let signedBusiness: string[] = [];
            if (Array.isArray(parsed.businessPhotos) && parsed.businessPhotos.length > 0) {
                signedBusiness = (await Promise.all(
                    parsed.businessPhotos.map((p: string) => getSignedAppFileUrl(p))
                )).filter(Boolean) as string[];
            }

            setPreviewDocs({
                name: partner.name,
                docs: {
                    ...parsed,
                    profilePhoto: signedProfile || parsed.profilePhoto,
                    aadhaarPhoto: signedAadhaar || parsed.aadhaarPhoto,
                    shopPhoto: signedShop || parsed.shopPhoto,
                    businessPhotos: signedBusiness.length > 0 ? signedBusiness : parsed.businessPhotos,
                    registrationFeeScreenshot: signedRegFee || parsed.registrationFeeScreenshot
                }
            });
        } catch (err) {
            console.error("Error generating signed URLs for preview docs:", err);
            setPreviewDocs({ name: partner.name, docs: { profilePhoto: partner.id_proof_url } });
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter">Technician Directory</h2>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Quality Control & Verification System</p>
                </div>
                <div className="w-full md:w-72">
                    <input 
                        type="text" 
                        placeholder="Search partners by name, phone, category..." 
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
                            <th className="p-4 text-sm font-semibold text-gray-600">Partner Details</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Categories & Area</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Rating</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPartners.map(partner => (
                            <tr key={partner.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{partner.name}</div>
                                    <div className="text-xs text-gray-600 mt-0.5">{partner.phone} {partner.alt_phone ? `• Alt: ${partner.alt_phone}` : ''}</div>
                                    <div className="text-xs text-gray-500">{partner.email}</div>
                                    {partner.aadhar_number && (
                                        <div className="text-[11px] text-gray-700 mt-1 font-mono font-medium">Aadhaar: {partner.aadhar_number}</div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1 mb-1">
                                        {partner.categories && partner.categories.length > 0 ? (
                                            partner.categories.map((cat, idx) => (
                                                <span key={idx} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                                    {cat}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400">General</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-600">{partner.city || 'N/A'} {partner.pincode ? `(${partner.pincode})` : ''}</div>
                                    {partner.address && (
                                        <div className="text-[11px] text-gray-500 line-clamp-1">{partner.address}</div>
                                    )}
                                </td>
                                <td className="p-4">
                                    {renderStars(partner.rating)}
                                    <div className="text-xs text-gray-500 mt-1">{partner.review_count || 0} reviews</div>
                                    <div className="text-xs font-semibold text-emerald-600 mt-0.5">{partner.completedJobs || 0} jobs done</div>
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(partner.status)}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-2">
                                        <select 
                                            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-36 font-medium shadow-sm"
                                            value={partner.status}
                                            onChange={(e) => handleStatusChange(partner, e.target.value as any)}
                                            disabled={isUpdating}
                                        >
                                            <option value="pending">Verification</option>
                                            <option value="available">Active (Available)</option>
                                            <option value="busy">Busy</option>
                                            <option value="on_hold">On Hold</option>
                                            <option value="blocked">Blocked</option>
                                        </select>
                                        
                                        {partner.status === 'pending' && (
                                            <button 
                                                onClick={() => handleVerify(partner)}
                                                className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition w-36 shadow-sm flex items-center justify-center gap-1"
                                            >
                                                <CheckCircle size={13} /> Approve Partner
                                            </button>
                                        )}

                                        {partner.id_proof_url && (
                                            <button 
                                                onClick={() => openDocumentPreview(partner)}
                                                className="px-2.5 py-1 text-xs text-indigo-600 font-bold hover:bg-indigo-50 border border-indigo-200 rounded-lg transition w-36 flex items-center justify-center gap-1"
                                            >
                                                <Eye size={12} /> View Documents
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredPartners.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No partners found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Document Preview Modal */}
            {previewDocs && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-gray-900 text-base">{previewDocs.name} - Verification Documents</h3>
                            <button 
                                onClick={() => setPreviewDocs(null)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {previewDocs.docs?.profilePhoto && (
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Profile Photo / Selfie</div>
                                    <img 
                                        src={previewDocs.docs.profilePhoto} 
                                        alt="Profile Photo" 
                                        className="w-48 h-48 object-cover rounded-xl border border-gray-200 shadow-sm"
                                    />
                                </div>
                            )}

                            {previewDocs.docs?.aadhaarPhoto && (
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Aadhaar Card Photo</div>
                                    <img 
                                        src={previewDocs.docs.aadhaarPhoto} 
                                        alt="Aadhaar Photo" 
                                        className="w-full max-h-64 object-contain rounded-xl border border-gray-200 shadow-sm bg-gray-50"
                                    />
                                </div>
                            )}

                            {(previewDocs.docs?.shopPhoto || (previewDocs.docs?.businessPhotos && previewDocs.docs.businessPhotos.length > 0)) && (
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Shop Image / Visiting Card / Banner Photo</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {previewDocs.docs?.shopPhoto && (
                                            <img 
                                                src={previewDocs.docs.shopPhoto} 
                                                alt="Shop / Visiting Card" 
                                                className="w-full h-36 object-cover rounded-xl border border-gray-200 shadow-sm"
                                            />
                                        )}
                                        {previewDocs.docs?.businessPhotos?.filter((b: string) => b !== previewDocs.docs?.shopPhoto).map((bImg: string, idx: number) => (
                                            <img 
                                                key={idx} 
                                                src={bImg} 
                                                alt={`Shop/Business ${idx}`} 
                                                className="w-full h-36 object-cover rounded-xl border border-gray-200 shadow-sm"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {previewDocs.docs?.registrationFeeScreenshot && (
                                <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                                            Registration Fee Receipt (₹499 Paid)
                                        </div>
                                        {previewDocs.docs?.paymentVerificationCode && (
                                            <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                                                Code: {previewDocs.docs.paymentVerificationCode}
                                            </span>
                                        )}
                                    </div>
                                    <img 
                                        src={previewDocs.docs.registrationFeeScreenshot} 
                                        alt="Registration Fee Payment Receipt" 
                                        className="w-full max-h-64 object-contain rounded-xl border border-emerald-200 shadow-sm bg-white"
                                    />
                                </div>
                            )}

                            {!previewDocs.docs?.profilePhoto && !previewDocs.docs?.aadhaarPhoto && (
                                <p className="text-xs text-gray-500">No image previews available.</p>
                            )}
                        </div>

                        <div className="pt-3 border-t flex justify-end">
                            <button
                                onClick={() => setPreviewDocs(null)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
