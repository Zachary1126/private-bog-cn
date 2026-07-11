import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Save, Sparkles, BookOpen, Tag, FileText, ArrowLeft, Eye, 
  Edit3, Bold, Italic, Heading1, Heading2, Code, Quote, Link, List, 
  HelpCircle, RefreshCw, Layers, Plus, X, BrainCircuit, Check
} from 'lucide-react';
import { Post, Category, AIResponse } from '../types';

interface BlogPostEditorProps {
  post?: Post; // Undefined means we are creating a new post
  onSave: (postData: Partial<Post>) => void;
  onCancel: () => void;
}

export default function BlogPostEditor({
  post,
  onSave,
  onCancel
}: BlogPostEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [summary, setSummary] = useState(post?.summary || '');
  const [category, setCategory] = useState<Category>(post?.category || 'life');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('split');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // AI states
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiOutlineTopic, setAiOutlineTopic] = useState('');
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiOutlineResult, setAiOutlineResult] = useState('');
  const [aiSummaryResult, setAiSummaryResult] = useState('');
  const [aiTagResult, setAiTagResult] = useState<{ category?: Category; tags?: string[] } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-fill defaults for new post
  useEffect(() => {
    if (!post) {
      setTitle('');
      setContent('# 新文章标题\n\n在这里开始写下你的博客内容。你可以使用完整的 Markdown 语法...\n\n## 一、起始章节\n\n输入段落正文...');
      setSummary('');
      setCategory('life');
      setTags(['日常', '生活思考']);
    }
  }, [post]);

  // Insert markdown helpers helper
  const insertMarkdown = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selected = text.substring(start, end);

    let insertion = syntax;
    let newCursorPos = start + syntax.length;

    if (syntax === 'bold') {
      insertion = `**${selected || '加粗文本'}**`;
      newCursorPos = start + 2 + (selected ? selected.length : 4) + 2;
    } else if (syntax === 'italic') {
      insertion = `*${selected || '斜体文本'}*`;
      newCursorPos = start + 1 + (selected ? selected.length : 4) + 1;
    } else if (syntax === 'h1') {
      insertion = `\n# ${selected || '一级标题'}\n`;
      newCursorPos = start + 3 + (selected ? selected.length : 4) + 1;
    } else if (syntax === 'h2') {
      insertion = `\n## ${selected || '二级标题'}\n`;
      newCursorPos = start + 4 + (selected ? selected.length : 4) + 1;
    } else if (syntax === 'code') {
      insertion = `\n\`\`\`typescript\n${selected || '// 代码块'}\n\`\`\`\n`;
      newCursorPos = start + 16 + (selected ? selected.length : 5) + 5;
    } else if (syntax === 'quote') {
      insertion = `\n> ${selected || '引用文字'}\n`;
      newCursorPos = start + 3 + (selected ? selected.length : 4) + 1;
    } else if (syntax === 'link') {
      insertion = `[${selected || '链接名称'}](https://example.com)`;
      newCursorPos = start + 1 + (selected ? selected.length : 4) + 2;
    } else if (syntax === 'list') {
      insertion = `\n- ${selected || '列表项'}\n`;
      newCursorPos = start + 3 + (selected ? selected.length : 3) + 1;
    }

    setContent(before + insertion + after);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  // Add Tag
  const handleAddTag = (e?: React.FormEvent) => {
    e?.preventDefault();
    const tag = newTagInput.trim().replace(/#/g, '');
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // 1. AI writing optimizer api call
  const handleAiOptimize = async (instruction: string) => {
    setAiLoading(prev => ({ ...prev, optimize: true }));
    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, instruction }),
      });
      const data = await response.json();
      if (data.content) {
        setContent(data.content);
        setSaveMessage('✨ AI 润色成功！');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(prev => ({ ...prev, optimize: false }));
    }
  };

  // 2. AI outline generator
  const handleAiOutline = async () => {
    if (!aiOutlineTopic.trim()) return;
    setAiLoading(prev => ({ ...prev, outline: true }));
    try {
      const response = await fetch('/api/ai/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiOutlineTopic, category }),
      });
      const data = await response.json();
      if (data.outline) {
        setAiOutlineResult(data.outline);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(prev => ({ ...prev, outline: false }));
    }
  };

  // 3. AI tags suggestion
  const handleAiTags = async () => {
    if (!title.trim() || !content.trim()) return;
    setAiLoading(prev => ({ ...prev, tags: true }));
    try {
      const response = await fetch('/api/ai/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const data = await response.json();
      if (data.category || data.tags) {
        setAiTagResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(prev => ({ ...prev, tags: false }));
    }
  };

  // 4. AI summary generator
  const handleAiSummarize = async () => {
    if (!content.trim()) return;
    setAiLoading(prev => ({ ...prev, summary: true }));
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const data = await response.json();
      if (data.summary) {
        setAiSummaryResult(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(prev => ({ ...prev, summary: false }));
    }
  };

  // Apply AI Outliner output to Editor content
  const handleInsertOutline = () => {
    if (aiOutlineResult) {
      setContent(prev => prev + '\n\n' + aiOutlineResult);
      setAiOutlineResult('');
      setAiOutlineTopic('');
    }
  };

  // Apply AI Tag result
  const handleApplyAiTags = () => {
    if (aiTagResult) {
      if (aiTagResult.category) setCategory(aiTagResult.category);
      if (aiTagResult.tags) {
        const merged = Array.from(new Set([...tags, ...aiTagResult.tags]));
        setTags(merged);
      }
      setAiTagResult(null);
    }
  };

  // Submit form save
  const handleSaveClick = () => {
    if (!title.trim()) {
      alert('请填写文章标题后再保存！');
      return;
    }
    setIsSaving(true);
    
    onSave({
      title,
      content,
      summary: summary.trim() || undefined,
      category,
      tags
    });
    
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const getWordCount = () => {
    return content.replace(/[#*`-\s\n]/g, '').length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Editor Header Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
        <button
          id="btn-editor-cancel"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>取消并返回</span>
        </button>

        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 font-sans transition-opacity duration-300">
              {saveMessage}
            </span>
          )}
          <button
            id="btn-editor-save"
            onClick={handleSaveClick}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm disabled:opacity-55 transition"
          >
            <Save className="w-4 h-4" />
            <span>{post ? '保存修改' : '创建新博文'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Cols: Writing Workspace */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Metadata Controls */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            
            {/* Title Input */}
            <div>
              <input
                id="input-editor-title"
                type="text"
                placeholder="在此输入大标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl sm:text-2xl font-display font-bold text-zinc-900 dark:text-zinc-50 placeholder-zinc-300 dark:placeholder-zinc-750 focus:outline-none border-b border-zinc-150 dark:border-zinc-800 pb-3 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category picker */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>内容分类</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ai', 'life', 'career'] as Category[]).map((cat) => {
                    const label = cat === 'ai' ? 'AI学习' : cat === 'life' ? '日常生活' : '职场感悟';
                    const active = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        id={`btn-editor-cat-${cat}`}
                        onClick={() => setCategory(cat)}
                        className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition ${
                          active
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag Editor */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>添加标签</span>
                </label>
                <form onSubmit={handleAddTag} className="flex gap-2">
                  <input
                    id="input-editor-tag"
                    type="text"
                    placeholder="按回车或点 + 保存"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="flex-1 px-3 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    id="btn-editor-add-tag"
                    type="button"
                    onClick={() => handleAddTag()}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Active tags display list */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  >
                    #{tag}
                    <button
                      id={`btn-editor-remove-tag-${tag}`}
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-400 hover:text-rose-500 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Editor Workspace Content with View switcher */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
            
            {/* Split controls tab bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900">
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/40 dark:border-zinc-750">
                <button
                  id="tab-edit-write"
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition ${
                    activeTab === 'write' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>编辑</span>
                </button>
                <button
                  id="tab-edit-preview"
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition ${
                    activeTab === 'preview' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>预览</span>
                </button>
                <button
                  id="tab-edit-split"
                  type="button"
                  onClick={() => setActiveTab('split')}
                  className={`hidden sm:flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition ${
                    activeTab === 'split' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>双栏分屏</span>
                </button>
              </div>

              <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                字数统计：<span className="font-bold text-zinc-600 dark:text-zinc-300">{getWordCount()}</span>
              </div>
            </div>

            {/* Markdown Toolbar helper */}
            {activeTab !== 'preview' && (
              <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/20 dark:bg-zinc-900/50">
                <button type="button" onClick={() => insertMarkdown('bold')} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition" title="粗体"><Bold className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertMarkdown('italic')} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition" title="斜体"><Italic className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertMarkdown('h1')} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition" title="一级标题"><Heading1 className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertMarkdown('h2')} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition" title="二级标题"><Heading2 className="w-3.5 h-3.5" /></button>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
                <button type="button" onClick={() => insertMarkdown('code')} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition" title="代码块"><Code className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertMarkdown('quote')} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition" title="引用"><Quote className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertMarkdown('link')} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition" title="插入链接"><Link className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => insertMarkdown('list')} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition" title="列表"><List className="w-3.5 h-3.5" /></button>
              </div>
            )}

            {/* Split View Container */}
            <div className={`grid ${activeTab === 'split' ? 'grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-800' : 'grid-cols-1'} h-[500px]`}>
              
              {/* Writer Panel */}
              {(activeTab === 'write' || activeTab === 'split') && (
                <textarea
                  id="textarea-editor-content"
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="在此使用 Markdown 语法书写精彩内容..."
                  className="w-full h-full p-4 text-sm font-sans bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none overflow-y-auto leading-relaxed"
                />
              )}

              {/* Previewer Panel */}
              {(activeTab === 'preview' || activeTab === 'split') && (
                <div className="w-full h-full p-4 overflow-y-auto bg-zinc-50/20 dark:bg-zinc-950/10">
                  <div className="markdown-body dark:prose-invert">
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {content || '*在此预览您的排版内容*'}
                    </Markdown>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Excerpt Summary Manual override card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                SEO 文章导读 / 摘要 (Summary)
              </label>
              <button
                id="btn-editor-ai-summarize"
                type="button"
                onClick={handleAiSummarize}
                disabled={aiLoading.summary}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 animate-pulse" />
                <span>AI 自动摘要推荐</span>
              </button>
            </div>
            
            {aiSummaryResult && (
              <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900 rounded-lg space-y-2">
                <p className="text-xs italic text-zinc-600 dark:text-zinc-300">"{aiSummaryResult}"</p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAiSummaryResult('')}
                    className="text-[10px] text-zinc-400 hover:text-zinc-600"
                  >
                    拒绝
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSummary(aiSummaryResult);
                      setAiSummaryResult('');
                    }}
                    className="text-[10px] font-semibold text-indigo-600 hover:underline"
                  >
                    采纳并填入
                  </button>
                </div>
              </div>
            )}

            <textarea
              id="textarea-editor-summary"
              rows={2}
              placeholder="如果不填写，将自动截取正文前150字作为卡片导读..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none"
            />
          </div>

        </div>

        {/* Right Col: AI Assistant Column */}
        <div className="space-y-6">
          
          {/* AI Banner header */}
          <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/50 dark:border-indigo-900/30 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Gemini AI 创作智囊
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  依托大模型智能辅助您的整套写作流程
                </p>
              </div>
            </div>

            {/* AI Action 1: Text optimization with preset triggers */}
            <div className="space-y-2 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
              <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                文章细节润色
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: '一键润色语法', inst: '修正拼写、表达、不通顺的错漏，提升行文流畅度和逻辑严密性' },
                  { text: '更学术严谨', inst: '调整行文风格，使其更学术、客观、严谨，多用专业名词并合乎逻辑逻辑' },
                  { text: '更温暖治愈', inst: '调整语气使其温暖、治愈、自然感性、适合记录日常生活小情绪' },
                  { text: '富有科技洞察', inst: '使语气富有科技前瞻感、极客思维、行文干练富有洞察力' }
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAiOptimize(item.inst)}
                    disabled={aiLoading.optimize}
                    className="py-1.5 px-2 rounded-lg border border-zinc-100 hover:border-indigo-200 dark:border-zinc-850 dark:hover:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-left text-[11px] text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    {item.text}
                  </button>
                ))}
              </div>

              {aiLoading.optimize && (
                <div className="flex items-center gap-2 justify-center py-2 text-xs text-indigo-600 font-medium">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Gemini 正在字斟句酌中...</span>
                </div>
              )}
            </div>

            {/* AI Action 2: Tags discoverer */}
            <div className="space-y-2 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  分类与标签识别
                </span>
                <button
                  type="button"
                  id="btn-ai-discover-tags"
                  onClick={handleAiTags}
                  disabled={aiLoading.tags || !title || !content}
                  className="text-[11px] font-medium text-indigo-600 hover:underline disabled:opacity-40"
                >
                  一键分析
                </button>
              </div>

              {aiLoading.tags && (
                <div className="flex items-center gap-2 justify-center py-2 text-xs text-indigo-600 font-medium">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>正在扫描全文语义...</span>
                </div>
              )}

              {aiTagResult && (
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150/40 dark:border-indigo-900/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">建议分类:</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {aiTagResult.category === 'ai' ? 'AI学习' : aiTagResult.category === 'life' ? '日常生活' : '职场感悟'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 block">建议标签:</span>
                    <div className="flex flex-wrap gap-1">
                      {aiTagResult.tags?.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyAiTags}
                    className="w-full text-center py-1 rounded bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-700 transition"
                  >
                    一键应用这些分类标签
                  </button>
                </div>
              )}
            </div>

            {/* AI Action 3: Outline generator */}
            <div className="space-y-2 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
              <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                大纲灵感生成器
              </span>
              
              <div className="flex gap-2">
                <input
                  id="input-ai-outline-topic"
                  type="text"
                  placeholder="输入你想写的文章主题..."
                  value={aiOutlineTopic}
                  onChange={(e) => setAiOutlineTopic(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                />
                <button
                  id="btn-ai-outline-submit"
                  type="button"
                  onClick={handleAiOutline}
                  disabled={aiLoading.outline || !aiOutlineTopic.trim()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition"
                >
                  生成
                </button>
              </div>

              {aiLoading.outline && (
                <div className="flex items-center gap-2 justify-center py-2 text-xs text-indigo-600 font-medium">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>大模型正在策划结构...</span>
                </div>
              )}

              {aiOutlineResult && (
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg space-y-2.5">
                  <div className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
                    <span>策划大纲预览:</span>
                    <button 
                      type="button" 
                      onClick={() => setAiOutlineResult('')} 
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      清除
                    </button>
                  </div>
                  <div className="text-xs font-mono max-h-40 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded border border-zinc-100 dark:border-zinc-900">
                    <pre className="whitespace-pre-wrap">{aiOutlineResult}</pre>
                  </div>
                  <button
                    type="button"
                    onClick={handleInsertOutline}
                    className="w-full text-center py-1 rounded border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-[11px] font-semibold transition"
                  >
                    追加插入文章末尾
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Markdown Hints Guide */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Markdown 快捷指令小册</span>
            </h4>
            <div className="text-[11px] font-mono space-y-1.5 text-zinc-500 dark:text-zinc-400">
              <div className="flex justify-between"><span># 标题</span><span>一级标题</span></div>
              <div className="flex justify-between"><span>## 标题</span><span>二级标题</span></div>
              <div className="flex justify-between"><span>**粗体**</span><span>加粗文字</span></div>
              <div className="flex justify-between"><span>*斜体*</span><span>斜体文字</span></div>
              <div className="flex justify-between"><span>- 列表</span><span>无序条目</span></div>
              <div className="flex justify-between"><span>[名称](url)</span><span>插入超级链接</span></div>
              <div className="flex justify-between"><span>`代码`</span><span>行内代码块</span></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
