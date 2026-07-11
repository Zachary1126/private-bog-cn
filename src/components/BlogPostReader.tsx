import { useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Eye, Clock, Edit, Share2, Trash2, ArrowLeft, Anchor, ExternalLink, Github, BookOpen } from 'lucide-react';
import { Post, Category } from '../types';

interface BlogPostReaderProps {
  post: Post;
  onBack: () => void;
  onEdit: (id: string) => void;
  onSync: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function BlogPostReader({
  post,
  onBack,
  onEdit,
  onSync,
  onDelete
}: BlogPostReaderProps) {
  
  // Dynamically parse Headings for Table of Contents
  const toc = useMemo(() => {
    const lines = post.content.split('\n');
    const headings: { text: string; level: number; id: string }[] = [];
    
    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[*_`]/g, ''); // strip markdown formatting
        // create slug-like ID
        const id = text.toLowerCase().trim().replace(/[\s\W]+/g, '-');
        headings.push({ text, level, id });
      }
    });
    
    return headings;
  }, [post.content]);

  // Format Date Helper
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getCategoryDetails = (cat: Category) => {
    switch (cat) {
      case 'ai':
        return { label: 'AI学习记录', bg: 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/50' };
      case 'life':
        return { label: '日常生活随笔', bg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50' };
      case 'career':
        return { label: '职场与硬核感悟', bg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' };
    }
  };

  const handleDeleteClick = () => {
    if (confirm('您确定要彻底删除这篇文章吗？此操作无法撤销。')) {
      onDelete(post.id);
    }
  };

  // Setup platform styling and metadata
  const platformMeta: Record<string, { name: string; color: string; icon: string }> = {
    github: { name: 'GitHub Pages', color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200', icon: '📁' },
    medium: { name: 'Medium', color: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300', icon: '✍️' },
    wechat: { name: '微信公众号', color: 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300', icon: '💬' },
    zhihu: { name: '知乎专栏', color: 'bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300', icon: '❓' },
    devto: { name: 'Dev.to', color: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300', icon: '💻' }
  };

  const activeSyncs = post.publishStatus ? Object.entries(post.publishStatus).filter(([_, s]) => s.status === 'success') : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Back navigation and controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <button
          id="btn-reader-back"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 py-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回博客主页</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-reader-edit"
            onClick={() => onEdit(post.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>编辑内容</span>
          </button>
          
          <button
            id="btn-reader-sync"
            onClick={() => onSync(post.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>发布与同步</span>
          </button>

          <button
            id="btn-reader-delete"
            onClick={handleDeleteClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-600 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-900/40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>删除</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Main Article Body */}
        <article className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-sm transition-colors duration-200">
          
          {/* Top metadata */}
          <div className="flex flex-wrap items-center gap-3.5 mb-5">
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium border ${getCategoryDetails(post.category).bg}`}>
              {getCategoryDetails(post.category).label}
            </span>
            
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(post.createdAt)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{post.views || 0} 次阅读</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>建议阅读 {post.readTime || 2} 分钟</span>
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-2xl sm:text-4.5xl text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight mb-6">
            {post.title}
          </h1>

          {/* Summary Quote Box */}
          {post.summary && (
            <div className="bg-zinc-50/70 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-900 rounded-xl p-5 mb-8 text-sm italic text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">
              <span className="font-semibold text-indigo-500 font-display not-italic block mb-1">🔍 内容摘要导读：</span>
              “ {post.summary} ”
            </div>
          )}

          {/* Markdown Content Parser */}
          <div className="markdown-body dark:prose-invert">
            <Markdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </Markdown>
          </div>

          {/* Bottom tags */}
          {post.tags.length > 0 && (
            <div className="border-t border-zinc-150 dark:border-zinc-800/60 pt-6 mt-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">关联标签：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-zinc-200/40 dark:border-zinc-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </article>

        {/* Sidebar Information Panel */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
          
          {/* Table of Contents */}
          {toc.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm sticky top-24 hidden lg:block">
              <h3 className="font-display font-semibold text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                <Anchor className="w-3.5 h-3.5 text-indigo-500" />
                <span>本文大纲导航</span>
              </h3>
              <nav className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {toc.map((heading, i) => (
                  <a
                    key={i}
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(heading.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`block text-xs text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-relaxed ${
                      heading.level === 1 ? 'font-semibold pl-0' : heading.level === 2 ? 'pl-3' : 'pl-6'
                    }`}
                  >
                    • {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* Sync status check */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-display font-semibold text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
              <span>多端同步发布状态</span>
            </h3>

            {activeSyncs.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-zinc-50/50 dark:bg-zinc-950/20">
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-2">未在任何外部平台上发布</p>
                <button
                  id="btn-sidebar-sync-now"
                  onClick={() => onSync(post.id)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center mx-auto gap-1"
                >
                  <span>立即同步</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSyncs.map(([pId, status]) => {
                  const meta = platformMeta[pId] || { name: pId, color: 'bg-zinc-50', icon: '🌐' };
                  return (
                    <div 
                      key={pId}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-850 bg-zinc-50/30 dark:bg-zinc-950/10"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{meta.icon}</span>
                        <div>
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">{meta.name}</span>
                          {status.publishedAt && (
                            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 block">
                              {new Date(status.publishedAt).toLocaleDateString()} 同步
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {status.url && (
                        <a
                          href={status.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 shadow-sm transition"
                          title="访问发布地址"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
                <button
                  id="btn-sidebar-manage-syncs"
                  onClick={() => onSync(post.id)}
                  className="w-full text-center mt-3 py-1.5 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 block"
                >
                  管理/更新同步平台
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
