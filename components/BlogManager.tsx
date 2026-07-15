import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Edit2, Trash2 } from 'lucide-react';
import { SERVICES } from '../constants';

export const BlogManager: React.FC = () => {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [subHeading, setSubHeading] = useState('');
    const [targetKeywords, setTargetKeywords] = useState('');
    const [targetLocations, setTargetLocations] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [relatedService, setRelatedService] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [content, setContent] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchBlogs = async () => {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching blogs:', error);
        } else if (data) {
            setBlogs(data);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchBlogs();
    }, []);

    const generateSlug = (text: string) => {
        const generatedSlug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setSlug(generatedSlug);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        if (!editingId) {
            generateSlug(e.target.value);
        }
    };

    const saveBlogPost = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPublishing(true);

        const blogData = {
            title,
            slug,
            sub_heading: subHeading,
            target_keywords: targetKeywords,
            target_locations: targetLocations,
            meta_description: metaDescription,
            related_service: relatedService,
            image_url: imageUrl,
            content,
            author: 'Admin',
            status: 'published'
        };

        let error;

        if (editingId) {
            const { error: updateError } = await supabase
                .from('blog_posts')
                .update(blogData)
                .eq('id', editingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('blog_posts')
                .insert([blogData]);
            error = insertError;
        }

        setIsPublishing(false);

        if (error) {
            console.error("Supabase Error:", error);
            alert('Error publishing article: ' + error.message);
        } else {
            alert(editingId ? 'Article Updated Successfully!' : 'Article Published Successfully!');
            resetForm();
            fetchBlogs();
        }
    };

    const editBlog = (blog: any) => {
        setEditingId(blog.id);
        setTitle(blog.title || '');
        setSlug(blog.slug || '');
        setSubHeading(blog.sub_heading || '');
        setTargetKeywords(blog.target_keywords || '');
        setTargetLocations(blog.target_locations || '');
        setMetaDescription(blog.meta_description || '');
        setRelatedService(blog.related_service || '');
        setImageUrl(blog.image_url || '');
        setContent(blog.content || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteBlog = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) {
            alert('Error deleting article: ' + error.message);
        } else {
            fetchBlogs();
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setSlug('');
        setSubHeading('');
        setTargetKeywords('');
        setTargetLocations('');
        setMetaDescription('');
        setRelatedService('');
        setImageUrl('');
        setContent('');
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter">
                        {editingId ? 'Edit Article' : 'Create New Article'}
                    </h2>
                    {editingId && (
                        <button 
                            onClick={resetForm}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
                
                <form onSubmit={saveBlogPost} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Article Title (H1)</label>
                            <input type="text" value={title} onChange={handleTitleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">URL Slug (Unique)</label>
                            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" required placeholder="e.g., ac-not-cooling-bengaluru" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-Heading</label>
                            <input type="text" value={subHeading} onChange={(e) => setSubHeading(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Target Keywords (Comma separated)</label>
                            <input type="text" value={targetKeywords} onChange={(e) => setTargetKeywords(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., best ac repair, plumber near me" />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Target Locations</label>
                            <input type="text" value={targetLocations} onChange={(e) => setTargetLocations(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Delhi, Varanasi, Bengaluru" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Description (SEO)</label>
                            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={2} placeholder="Write a compelling description for Google search results..."></textarea>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Featured Image URL</label>
                            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://example.com/image.jpg" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Related Service (For Booking Link)</label>
                            <select value={relatedService} onChange={(e) => setRelatedService(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option value="">None</option>
                                {SERVICES.map((category) => (
                                    <optgroup key={category.name} label={category.name}>
                                        <option value={category.name}>{category.name} (General)</option>
                                        {category.subServices.map((sub) => (
                                            <option key={sub.id} value={sub.name}>
                                                -- {sub.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Article Content (HTML allowed)</label>
                            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" rows={12} required placeholder="<p>Write your SEO-optimized article here...</p>"></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button type="submit" disabled={isPublishing} className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-indigo-700 transition shadow-lg disabled:opacity-50">
                            {isPublishing ? 'Publishing...' : (editingId ? 'Update Article' : 'Publish Article')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Published Blogs List */}
            <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-xl sm:text-2xl font-black mb-6 text-gray-900 uppercase tracking-tighter">Published Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                </div>
            </div>
        </div>
    );
};
