const fs = require('fs');
let content = fs.readFileSync('components/BlogManager.tsx', 'utf8');

// Replace table with responsive cards
const oldTable = `<div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 font-semibold text-gray-600">Title</th>
                                <th className="p-4 font-semibold text-gray-600">Slug</th>
                                <th className="p-4 font-semibold text-gray-600">Date</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-500">No articles published yet.</td>
                                </tr>
                            ) : (
                                blogs.map(blog => (
                                    <tr key={blog.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-800">{blog.title}</td>
                                        <td className="p-4 text-gray-500 text-sm">{blog.slug}</td>
                                        <td className="p-4 text-gray-500 text-sm">{new Date(blog.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => editBlog(blog)} className="text-indigo-600 hover:text-indigo-800 mr-3 inline-flex items-center">
                                                <Edit2 size={16} className="mr-1" /> Edit
                                            </button>
                                            <button onClick={() => deleteBlog(blog.id)} className="text-red-600 hover:text-red-800 inline-flex items-center">
                                                <Trash2 size={16} className="mr-1" /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>`;

const newCards = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {blogs.length === 0 ? (
                        <div className="col-span-full p-8 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
                            No articles published yet. Check back soon!
                        </div>
                    ) : (
                        blogs.map(blog => (
                            <div key={blog.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">{blog.title}</h3>
                                    <p className="text-xs text-gray-500 mb-2 truncate" title={blog.slug}>{blog.slug}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(blog.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-50">
                                    <button onClick={() => editBlog(blog)} className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                                        <Edit2 size={14} className="mr-1" /> Edit
                                    </button>
                                    <button onClick={() => deleteBlog(blog.id)} className="flex items-center text-xs font-bold text-red-600 hover:text-red-800 transition">
                                        <Trash2 size={14} className="mr-1" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>`;

content = content.replace(oldTable, newCards);

const oldHeader1 = `<div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">`;
const newHeader1 = `<div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-gray-100">`;
content = content.replace(oldHeader1, newHeader1);
content = content.replace(oldHeader1, newHeader1);

const oldHeader2 = `<h2 className="text-2xl font-bold text-gray-800">`;
const newHeader2 = `<h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter">`;
content = content.replace(oldHeader2, newHeader2);

const oldHeader3 = `<h2 className="text-xl font-bold mb-6 text-gray-800">Published Articles</h2>`;
const newHeader3 = `<h2 className="text-xl sm:text-2xl font-black mb-6 text-gray-900 uppercase tracking-tighter">Published Articles</h2>`;
content = content.replace(oldHeader3, newHeader3);

fs.writeFileSync('components/BlogManager.tsx', content);
