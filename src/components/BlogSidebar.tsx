import { BookOpen, Coffee, Award, Sparkles, TrendingUp, Hash, Layers } from 'lucide-react';
import { Post, Category } from '../types';

interface BlogSidebarProps {
  selectedCategory: Category | 'all';
  setSelectedCategory: (category: Category | 'all') => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  posts: Post[];
}

export default function BlogSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedTag,
  setSelectedTag,
  posts
}: BlogSidebarProps) {
  // Calculate stats
  const totalPosts = posts.length;
  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = totalPosts - publishedCount;
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  // Extract all unique tags
  const tagCounts: Record<string, number> = {};
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const uniqueTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1]) // sort by frequency
    .slice(0, 15); // get top 15 tags

  const categories: { id: Category | 'all'; name: string; count: number; icon: any; color: string }[] = [
    { id: 'all', name: '全部文章', count: totalPosts, icon: Layers, color: 'text-zinc-600 dark:text-zinc-300' },
    { id: 'ai', name: 'AI学习记录', count: posts.filter(p => p.category === 'ai').length, icon: Sparkles, color: 'text-sky-500' },
    { id: 'life', name: '日常生活随笔', count: posts.filter(p => p.category === 'life').length, icon: Coffee, color: 'text-amber-500' },
    { id: 'career', name: '职场与硬核感悟', count: posts.filter(p => p.category === 'career').length, icon: Award, color: 'text-emerald-500' },
  ];

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
      
      {/* Categories Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <h3 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>分类频道</span>
        </h3>
        
        <div className="space-y-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                id={`btn-cat-${cat.id}`}
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedTag(null); // Clear tag selection when changing category
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${cat.color} ${isActive ? 'scale-110' : ''}`} />
                  <span>{cat.name}</span>
                </div>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Hash className="w-4 h-4 text-indigo-500" />
            <span>标签热门</span>
          </h3>
          {selectedTag && (
            <button
              id="btn-clear-tag"
              onClick={() => setSelectedTag(null)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              清除筛选
            </button>
          )}
        </div>

        {uniqueTags.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 py-2">暂无标签可用</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {uniqueTags.map(([tag, count]) => {
              const isActive = selectedTag === tag;
              return (
                <button
                  id={`btn-tag-${tag}`}
                  key={tag}
                  onClick={() => setSelectedTag(isActive ? null : tag)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500 shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-750 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  #{tag} <span className="opacity-60 text-[10px] font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Writing Stats Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <h3 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <span>创作统计</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">已发布</span>
            <span className="text-lg font-bold font-mono text-zinc-800 dark:text-zinc-200">{publishedCount}</span>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">草稿箱</span>
            <span className="text-lg font-bold font-mono text-zinc-800 dark:text-zinc-200">{draftCount}</span>
          </div>
          <div className="col-span-2 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">总阅读人次</span>
              <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">{totalViews}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}
