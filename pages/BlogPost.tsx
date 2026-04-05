import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (slug: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setPost(data);

      // Update SEO
      if (data) {
        document.title = `${data.title} | Sofiyan Solutions`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.meta_description || data.sub_heading || '');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Article not found</h1>
        <p className="text-gray-500 mb-8">The article you are looking for does not exist.</p>
        <button 
          onClick={() => navigate('/blogs')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          &larr; Back to Blog Hub
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <button 
          onClick={() => navigate('/blogs')}
          className="text-indigo-600 mb-8 inline-flex items-center hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all articles
        </button>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>
        
        {post.sub_heading && (
          <h2 className="text-2xl text-gray-600 mb-8 font-medium">
            {post.sub_heading}
          </h2>
        )}
        
        <div className="flex items-center justify-between mb-10 pb-10 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
              {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <p className="font-bold text-gray-900">{post.author || 'Admin'}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          {post.target_locations && (
            <div className="hidden md:flex items-center text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
              <MapPin className="w-4 h-4 mr-2" />
              {post.target_locations}
            </div>
          )}
        </div>
        
        {/* Blog Content */}
        <div 
          className="prose prose-lg prose-indigo max-w-none text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.related_service && (
          <div className="mt-12 p-8 bg-indigo-50 rounded-2xl text-center border border-indigo-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Professional Help?</h3>
            <p className="text-gray-600 mb-6">Book our expert {post.related_service.replace('-', ' ')} services today.</p>
            <button 
              onClick={() => navigate('/')}
              className="inline-block bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Book Now
            </button>
          </div>
        )}
      </article>
    </div>
  );
};
