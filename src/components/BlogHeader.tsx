import { Search, Plus, Sun, Moon, Sparkles, BookOpen, ChevronLeft } from 'lucide-react';

interface BlogHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onCreatePost: () => void;
  onBackToList: () => void;
  showBackButton: boolean;
}

export default function BlogHeader({
  searchQuery,
  setSearchQuery,
  darkMode,
  setDarkMode,
  onCreatePost,
  onBackToList,
  showBackButton
}: BlogHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Back button */}
          <div className="flex items-center gap-3">
            {showBackButton ? (
              <button
                id="btn-back-list"
                onClick={onBackToList}
                className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>返回博客列表</span>
              </button>
            ) : (
              <div 
                id="brand-logo"
                onClick={onBackToList}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/10 group-hover:scale-105 transition-transform duration-200">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-lg leading-tight bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 dark:from-zinc-50 dark:via-sky-200 dark:to-zinc-50 bg-clip-text text-transparent">
                    写意空间
                  </h1>
                  <span className="text-[10px] font-mono tracking-wider text-zinc-500 dark:text-zinc-400">
                    CREATOR SPACE
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Search bar */}
          {!showBackButton && (
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                <input
                  id="input-search-header"
                  type="text"
                  placeholder="搜索文章内容、标题或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark mode switch */}
            <button
              id="btn-toggle-theme"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
              title={darkMode ? "切换为亮色模式" : "切换为暗色模式"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Create Post button */}
            <button
              id="btn-create-post-header"
              onClick={onCreatePost}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm shadow-indigo-500/10 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">撰写新文章</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
