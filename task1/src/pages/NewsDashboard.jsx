import React, { useState, useEffect } from 'react';
import { fetchNewsArticles } from '../services/newsService.js';
import NewsCard from '../components/NewsCard.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { Search, RotateCw, Newspaper, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['general', 'technology', 'business', 'science', 'sports'];

export default function NewsDashboard() {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('general');
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadArticles();
  }, [category, searchQuery, page]);

  const loadArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchNewsArticles(category, searchQuery);
      setArticles(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve news.');
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(query);
  };

  const handleCategoryChange = (cat) => {
    setQuery('');
    setSearchQuery('');
    setPage(1);
    setCategory(cat);
  };

  // Trending Highlight (first article)
  const trendingArticle = articles[0];
  const mainGridArticles = articles.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-all duration-700 px-4 py-8 md:px-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">
        
        {/* Search header container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-1.5 tracking-tight">
              <Newspaper className="h-6 w-6 text-indigo-500 shrink-0" />
              News Portal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Keep track of trending articles and technology headlines</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search news... (e.g. quantum)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/10"
            >
              Search
            </button>
            <button
              type="button"
              onClick={loadArticles}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/30 dark:bg-white/5 hover:bg-white/40 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 transition disabled:opacity-50"
              title="Refresh"
            >
              <RotateCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </form>
        </div>

        {/* Category Pills List */}
        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                category === cat && !searchQuery
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/45 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Alert for Error messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-700 dark:text-red-200 text-sm"
            >
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main News Dashboard Layout */}
        {loading ? (
          <SkeletonLoader type="news" />
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No articles available. Search again or change filter.</div>
        ) : (
          <div className="space-y-8">
            
            {/* Trending Hero Section */}
            {trendingArticle && !searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-3xl overflow-hidden relative min-h-[360px] md:h-[400px] flex flex-col md:flex-row group border border-slate-200 dark:border-white/5"
              >
                {/* Hero image */}
                <div className="w-full md:w-3/5 h-[200px] md:h-full relative bg-slate-900 overflow-hidden">
                  <img
                    src={trendingArticle.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
                    alt={trendingArticle.title}
                    className="w-full h-full object-cover group-hover:scale-101 transition duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                    ⚡ Trending Headline
                  </div>
                </div>

                {/* Hero Description */}
                <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col justify-between h-auto">
                  <div className="space-y-4">
                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-extrabold uppercase tracking-widest">
                      {trendingArticle.source?.name}
                    </p>
                    <h3 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {trendingArticle.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4">
                      {trendingArticle.description}
                    </p>
                  </div>
                  <a
                    href={trendingArticle.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 md:mt-0 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition text-center shadow-lg shadow-indigo-600/20"
                  >
                    Read Full Article
                  </a>
                </div>
              </motion.div>
            )}

            {/* Grid display of main articles list */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                Latest Stories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mainGridArticles.map((article, index) => (
                  <NewsCard key={article.url || index} article={article} index={index} />
                ))}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-200 dark:border-white/5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Page {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={articles.length < 5}
                className="p-2.5 rounded-xl bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200 disabled:opacity-40 transition flex items-center gap-1 text-xs font-bold"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
