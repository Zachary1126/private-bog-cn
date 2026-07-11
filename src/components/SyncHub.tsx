import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Share2, Github, CheckCircle2, AlertCircle, RefreshCw, 
  Layers, Lock, Eye, Key, Globe, ExternalLink, Settings, Check
} from 'lucide-react';
import { Post, PublishTarget, PublishStatus } from '../types';

interface SyncHubProps {
  post: Post;
  onBack: () => void;
  onSyncComplete: (updatedPost: Post) => void;
}

export default function SyncHub({
  post,
  onBack,
  onSyncComplete
}: SyncHubProps) {
  
  // Load configuration from localStorage or default
  const [targets, setTargets] = useState<PublishTarget[]>([
    { id: 'github', name: 'GitHub Pages (Markdown)', logo: '📁', connected: true, username: 'zarchary1126', repo: 'my-tech-blog', branch: 'main' },
    { id: 'wechat', name: '微信公众号 (WeChat)', logo: '💬', connected: false, username: '' },
    { id: 'zhihu', name: '知乎专栏 (Zhihu)', logo: '❓', connected: false, username: '' },
    { id: 'medium', name: 'Medium', logo: '✍️', connected: false, username: '' },
    { id: 'devto', name: 'Dev.to (Developer Blog)', logo: '💻', connected: false, username: '' }
  ]);

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['github']);
  const [activeConfigPlatform, setActiveConfigPlatform] = useState<string | null>(null);
  
  // Configurations fields state
  const [githubUser, setGithubUser] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubToken, setGithubToken] = useState('');
  
  const [wechatAppId, setWechatAppId] = useState('');
  const [wechatAppSecret, setWechatAppSecret] = useState('');
  
  const [zhihuToken, setZhihuToken] = useState('');
  const [mediumToken, setMediumToken] = useState('');
  const [devtoToken, setDevtoToken] = useState('');

  // Sync animation state
  const [syncing, setSyncing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<{ id: number; name: string; status: 'idle' | 'running' | 'success' }[]>([]);
  const [syncFinished, setSyncFinished] = useState(false);
  const [syncResults, setSyncResults] = useState<Record<string, { success: boolean; url?: string; error?: string }>>({});

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    try {
      const savedGithubUser = localStorage.getItem('cfg_gh_user') || 'zarchary1126';
      const savedGithubRepo = localStorage.getItem('cfg_gh_repo') || 'my-tech-blog';
      const savedGithubToken = localStorage.getItem('cfg_gh_token') || '';
      
      const savedWechatAppId = localStorage.getItem('cfg_wx_appid') || '';
      const savedWechatAppSecret = localStorage.getItem('cfg_wx_secret') || '';
      
      const savedZhihuToken = localStorage.getItem('cfg_zh_token') || '';
      const savedMediumToken = localStorage.getItem('cfg_md_token') || '';
      const savedDevtoToken = localStorage.getItem('cfg_dev_token') || '';

      setGithubUser(savedGithubUser);
      setGithubRepo(savedGithubRepo);
      setGithubToken(savedGithubToken);
      setWechatAppId(savedWechatAppId);
      setWechatAppSecret(savedWechatAppSecret);
      setZhihuToken(savedZhihuToken);
      setMediumToken(savedMediumToken);
      setDevtoToken(savedDevtoToken);

      // Restore connection statuses
      setTargets(prev => prev.map(t => {
        if (t.id === 'github' && savedGithubUser) {
          return { ...t, connected: true, username: savedGithubUser, repo: savedGithubRepo };
        }
        if (t.id === 'wechat' && savedWechatAppId) {
          return { ...t, connected: true, username: '微信公众平台认证' };
        }
        if (t.id === 'zhihu' && savedZhihuToken) {
          return { ...t, connected: true, username: '知乎专栏绑定中' };
        }
        if (t.id === 'medium' && savedMediumToken) {
          return { ...t, connected: true, username: 'Medium Token授权' };
        }
        if (t.id === 'devto' && savedDevtoToken) {
          return { ...t, connected: true, username: 'Dev.to 客户端' };
        }
        return t;
      }));

      // Auto-select connected channels
      const connectedIds = ['github'];
      if (savedWechatAppId) connectedIds.push('wechat');
      if (savedZhihuToken) connectedIds.push('zhihu');
      if (savedMediumToken) connectedIds.push('medium');
      if (savedDevtoToken) connectedIds.push('devto');
      setSelectedPlatforms(connectedIds);

    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save Config function
  const handleSaveConfig = (platformId: string) => {
    try {
      if (platformId === 'github') {
        localStorage.setItem('cfg_gh_user', githubUser);
        localStorage.setItem('cfg_gh_repo', githubRepo);
        localStorage.setItem('cfg_gh_token', githubToken);
        setTargets(prev => prev.map(t => t.id === 'github' ? { ...t, connected: true, username: githubUser, repo: githubRepo } : t));
      } else if (platformId === 'wechat') {
        localStorage.setItem('cfg_wx_appid', wechatAppId);
        localStorage.setItem('cfg_wx_secret', wechatAppSecret);
        setTargets(prev => prev.map(t => t.id === 'wechat' ? { ...t, connected: !!wechatAppId, username: wechatAppId ? '已认证开发者' : '' } : t));
      } else if (platformId === 'zhihu') {
        localStorage.setItem('cfg_zh_token', zhihuToken);
        setTargets(prev => prev.map(t => t.id === 'zhihu' ? { ...t, connected: !!zhihuToken, username: zhihuToken ? '知乎授权通道' : '' } : t));
      } else if (platformId === 'medium') {
        localStorage.setItem('cfg_md_token', mediumToken);
        setTargets(prev => prev.map(t => t.id === 'medium' ? { ...t, connected: !!mediumToken, username: mediumToken ? 'Medium 授权' : '' } : t));
      } else if (platformId === 'devto') {
        localStorage.setItem('cfg_dev_token', devtoToken);
        setTargets(prev => prev.map(t => t.id === 'devto' ? { ...t, connected: !!devtoToken, username: devtoToken ? 'Dev.to 客户端' : '' } : t));
      }
      
      // Auto select if connected
      if (!selectedPlatforms.includes(platformId)) {
        setSelectedPlatforms(prev => [...prev, platformId]);
      }
      
      setActiveConfigPlatform(null);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlatformSelect = (pId: string) => {
    if (selectedPlatforms.includes(pId)) {
      setSelectedPlatforms(selectedPlatforms.filter(id => id !== pId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, pId]);
    }
  };

  // Start sync runner
  const handleStartSync = async () => {
    if (selectedPlatforms.length === 0) {
      alert('请至少选择一个要发布的目标平台！');
      return;
    }

    setSyncing(true);
    setSyncFinished(false);
    setCurrentStepIndex(0);

    const initialSteps = [
      { id: 1, name: 'Markdown 原生文章深度排版校验与过滤', status: 'running' as const },
      { id: 2, name: '本地关联图像静态解析与相对路径转换', status: 'idle' as const },
      { id: 3, name: '多端开放平台 API 认证与握手通信', status: 'idle' as const },
      { id: 4, name: '多端内容并发推送与标签分类匹配映射', status: 'idle' as const },
      { id: 5, name: '跨端链接可用性校验与首屏渲染存活测试', status: 'idle' as const },
    ];
    setSteps(initialSteps);

    // Simulated progress steps timer
    for (let i = 0; i < initialSteps.length; i++) {
      setCurrentStepIndex(i);
      setSteps(prev => prev.map((s, idx) => {
        if (idx === i) return { ...s, status: 'running' };
        if (idx < i) return { ...s, status: 'success' };
        return s;
      }));

      // Wait a realistic chunk of time
      const delay = i === 3 ? 1800 : i === 1 ? 1200 : 800;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Call the server api to commit publishing results
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          platforms: selectedPlatforms,
          config: {
            github: { username: githubUser, repo: githubRepo },
            medium: { username: 'creator' },
            devto: { username: 'developer' }
          }
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSyncResults(data.results);
        setSteps(prev => prev.map(s => ({ ...s, status: 'success' })));
        setSyncFinished(true);
        onSyncComplete(data.post);
      }
    } catch (err) {
      console.error(err);
      setSyncFinished(true);
    } finally {
      setSyncing(false);
    }
  };

  const getPlatformIcon = (pId: string) => {
    switch (pId) {
      case 'github': return <Github className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />;
      default: return <span className="text-xl">🌐</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <button
          id="btn-sync-back"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-mono text-zinc-400">SYNC WORKSPACE</span>
        </div>
      </div>

      {/* Intro details */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          文章多端同步分发系统
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
          您正在筹备同步发布的文章：<span className="font-semibold text-indigo-600 dark:text-indigo-400">《{post.title}》</span>。
          我们支持将标准 Markdown 内容转换为各大平台匹配的专属排版格式，进行安全合规的同步直推。
        </p>
      </div>

      {/* Sync sequence timeline (Visible when syncing or finished) */}
      {(syncing || syncFinished) && (
        <div className="bg-white dark:bg-zinc-900 border border-indigo-150 dark:border-indigo-950/60 rounded-2xl p-6 shadow-md shadow-indigo-500/5 space-y-6 transition-all">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-indigo-500 ${syncing ? 'animate-spin' : ''}`} />
            <span>同步状态跟踪器</span>
          </h3>

          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  {step.status === 'success' ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : step.status === 'running' ? (
                    <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-spin">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-300 flex items-center justify-center text-[10px] font-mono">
                      {step.id}
                    </div>
                  )}
                </div>
                <div>
                  <span className={`text-xs font-semibold ${
                    step.status === 'success' ? 'text-zinc-800 dark:text-zinc-200 line-through opacity-70' :
                    step.status === 'running' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-zinc-400'
                  }`}>
                    {step.name}
                  </span>
                  {step.status === 'running' && (
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 animate-pulse">正在执行相关平台API校验通讯中...</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sync Finished Report */}
          {syncFinished && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 mt-5 space-y-4">
              <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">一键同步完成！</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    系统已顺利完成所选平台的文章上传与同步，以下是各平台的同步结果。您可以点击访问具体发布地址进行二审校验。
                  </p>
                </div>
              </div>

              {/* Individual sync results */}
              <div className="space-y-2">
                {Object.entries(syncResults).map(([pId, result]) => {
                  const target = targets.find(t => t.id === pId);
                  return (
                    <div key={pId} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{target?.logo || '🌐'}</span>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{target?.name}</span>
                      </div>

                      {result.success ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-600 font-medium font-mono">SUCCESS</span>
                          {result.url && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 shadow-sm hover:underline"
                            >
                              <span>查看发布地址</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span className="text-[10px] text-rose-500 font-medium">{result.error}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  id="btn-sync-finished-back"
                  onClick={onBack}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 shadow transition"
                >
                  已完成，返回博客主页
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Publishing Dashboard */}
      {!syncing && !syncFinished && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Left 2 Cols: Channels selection list */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
              可发布的发布渠道
            </h3>

            <div className="space-y-3">
              {targets.map((target) => {
                const isSelected = selectedPlatforms.includes(target.id);
                return (
                  <div
                    key={target.id}
                    className={`border rounded-xl p-4 transition-all duration-150 bg-white dark:bg-zinc-900 ${
                      isSelected 
                        ? 'border-indigo-300 dark:border-indigo-900 ring-1 ring-indigo-300 dark:ring-indigo-900/50' 
                        : 'border-zinc-200 dark:border-zinc-850'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      
                      {/* Checkbox + Logo + Info */}
                      <div className="flex items-center gap-3">
                        <input
                          id={`cb-sync-${target.id}`}
                          type="checkbox"
                          checked={isSelected}
                          disabled={!target.connected}
                          onChange={() => togglePlatformSelect(target.id)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 disabled:opacity-40"
                        />
                        <span className="text-lg">{target.logo}</span>
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 block">{target.name}</span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">
                            {target.connected 
                              ? `绑定用户：${target.username} ${target.repo ? `(${target.repo})` : ''}` 
                              : '未配置，点击右侧设置按钮接入'}
                          </span>
                        </div>
                      </div>

                      {/* Setup Connection action */}
                      <button
                        id={`btn-config-target-${target.id}`}
                        type="button"
                        onClick={() => setActiveConfigPlatform(activeConfigPlatform === target.id ? null : target.id)}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                        title="设置同步参数"
                      >
                        <Settings className="w-4 h-4" />
                      </button>

                    </div>

                    {/* Platform Connection Form drawer */}
                    {activeConfigPlatform === target.id && (
                      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3.5 bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Settings className="w-3.5 h-3.5 text-indigo-500" />
                          <span>配置 {target.name} 接入密钥</span>
                        </h4>

                        {/* GitHub Fields */}
                        {target.id === 'github' && (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-1">GitHub 用户名</label>
                                <input
                                  type="text"
                                  value={githubUser}
                                  onChange={(e) => setGithubUser(e.target.value)}
                                  className="w-full px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                                  placeholder="e.g. zarchary1126"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-1">仓库名称 (Repo)</label>
                                <input
                                  type="text"
                                  value={githubRepo}
                                  onChange={(e) => setGithubRepo(e.target.value)}
                                  className="w-full px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                                  placeholder="e.g. tech-blog"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-1">Personal Access Token (密钥/Token)</label>
                              <input
                                type="password"
                                value={githubToken}
                                onChange={(e) => setGithubToken(e.target.value)}
                                className="w-full px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                                placeholder="输入 ghp_ 个人访问令牌..."
                              />
                            </div>
                          </div>
                        )}

                        {/* WeChat Fields */}
                        {target.id === 'wechat' && (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-1">AppID</label>
                                <input
                                  type="text"
                                  value={wechatAppId}
                                  onChange={(e) => setWechatAppId(e.target.value)}
                                  className="w-full px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                                  placeholder="输入微信开发者AppID..."
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-1">AppSecret</label>
                                <input
                                  type="password"
                                  value={wechatAppSecret}
                                  onChange={(e) => setWechatAppSecret(e.target.value)}
                                  className="w-full px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                                  placeholder="输入AppSecret..."
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Zhihu Fields */}
                        {target.id === 'zhihu' && (
                          <div>
                            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-1">专栏 API 授权 Token</label>
                            <input
                              type="password"
                              value={zhihuToken}
                              onChange={(e) => setZhihuToken(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                              placeholder="输入知乎开发者 Token..."
                            />
                          </div>
                        )}

                        {/* Medium Fields */}
                        {target.id === 'medium' && (
                          <div>
                            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-1">Integration Token</label>
                            <input
                              type="password"
                              value={mediumToken}
                              onChange={(e) => setMediumToken(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                              placeholder="Enter Medium Integration Token..."
                            />
                          </div>
                        )}

                        {/* Dev.to Fields */}
                        {target.id === 'devto' && (
                          <div>
                            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-1">Dev.to API Key</label>
                            <input
                              type="password"
                              value={devtoToken}
                              onChange={(e) => setDevtoToken(e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                              placeholder="Enter dev.to personal API Key..."
                            />
                          </div>
                        )}

                        {/* Save Action */}
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveConfigPlatform(null)}
                            className="px-2.5 py-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            id={`btn-save-platform-${target.id}`}
                            onClick={() => handleSaveConfig(target.id)}
                            className="px-3 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition"
                          >
                            验证并保存绑定
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Publish summary trigger button */}
          <div className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                一键分发设置报告
              </h3>
              
              <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
                <div className="flex justify-between"><span>已选目标平台：</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedPlatforms.length} 个</span></div>
                <div className="flex justify-between"><span>内容格式：</span><span className="font-mono">GitHub-Flavored MD</span></div>
                <div className="flex justify-between"><span>字符长度：</span><span>{post.content.length} 字符</span></div>
                <div className="flex justify-between"><span>含多媒体图片：</span><span>已自动转配</span></div>
              </div>

              <button
                id="btn-sync-trigger"
                onClick={handleStartSync}
                disabled={selectedPlatforms.length === 0}
                className="w-full py-2.5 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow disabled:opacity-50 transition"
              >
                开始多端同步发布
              </button>
            </div>

            <div className="p-4 bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block flex items-center gap-1">
                🔒 发布安全提示
              </span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                您的账号授权密钥仅本地保存在您的浏览器缓存(LocalStorage)中，数据决不会上传到公开服务器。每次在AI Studio关闭重开，安全缓存都会得到有效校验保护。
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
