import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, Loader2, Clock, ChevronRight, ChevronLeft } from 'lucide-react';

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
        .select('title, slug, sub_heading, target_locations, created_at, content, meta_description, image_url')
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

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text ? text.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const formatLocations = (locations: string) => {
    if (!locations) return 'All Cities';
    const locArray = locations.split(',').map(l => l.trim());
    if (locArray.length > 2) {
      return `${locArray[0]}, ${locArray[1]} +${locArray.length - 2} more`;
    }
    return locations;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
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

  const getSnippet = (post: any) => {
    let snippet = post.sub_heading || post.meta_description || '';
    if (!snippet && post.content) {
      snippet = post.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
    }
    return snippet;
  };

  const scrollLeft = () => {
    const container = document.getElementById('blog-scroll-container');
    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById('blog-scroll-container');
    if (container) {
      container.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="flex flex-col md:flex-row justify-between items-end mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Latest Articles</h1>
          <p className="text-xl text-gray-500">Expert advice, home maintenance tips, and local insights.</p>
        </div>
        <div className="hidden md:flex gap-3 mt-6 md:mt-0">
          <button onClick={scrollLeft} className="p-3 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={scrollRight} className="p-3 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div 
          id="blog-scroll-container"
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 pt-4 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {blogs.map((post) => (
            <article 
              key={post.slug}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="snap-start shrink-0 w-[85vw] sm:w-[400px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex flex-col group cursor-pointer"
            >
              <div className="h-64 overflow-hidden relative bg-gray-50">
                {post.image_url ? (
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 font-bold text-2xl">{post.title.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-800 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm">
                    {formatLocations(post.target_locations)}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 font-medium">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                    {calculateReadingTime(post.content)}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 mb-8 text-base line-clamp-3 flex-grow leading-relaxed">
                  {getSnippet(post)}
                </p>
                
                <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-800 transition mt-auto">
                  Read Article 
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
        
        {/* Mobile scroll hint */}
        <div className="md:hidden flex justify-center mt-2 mb-8 text-gray-400 text-sm flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Swipe to explore
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
};
