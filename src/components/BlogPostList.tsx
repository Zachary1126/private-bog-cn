import { useState } from 'react';
import { Calendar, Eye, Clock, Share2, Edit3, ArrowRight, EyeOff, Sparkles } from 'lucide-react';
import { Post, Category } from '../types';

interface BlogPostListProps {
  posts: Post[];
  onReadPost: (id: string) => void;
  onEditPost: (id: string) => void;
  onSyncPost: (id: string) => void;
  selectedCategory: Category | 'all';
  setSelectedCategory: (category: Category | 'all') => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function BlogPostList({
  posts,
  onReadPost,
  onEditPost,
  onSyncPost,
  selectedCategory,
  setSelectedCategory,
  selectedTag,
  setSelectedTag,
  searchQuery,
  setSearchQuery
}: BlogPostListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'views'>('date');

  // Filter posts based on category, tag and search query
  const filteredPosts = posts.filter(post => {
    // 1. Category filter
    if (selectedCategory !== 'all' && post.category !== selectedCategory) {
      return false;
    }
    // 2. Tag filter
    if (selectedTag && !post.tags.includes(selectedTag)) {
      return false;
    }
    // 3. Search query filter (matches title, content, or tags)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const titleMatch = post.title.toLowerCase().includes(query);
      const contentMatch = post.content.toLowerCase().includes(query);
      const summaryMatch = post.summary.toLowerCase().includes(query);
      const tagMatch = post.tags.some(t => t.toLowerCase().includes(query));
      return titleMatch || contentMatch || summaryMatch || tagMatch;
    }
    return true;
  });

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'views') {
      return (b.views || 0) - (a.views || 0);
    }
    // Sort by createdAt date descending
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Format Date Helper
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getCategoryDetails = (cat: Category) => {
    switch (cat) {
      case 'ai':
        return { label: 'AI学习记录', bg: 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/50' };
      case 'life':
        return { label: '日常生活随笔', bg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50' };
      case 'career':
        return { label: '职场硬核感悟', bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' };
    }
  };

  return (
    <div className="flex-1 space-y-6">
      
      {/* Search and Filters Header Status */}
      {(selectedCategory !== 'all' || selectedTag || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 bg-indigo-50/40 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">当前检索：</span>
          
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
              分类: {getCategoryDetails(selectedCategory).label}
              <button
                id="btn-remove-cat-filter"
                onClick={() => setSelectedCategory('all')}
                className="hover:text-indigo-900 font-bold ml-1"
              >
                ×
              </button>
            </span>
          )}

          {selectedTag && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-750">
              标签: #{selectedTag}
              <button
                id="btn-remove-tag-filter"
                onClick={() => setSelectedTag(null)}
                className="hover:text-zinc-900 font-bold ml-1"
              >
                ×
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900">
              搜索: "{searchQuery}"
              <button
                id="btn-remove-search-filter"
                onClick={() => setSearchQuery('')}
                className="hover:text-amber-900 font-bold ml-1"
              >
                ×
              </button>
            </span>
          )}

          <button
            id="btn-clear-all-filters"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedTag(null);
              setSearchQuery('');
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline ml-auto"
          >
            重置全部
          </button>
        </div>
      )}

      {/* Toolbar: Sorting & Count */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          检索出 <span className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{filteredPosts.length}</span> 篇内容
        </span>
        
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800">
          <button
            id="btn-sort-date"
            onClick={() => setSortBy('date')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              sortBy === 'date'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            按时间
          </button>
          <button
            id="btn-sort-views"
            onClick={() => setSortBy('views')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              sortBy === 'views'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            按阅读量
          </button>
        </div>
      </div>

      {/* Main Post Grid */}
      {sortedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
          <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 dark:text-zinc-600 mb-4 border border-zinc-200/40 dark:border-zinc-800">
            <EyeOff className="w-6 h-6" />
          </div>
          <h4 className="font-display font-semibold text-zinc-800 dark:text-zinc-200 mb-2">未发现相关内容</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
            找不到符合过滤条件或搜索条件的文章，试试重置过滤条件或者撰写一篇全新的内容。
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedPosts.map((post) => {
            const cat = getCategoryDetails(post.category);
            const activePublishCount = post.publishStatus 
              ? Object.values(post.publishStatus).filter(s => s.status === 'success').length 
              : 0;

            return (
              <article
                id={`article-${post.id}`}
                key={post.id}
                className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Category badge & Status indicator */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${cat.bg}`}>
                      {cat.label}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {post.published ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          已发布 {activePublishCount > 0 && `(多端同步×${activePublishCount})`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                          草稿
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Clickable Reader Trigger */}
                  <h2 
                    onClick={() => onReadPost(post.id)}
                    className="font-display font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors duration-150 leading-tight mb-2.5"
                  >
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 mb-4 leading-relaxed font-sans">
                    {post.summary || '暂无导读内容。'}
                  </p>

                  {/* Tags list */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {post.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                          className="text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Metadata & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/80 gap-3">
                  
                  {/* Meta stats */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                    <span className="flex items-center gap-1" title="发布时间">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(post.createdAt)}</span>
                    </span>
                    <span className="flex items-center gap-1" title="阅读数量">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{post.views || 0} 次</span>
                    </span>
                    <span className="flex items-center gap-1" title="预估阅读时间">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{post.readTime || 2} 分钟</span>
                    </span>
                  </div>

                  {/* Quick Action links */}
                  <div className="flex items-center gap-2 sm:self-end">
                    <button
                      id={`btn-edit-post-${post.id}`}
                      onClick={() => onEditPost(post.id)}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 hover:border-indigo-100 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                      title="编辑文章"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    <button
                      id={`btn-sync-post-${post.id}`}
                      onClick={() => onSyncPost(post.id)}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 hover:border-indigo-100 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                      title="同步多端发布"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-read-post-${post.id}`}
                      onClick={() => onReadPost(post.id)}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-indigo-600 hover:text-white dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all ml-1"
                    >
                      <span>阅读全文</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>

                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
}
