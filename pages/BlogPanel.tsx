import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Loader2 } from 'lucide-react';

export const BlogPanel: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('title, slug, sub_heading, target_locations, created_at, content, meta_description')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
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

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>Error loading articles: {error}</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        No articles published yet. Check back soon!
      </div>
    );
  }

  const featured = blogs[0];
  const restOfPosts = blogs.slice(1);

  const getSnippet = (post: any) => {
    let snippet = post.sub_heading || post.meta_description || '';
    if (!snippet && post.content) {
      snippet = post.content.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...';
    }
    return snippet;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Expert Home Service Guides</h1>
        <p className="text-xl text-gray-600">Tips, tricks, and local insights for maintaining your home.</p>
      </div>

      {/* Featured Post */}
      {featured && (
        <div 
          onClick={() => navigate(`/blog/${featured.slug}`)}
          className="mb-16 bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col md:flex-row"
        >
          <div className="md:w-1/2 bg-indigo-600 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <span className="inline-block px-4 py-1 bg-white/20 text-white text-xs font-bold tracking-wider uppercase rounded-full w-max mb-6 backdrop-blur-sm border border-white/30">
              Featured Article
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight group-hover:underline decoration-white/50 underline-offset-4">
              {featured.title}
            </h2>
            <div className="flex items-center text-indigo-100 text-sm font-medium mt-auto pt-8">
              <span className="mr-4 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(featured.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {featured.target_locations || 'All Cities'}
              </span>
            </div>
          </div>
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gray-50">
            <p className="text-gray-600 text-lg mb-8 line-clamp-4 leading-relaxed">
              {getSnippet(featured)}
            </p>
            <button className="self-start bg-indigo-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all transform group-hover:-translate-y-1 flex items-center">
              Read Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Rest of the posts */}
      {restOfPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restOfPosts.map((post) => (
            <div 
              key={post.slug}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
            >
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {post.target_locations || 'All Cities'}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-6 text-base line-clamp-3 flex-grow">
                  {post.sub_heading || ''}
                </p>
                <div className="inline-flex items-center text-indigo-600 font-semibold group-hover:text-indigo-800 transition mt-auto">
                  Read Article 
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
