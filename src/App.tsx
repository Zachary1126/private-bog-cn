import { useState, useEffect } from 'react';
import BlogHeader from './components/BlogHeader';
import BlogSidebar from './components/BlogSidebar';
import BlogPostList from './components/BlogPostList';
import BlogPostReader from './components/BlogPostReader';
import BlogPostEditor from './components/BlogPostEditor';
import SyncHub from './components/SyncHub';
import { Post, Category } from './types';
import { RefreshCw, BookOpen, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'list' | 'read' | 'edit' | 'sync'>('list');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and Theme states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load posts on mount
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      if (!res.ok) throw new Error('无法连接至博客存储系统。');
      const data = await res.json();
      setPosts(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '获取博客列表失败。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Recover dark mode preference
    const savedTheme = localStorage.getItem('theme_preference');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    } else if (savedTheme === 'light') {
      setDarkMode(false);
    } else {
      // System default checks
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPrefersDark);
    }
  }, []);

  // Update theme on local storage when modified
  useEffect(() => {
    if (darkMode) {
      localStorage.setItem('theme_preference', 'dark');
    } else {
      localStorage.setItem('theme_preference', 'light');
    }
  }, [darkMode]);

  // Handle Post Actions (Create or Update)
  const handleSavePost = async (postData: Partial<Post>) => {
    try {
      let res;
      if (selectedPostId) {
        // Edit Mode: PUT request
        res = await fetch(`/api/posts/${selectedPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });
      } else {
        // Create Mode: POST request
        res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });
      }

      if (!res.ok) throw new Error('保存文章失败，请检查服务状态。');
      
      const savedPost = await res.json();
      
      // Refresh list
      await fetchPosts();

      // Go back to reading the post if we edited it, or list if we created it
      if (selectedPostId) {
        setCurrentView('read');
      } else {
        setSelectedPostId(savedPost.id);
        setCurrentView('read');
      }
    } catch (err: any) {
      alert(err.message || '保存失败');
    }
  };

  // Delete action
  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('删除文章失败。');
      
      // Clear states
      setSelectedPostId(null);
      setCurrentView('list');
      
      // Refresh list
      await fetchPosts();
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const handleReadPost = (id: string) => {
    setSelectedPostId(id);
    setCurrentView('read');
    
    // Increment local views count as well
    setPosts(prev => prev.map(p => p.id === id ? { ...p, views: (p.views || 0) + 1 } : p));
  };

  const handleEditPost = (id: string) => {
    setSelectedPostId(id);
    setCurrentView('edit');
  };

  const handleSyncPost = (id: string) => {
    setSelectedPostId(id);
    setCurrentView('sync');
  };

  const handleCreateNewPost = () => {
    setSelectedPostId(null);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    setSelectedPostId(null);
    setCurrentView('list');
  };

  // Sync completion callback from Hub
  const handleSyncComplete = (updatedPost: Post) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  // Extract selected post object
  const activePost = posts.find(p => p.id === selectedPostId);

  return (
    <div className={darkMode ? 'dark min-h-screen bg-zinc-950 text-zinc-100' : 'min-h-screen bg-zinc-50 text-zinc-900'}>
      <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen transition-colors duration-200 font-sans antialiased pb-20">
        
        {/* Navigation Header */}
        <BlogHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onCreatePost={handleCreateNewPost}
          onBackToList={handleBackToList}
          showBackButton={currentView !== 'list'}
        />

        {/* Dynamic Views Router */}
        <main className="transition-all duration-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">正在为您加载个人博客空间...</span>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto my-20 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center shadow-sm space-y-4">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="font-display font-bold text-zinc-900 dark:text-zinc-100">博客连接失败</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{error}</p>
              <button
                id="btn-retry-fetch"
                onClick={fetchPosts}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                重试加载
              </button>
            </div>
          ) : currentView === 'list' ? (
            /* BLOG INDEX / DASHBOARD VIEW */
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Blog posts list rendering */}
              <BlogPostList
                posts={posts}
                onReadPost={handleReadPost}
                onEditPost={handleEditPost}
                onSyncPost={handleSyncPost}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />

              {/* Sidebar with Stats, categories, tags */}
              <BlogSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                posts={posts}
              />

            </div>
          ) : currentView === 'read' && activePost ? (
            /* BLOG READER VIEW */
            <BlogPostReader
              post={activePost}
              onBack={handleBackToList}
              onEdit={handleEditPost}
              onSync={handleSyncPost}
              onDelete={handleDeletePost}
            />
          ) : currentView === 'edit' ? (
            /* BLOG EDIT/CREATE VIEW */
            <BlogPostEditor
              post={activePost}
              onSave={handleSavePost}
              onCancel={handleBackToList}
            />
          ) : currentView === 'sync' && activePost ? (
            /* MULTI-PLATFORM SYNC MANAGER VIEW */
            <SyncHub
              post={activePost}
              onBack={() => handleReadPost(activePost.id)}
              onSyncComplete={handleSyncComplete}
            />
          ) : (
            <div className="text-center py-20 text-zinc-500">无法显示此视图</div>
          )}
        </main>

      </div>
    </div>
  );
}
