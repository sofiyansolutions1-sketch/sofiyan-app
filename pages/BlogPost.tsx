import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin, Clock, Share2 } from 'lucide-react';
import { SERVICES } from '../constants';

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

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text ? text.replace(/<[^>]*>?/gm, '').split(/\s+/).length : 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleBookService = () => {
    if (!post?.related_service) {
      navigate('/');
      return;
    }

    const serviceName = post.related_service;
    
    // Check if it's a category
    const isCategory = SERVICES.some(c => c.name === serviceName);
    
    if (isCategory) {
      // It's a category, navigate to home and open category view
      navigate('/');
      setTimeout(() => {
        if ((window as any).openCategoryView) {
          (window as any).openCategoryView(serviceName);
        }
      }, 300);
    } else {
      // It's a sub-service, find it
      let foundSubService: any = null;
      let foundCategoryName = '';
      
      for (const category of SERVICES) {
        const sub = category.subServices.find(s => s.name === serviceName);
        if (sub) {
          foundSubService = sub;
          foundCategoryName = category.name;
          break;
        }
      }
      
      if (foundSubService) {
        navigate('/');
        setTimeout(() => {
          if ((window as any).addServiceToCart) {
            (window as any).addServiceToCart(foundSubService.id, foundSubService.name, foundSubService.price, foundCategoryName);
          }
          if ((window as any).openCartSidebar) {
            (window as any).openCartSidebar();
          } else if ((window as any).openReactCheckout) {
            (window as any).openReactCheckout();
          }
        }, 300);
      } else {
        // Fallback
        navigate('/');
      }
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

  // JSON-LD Schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.image_url ? [post.image_url] : [],
    "datePublished": post.created_at,
    "dateModified": post.created_at,
    "author": [{
        "@type": "Person",
        "name": post.author || "Admin",
        "url": "https://www.sofiyansolutions.com/about"
      }]
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Inject JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      <article className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <button 
          onClick={() => navigate('/blogs')}
          className="text-indigo-600 mb-8 inline-flex items-center hover:text-indigo-800 font-semibold transition-colors relative z-10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all articles
        </button>
        
        <header className="mb-10 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>
          
          {post.sub_heading && (
            <h2 className="text-2xl text-gray-600 mb-8 font-medium leading-relaxed">
              {post.sub_heading}
            </h2>
          )}
          
          <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-blue-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl shadow-sm border border-indigo-100">
                {post.author ? post.author.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{post.author || 'Admin'}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                  <span>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {calculateReadingTime(post.content)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {post.target_locations && (
                <div className="hidden md:flex items-center text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                  <MapPin className="w-4 h-4 mr-2" />
                  {post.target_locations}
                </div>
              )}
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: post.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                }}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Share Article"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {post.image_url && (
          <figure className="mb-12 rounded-2xl overflow-hidden shadow-lg border border-gray-100 relative z-10 group">
            <img src={post.image_url} alt={post.title} className="w-full h-auto max-h-[550px] object-cover transition-transform duration-700 group-hover:scale-105" />
          </figure>
        )}
        
        {/* Blog Content */}
        <div 
          className="prose prose-lg prose-indigo max-w-none text-gray-800 leading-relaxed relative z-10
                     prose-headings:font-bold prose-headings:text-gray-900 prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
                     prose-p:mb-6 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.related_service && (
          <footer className="mt-16 p-10 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl text-center border border-indigo-100 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-blue-500"></div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-4">Need Professional Help?</h3>
            <p className="text-gray-600 mb-8 text-lg">Don't wait! Book our expert <strong className="text-indigo-700">{post.related_service}</strong> services today and get your problem fixed fast.</p>
            <button 
              onClick={handleBookService}
              className="inline-block bg-indigo-600 text-white font-bold px-10 py-4 rounded-xl shadow-xl hover:bg-indigo-700 hover:shadow-2xl transition-all transform hover:-translate-y-1 text-lg"
            >
              Book Service Now
            </button>
          </footer>
        )}
      </article>
    </main>
  );
};
