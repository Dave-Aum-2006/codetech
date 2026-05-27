import React from 'react';
import { Calendar, User, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NewsCard({ article, index }) {
  const { title, description, urlToImage, publishedAt, source, author, url } = article;

  // Format date
  const dateFormatted = new Date(publishedAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col h-[420px] hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1 transition duration-300 group"
    >
      {/* Article Image */}
      <div className="w-full h-48 overflow-hidden relative bg-slate-900">
        <img
          src={urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="absolute top-3 left-3 bg-indigo-600/90 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-md">
          {source.name}
        </div>
      </div>

      {/* Article Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Metadata */}
          <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {dateFormatted}
            </span>
            {author && (
              <span className="flex items-center gap-1 max-w-[120px] truncate">
                <User className="h-3 w-3" />
                {author}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition">
            {title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
            {description || 'No description available for this headline.'}
          </p>
        </div>

        {/* Read More button */}
        <a
          href={url || '#'}
          target="_blank"
          rel="noreferrer"
          className="w-full mt-4 py-2.5 px-4 bg-indigo-500/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white font-semibold rounded-xl text-xs transition duration-200 flex items-center justify-center gap-1.5"
        >
          <span>Read Full Article</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
