const fs = require('fs');
let content = fs.readFileSync('components/PartnerManager.tsx', 'utf8');

const oldTable = `<div className="overflow-x-auto">
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
                                            onChange={(e) => updatePartnerStatus(partner.id, e.target.value)}
                                        >
                                            <option value="available">Available</option>
                                            <option value="busy">Busy</option>
                                            <option value="on_hold">On Hold</option>
                                            <option value="blocked">Blocked</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                        <button className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 self-start">
                                            View Details
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>`;

const newCards = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPartners.map(partner => (
                    <div key={partner.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900">{partner.name}</h3>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{partner.city || 'N/A'}</p>
                                </div>
                                {getStatusBadge(partner.status)}
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-700">
                                    <Phone className="w-4 h-4 mr-2 text-indigo-400" />
                                    {partner.phone}
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <Mail className="w-4 h-4 mr-2 text-indigo-400" />
                                    {partner.email}
                                </div>
                                {partner.aadhar_number && (
                                    <div className="text-[10px] text-gray-500 font-mono flex items-center bg-gray-50 p-1.5 rounded">
                                        <ShieldAlert className="w-3 h-3 mr-1 text-gray-400" />
                                        ID: {partner.aadhar_number}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <div className="flex justify-between items-center mb-3">
                                {renderStars(partner.rating)}
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{partner.review_count || 0} reviews</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <select 
                                    className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-2 bg-gray-50 font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={partner.status}
                                    onChange={(e) => updatePartnerStatus(partner.id, e.target.value)}
                                >
                                    <option value="available">Set Active</option>
                                    <option value="busy">Set Busy</option>
                                    <option value="on_hold">Put On Hold</option>
                                    <option value="blocked">Block</option>
                                    <option value="pending">Set Pending</option>
                                </select>
                                <button className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition">
                                    Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>`;

// First need to add Phone, Mail to imports if they aren't there
content = content.replace(oldTable, newCards);
if (!content.includes('Mail')) {
    content = content.replace(/import \{([^}]+)\} from 'lucide-react';/, "import {$1, Phone, Mail} from 'lucide-react';");
}

fs.writeFileSync('components/PartnerManager.tsx', content);
