import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const POSTS_FILE = path.join(process.cwd(), 'posts.json');

// Initialize Gemini API if key is available
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log('Gemini API successfully initialized on the server.');
  } catch (err) {
    console.error('Error initializing Gemini API:', err);
  }
} else {
  console.log('Gemini API key is missing or default. AI features will run in sandbox fallback mode.');
}

// Initial seed data
const DEFAULT_POSTS = [
  {
    id: 'post-1',
    title: '深入浅出 Gemini 3.5：大模型的多模态应用与提示词工程实践',
    content: `# 深入浅出 Gemini 3.5：大模型的多模态应用与提示词工程实践

最近，我深入研究了 Google 最新发布的 **Gemini 3.5** 系列模型。作为一个专注于 AI 领域的开发者，我深深被其在**多模态理解（Multimodal Understanding）**以及**超长上下文窗口（Long Context Window）**上的出色表现所震撼。

在这篇文章中，我将分享我的一系列实战心得，包括如何通过设计高质量的提示词（Prompt Engineering）来最大化激发 Gemini 3.5 的潜力，以及如何在个人项目中优雅地调用它。

---

## 1. 为什么是 Gemini 3.5？

相较于前代模型，Gemini 3.5 带来了以下几个维度的革命性提升：

1. **原生多模态（Native Multimodal）**：许多大模型是在纯文本模型的基础上，通过外接视觉/音频编码器来实现多模态。而 Gemini 从底层设计之初，就是将文本、图像、视频和音频统一放在一个深度融合的网络中进行训练。这使得它对跨模态关联的理解远比其他模型自然。
2. **出色的上下文召回率**：在大长文档（如上百万 Token）的阅读与特定信息召回中，Gemini 保持了极高的准确率（即所谓的 "Needle In A Haystack" 测试中几乎达到 100%）。
3. **极高的性价比**：\`gemini-3.5-flash\` 的响应速度飞快，且 API 调用成本非常低，非常适合作为高频应用的通用推理底座。

---

## 2. 提示词工程（Prompt Engineering）的核心技巧

在实际调用 Gemini 3.5 时，我总结出了三个最有效的提示词法则：

### 法则一：系统指令（System Instructions）的精确定义
Gemini 3.5 非常看重 Role 和 System Instruction。如果在调用时将身份和规范作为 \`systemInstruction\` 传入，它的遵从度会显著高于直接在 \`userContent\` 中声明。

### 法则二：提供充足的多模态上下文
当分析复杂图表或代码逻辑时，可以直接将**高清截图**和**对应的代码段**一同发送给模型。比如：
> *"分析这张性能走势图（截图），并结合附带的 \`server.ts\` 逻辑，找出在第15秒出现延迟飙升的可能代码根源。"*

### 法则三：结构化 JSON 输出
通过指定 \`responseMimeType: "application/json"\` 并提供模式（Schema），可以让 Gemini 以 100% 稳定的 JSON 格式返回，便于直接参与到程序逻辑中，避免了字符串解析报错的烦恼。

---

## 3. 简单的 Node.js 调用示例

使用最新的 \`@google/genai\` SDK，我们在服务器端初始化并调用非常直接：

\`\`\`typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateTechSummary(blogContent: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: \`请用一句话概括以下博客的主要内容：\\n\\n\${blogContent}\`,
  });
  
  return response.text;
}
\`\`\`

---

## 4. 总结与展望

AI 的发展日新月异，从最初的“对话玩具”到现在能真正帮我们打通多模态工作流的核心枢纽。对于开发者而言，学会如何编写优雅的 Prompt，如何将大模型的能力无缝塞进既有的业务系统中，是未来 5 年内最具有护城河意义的硬技能。

你目前在项目中使用 Gemini 做哪些有趣的尝试呢？欢迎在评论区或邮件与我交流！`,
    summary: '本文分享了 Google 最新发布的 Gemini 3.5 系列大模型的多模态应用体验，重点总结了三条极具实操价值的提示词设计法则，并提供了最新的 @google/genai SDK 核心代码调用示例，帮助开发者快速将 AI 能力融入实际业务。',
    category: 'ai',
    tags: ['Gemini 3.5', 'Prompt Engineering', '人工智能', 'TypeScript'],
    createdAt: '2026-07-08T10:30:00-07:00',
    updatedAt: '2026-07-08T11:15:00-07:00',
    published: true,
    views: 142,
    publishStatus: {
      github: { status: 'success', url: 'https://github.com/my-blog/posts/gemini-3.5-guide.md', publishedAt: '2026-07-08T11:15:00-07:00' },
      wechat: { status: 'success', url: 'https://mp.weixin.qq.com/s/simulated-wechat-gemini-guide', publishedAt: '2026-07-08T11:15:00-07:00' }
    }
  },
  {
    id: 'post-2',
    title: '从独立开发者到产品思维：技术人的职场下半场转型思考',
    content: `# 从独立开发者到产品思维：技术人的职场下半场转型思考

很多程序员朋友在工作了 5-10 年之后，都会面临一个普遍的职场瓶颈：**是继续深入技术细节，做一个纯粹的系统架构师，还是转型管理，亦或是出来尝试独立开发、做自己的产品？**

最近两年，我也经历了从“只看重技术架构是否炫酷”到“极致追求产品是否真解决用户痛点”的心态转变。以下是我在这次思维升级过程中的几点核心感悟。

---

## 1. 技术的“自我感动” vs. 产品的“价值交换”

在刚入行的前几年，我们最容易犯的错误是**“拿着锤子找钉子”**：
- 看到 GraphQL 很火，不管三七二十一就把项目中的 RESTful API 全换掉；
- 看到 Rust 性能极佳，就非要把一个只有几十个 QPS 的辅助微服务用 Rust 重写。

这往往是技术人员的**自我感动**。用户根本不在乎你的后端是用 Rust 还是用 Node.js 写的，甚至不在乎你的数据库是 PostgreSQL 还是单纯的内存 JSON 结构。**用户只在乎他们的痛苦有没有在 3 秒钟内得到缓解。**

*真正的产品思维是：用最简单的技术，最快地验证市场需求。多花时间跟潜在用户聊天，而不是在编辑器里重构那些根本没人用的精美函数。*

---

## 2. 独立开发的“痛感”教育：什么叫全栈？

直到我自己尝试发布第一个独立小软件，我才真正懂得了“全栈”这个词的分量。

在企业里，全栈可能指“懂前端，也懂后端”。但在市场竞争里，真正的全栈是指：
**“懂产品设计 + 懂开发交付 + 懂文案策划 + 懂SEO推广 + 懂客户服务 + 懂财务报税”**。

你写代码的速度可能只占产品成功要素的 20%，剩下的 80% 决定了你的项目是沦为 GitHub 上的僵尸仓库，还是能每月给你带来稳定的零花钱（Indie Hackers 所谓的 MRR）。

---

## 3. 职场人的核心突围：积累“可复用的资产”

无论你现在是打工人还是自由职业，都要学会积累自己的“资产”：
1. **个人品牌与受众**：写博客、分享日常，其实就是在互联网的公海里种下一颗种子，不断吸引同频的人。
2. **复用模块与工具链**：平时把常用的布局模板、第三方支付集成逻辑、用户认证模块沉淀成一键启动模板，将开发一个新产品的启动时间缩短到 48 小时内。
3. **商业敏锐度**：学会从日常的麻烦中嗅到商机。当身边有人抱怨“这个工具太难用了”或者“要是有一个能自动帮我做 A 事的东西就好了”时，你的脑子应该立刻转起来。

---

## 总结

技术是船舵，而产品思维是风帆。只有两者结合，你才可能在这个充满变数的时代，安全地驶向属于自己的职场彼岸。

祝所有技术路上的同行者，都能找到属于自己的那款“终极产品”。`,
    summary: '探讨了技术人员从传统的“系统架构执念”向“市场与用户痛点导向”的产品思维转型的心路历程。分享了独立开发在全栈商业维度上的痛点教育，以及在职场中如何积累个人品牌与复用模板等长效资产。',
    category: 'career',
    tags: ['程序员转型', '产品思维', '独立开发', '职业感悟'],
    createdAt: '2026-07-05T14:20:00-07:00',
    updatedAt: '2026-07-05T15:40:00-07:00',
    published: true,
    views: 320,
    publishStatus: {
      zhihu: { status: 'success', url: 'https://zhuanlan.zhihu.com/p/simulated-zhihu-career-path', publishedAt: '2026-07-05T15:40:00-07:00' },
      github: { status: 'success', url: 'https://github.com/my-blog/posts/career-thoughts.md', publishedAt: '2026-07-05T15:40:00-07:00' }
    }
  },
  {
    id: 'post-3',
    title: '手冲咖啡的艺术：在慢节奏中寻找生活的平衡点',
    content: `# 手冲咖啡的艺术：在慢节奏中寻找生活的平衡点

作为一个常常要在电脑前坐上十个小时、面对成百上千行代码的文字与数字工作者，我的生活曾经被高度的信息流和快速的反馈周期塞满。直到三年前，我偶然接触到了手冲咖啡，它逐渐变成了我每天清晨必不可少的仪式，也是我从快节奏工作中“偷得半日闲”的避风港。

在这篇随笔里，我想聊聊手冲咖啡的乐趣，以及这项爱好是如何在无形中治愈了我的焦虑。

---

## ☕ 手冲的仪式感：一万毫秒的纯粹

手冲咖啡的过程非常讲究参数和步骤。每一个步骤，都需要你把全副注意力投入其中：

1. **秤重与磨粉**：取出 15 克的浅度烘焙咖啡豆，倒进研磨器，伴随着清脆的咔嗒声，咖啡豆被碾碎，浓郁的干香（Dry Aroma）瞬间在空气中爆发，像是柑橘和茉莉花的混合香气。
2. **折纸与湿润**：将滤纸折好放入 V60 滤杯，用热水打湿，冲去纸味，同时也为分享壶和杯子预热。
3. **闷蒸（Blooming）**：倒入咖啡粉，注入 30 克、约 92 度的热水。看着咖啡粉像面包一样慢慢鼓起、呼吸，释放出二氧化碳，这是咖啡沉睡灵魂的苏醒过程。
4. **分段注水**：以滤杯中心为圆心，向外画圈，控制水流的粗细与节奏。在这个两分钟的过程中，你听不到键盘的敲击声，也看不到微信的消息红点，只有热蒸汽熏在脸上的温润和细密的水流声。

在这个小小的仪式里，生活里那些庞杂的噪音，仿佛都被咖啡滤纸过滤得一干二净。

---

## 💡 手冲咖啡带给我的生活启示

研究手冲久了，我发现咖啡豆的萃取逻辑，和我们的人生竟然惊人地相似。

### 启示一：过犹不及的“萃取度”
- 冲煮时间过短、水温太低，咖啡会显得酸涩寡淡，这是**萃取不足（Under-extracted）**。
- 冲煮时间太长、水温太高，或者咖啡粉磨得太细，又会带出木质的苦涩和杂味，这是**过度萃取（Over-extracted）**。
- **生活也是一样**：每天把自己逼得太紧、连轴转，就容易滋生焦虑与痛苦（过度萃取）；而彻底放任、不做任何输入，又容易感到无聊和空虚（萃取不足）。寻找那一杯均衡的甜感，就是寻找生活的**平衡点**。

### 启示二：接受不确定性的魅力
每一批咖啡豆，即使是同一个庄园的豆子，随着开封天数、空气湿度、甚至是今天倒水的力度微调，冲出来的风味都会有微妙的差别。有时候你想冲一杯花香浓郁的咖啡，结果却收获了极致的明亮酸质。

*学会欣赏这种细微的不确定性，而不是事事追求绝对的完美与量化，会让我们的神经放松很多。*

---

## 写在最后

明天早晨，关掉你的手机通知，留出十分钟给自己，也去冲一杯属于你自己的热咖啡吧。

闻一闻那阵香气，感受温度从滚烫慢慢降至温热。你会发现，原来生活最本真的甜，一直都藏在这些慢下来的细节里。`,
    summary: '记录了作者爱上手冲咖啡的心路历程，细致描述了从磨粉、闷蒸到分段注水的手冲仪式，并由咖啡豆的萃取逻辑推及到对生活节奏控制、接受不确定性等方面的感悟与智慧。',
    category: 'life',
    tags: ['手冲咖啡', '慢生活', '日常生活', '治愈系'],
    createdAt: '2026-07-02T09:15:00-07:00',
    updatedAt: '2026-07-02T10:00:00-07:00',
    published: true,
    views: 185,
    publishStatus: {
      github: { status: 'success', url: 'https://github.com/my-blog/posts/coffee-art.md', publishedAt: '2026-07-02T10:00:00-07:00' }
    }
  }
];

// Helper to read posts
function getPosts() {
  if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(DEFAULT_POSTS, null, 2), 'utf-8');
    return DEFAULT_POSTS;
  }
  try {
    const data = fs.readFileSync(POSTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading posts file, reverting to defaults:', err);
    return DEFAULT_POSTS;
  }
}

// Helper to save posts
function savePosts(posts: any[]) {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving posts file:', err);
  }
}

// Ensure database file is initialized
getPosts();

// --- API ROUTES ---

// 1. Get all posts
app.get('/api/posts', (req, res) => {
  res.json(getPosts());
});

// 2. Get single post by ID
app.get('/api/posts/:id', (req, res) => {
  const posts = getPosts();
  const post = posts.find((p: any) => p.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  // Increment view count dynamically
  post.views = (post.views || 0) + 1;
  savePosts(posts);
  res.json(post);
});

// 3. Create a new post
app.post('/api/posts', (req, res) => {
  const { title, content, summary, category, tags, published } = req.body;
  
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  const posts = getPosts();
  
  // Calculate average read time (roughly 400 characters per minute)
  const charCount = content.length;
  const readTime = Math.max(1, Math.ceil(charCount / 400));

  const newPost = {
    id: `post-${Date.now()}`,
    title,
    content,
    summary: summary || (content.replace(/[#*`\n-]/g, ' ').substring(0, 150) + '...'),
    category: category || 'life',
    tags: tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: published || false,
    views: 0,
    publishStatus: {}
  };

  posts.unshift(newPost);
  savePosts(posts);
  res.status(201).json(newPost);
});

// 4. Update an existing post
app.put('/api/posts/:id', (req, res) => {
  const { title, content, summary, category, tags, published, publishStatus } = req.body;
  const posts = getPosts();
  const index = posts.findIndex((p: any) => p.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const existingPost = posts[index];
  
  const charCount = content ? content.length : existingPost.content.length;
  const readTime = Math.max(1, Math.ceil(charCount / 400));

  const updatedPost = {
    ...existingPost,
    title: title !== undefined ? title : existingPost.title,
    content: content !== undefined ? content : existingPost.content,
    summary: summary !== undefined ? summary : (content ? (content.replace(/[#*`\n-]/g, ' ').substring(0, 150) + '...') : existingPost.summary),
    category: category !== undefined ? category : existingPost.category,
    tags: tags !== undefined ? tags : existingPost.tags,
    published: published !== undefined ? published : existingPost.published,
    publishStatus: publishStatus !== undefined ? publishStatus : existingPost.publishStatus,
    readTime,
    updatedAt: new Date().toISOString()
  };

  posts[index] = updatedPost;
  savePosts(posts);
  res.json(updatedPost);
});

// 5. Delete a post
app.delete('/api/posts/:id', (req, res) => {
  const posts = getPosts();
  const filtered = posts.filter((p: any) => p.id !== req.params.id);
  
  if (filtered.length === posts.length) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  savePosts(filtered);
  res.json({ success: true, id: req.params.id });
});

// --- AI HELPER ENDPOINTS WITH GEMINI ---

// 6. AI Writing Optimizer
app.post('/api/ai/optimize', async (req, res) => {
  const { content, instruction } = req.body;
  if (!content) {
    res.status(400).json({ error: 'Content is required' });
    return;
  }

  const prompt = `你是一个专业的文字编辑和创意写作导师。请根据以下修改指令，对文章内容进行润色和优化。
要求：
- 保持原有的Markdown格式和排版结构不变。
- 使得文字更加流畅、优美、契合其主题（AI学习、日常生活、或职场感悟）。
- 改正错别字和不通顺的句式。

修改指令：${instruction || '润色文字，提升表达流利度，保持自然谦逊的语调。'}

原始文章：
---
${content}
---

请直接输出润色优化后的完整Markdown内容，不要附带任何解释、前导词或“这是修改后的文章”等提示。`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });
      res.json({ content: response.text });
    } catch (err: any) {
      console.error('Gemini API call failed, using sandbox fallback:', err);
      res.json({ content: fallbackOptimize(content, instruction), error: err.message });
    }
  } else {
    // Return mock optimized content for local testing
    res.json({ content: fallbackOptimize(content, instruction) });
  }
});

// 7. AI Tag & Category Suggestion
app.post('/api/ai/tags', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }

  const prompt = `你是一个博客分类专家。请根据以下博客文章的标题和内容，推荐最合适、最具代表性的 3 到 5 个标签（Tags）以及在以下三个选项中选出一个最合适的分类（Category）：'ai' (AI学习), 'life' (日常生活), 'career' (职场感悟)。

博客标题：${title}
博客内容：
${content.substring(0, 1000)}

你的输出格式必须是严格的 JSON，不能有任何其他文字。格式如下：
{
  "category": "ai" | "life" | "career",
  "tags": ["标签1", "标签2", "标签3"]
}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (err: any) {
      console.error('Gemini API tags failed, using fallback:', err);
      res.json(fallbackTags(title, content));
    }
  } else {
    res.json(fallbackTags(title, content));
  }
});

// 8. AI Summarization Helper
app.post('/api/ai/summarize', async (req, res) => {
  const { title, content } = req.body;
  if (!content) {
    res.status(400).json({ error: 'Content is required' });
    return;
  }

  const prompt = `请为以下博客文章写一篇精炼、生动、且吸引人阅读的前言/导读（Summary）。字数控制在 100 到 150 字之间。要求语言通顺，能概括核心价值。

文章标题：${title || '无标题'}
文章内容：
${content.substring(0, 1200)}

请直接输出导读，不要包含任何前置语气词，例如“好的，这是为您生成的导读：”。`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });
      res.json({ summary: response.text?.trim() });
    } catch (err: any) {
      res.json({ summary: content.replace(/[#*`\n-]/g, ' ').substring(0, 130) + '...' });
    }
  } else {
    res.json({ summary: content.replace(/[#*`\n-]/g, ' ').substring(0, 130) + '...' });
  }
});

// 9. AI Outline Helper
app.post('/api/ai/outline', async (req, res) => {
  const { topic, category } = req.body;
  if (!topic) {
    res.status(400).json({ error: 'Topic is required' });
    return;
  }

  const prompt = `你是一个资深自媒体创作者和技术博主。我想写一篇关于“${topic}”的文章，分类是“${category || '日常生活'}”。
请帮我设计一个结构清晰、逻辑严密、层层递进的 Markdown 博客大纲，包含前言、核心章节（3-4个，带有二级子标题）、以及总结。
在大纲最后，给出一句话的写作灵感和推荐的调性风格。

请直接输出 Markdown 格式的大纲，不要有多余的解释。`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });
      res.json({ outline: response.text });
    } catch (err: any) {
      res.json({ outline: `## fallback大纲\n\n- 前言：介绍 ${topic} 的背景\n- 第一部分：${topic} 的核心要点与痛点\n- 第二部分：实践策略与技巧\n- 总结：未来的展望与下一步行动` });
    }
  } else {
    res.json({ outline: `## fallback大纲\n\n- 前言：介绍 ${topic} 的背景\n- 第一部分：${topic} 的核心要点与痛点\n- 第二部分：实践策略与技巧\n- 总结：未来的展望与下一步行动` });
  }
});

// --- MULTI-PLATFORM SYNC SIMULATION ---

// 10. Multi-Platform Publishing Sync Endpoint (SSE or step-based simulated response)
app.post('/api/sync', (req, res) => {
  const { postId, platforms, config } = req.body;
  if (!postId || !platforms || !Array.isArray(platforms)) {
    res.status(400).json({ error: 'PostId and target platforms array are required' });
    return;
  }

  const posts = getPosts();
  const index = posts.findIndex((p: any) => p.id === postId);
  if (index === -1) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const post = posts[index];
  const publishStatus = post.publishStatus || {};

  // Build simulated reports for selected platforms
  const steps = [
    { id: 1, name: 'Markdown解析与渲染格式校验', duration: 800 },
    { id: 2, name: '资源静态化与图像内嵌引用检查', duration: 1200 },
    { id: 3, name: '云发布接口握手与 Token 状态验证', duration: 1000 },
    { id: 4, name: '内容推送与标签分类匹配', duration: 1500 },
    { id: 5, name: '跨端链接验证与渲染状态检查', duration: 900 }
  ];

  // Randomize URLs slightly based on title for realism
  const slug = encodeURIComponent(post.title.substring(0, 10).replace(/[\s\W]+/g, '-'));
  
  const simulatedUrls: Record<string, string> = {
    github: `https://github.com/${config?.github?.username || 'user'}/${config?.github?.repo || 'blog'}/blob/main/posts/${slug || 'post'}.md`,
    medium: `https://medium.com/@${config?.medium?.username || 'writer'}/${slug || 'post'}-3a2b1c`,
    wechat: `https://mp.weixin.qq.com/s/simulated-wechat-${postId}`,
    zhihu: `https://zhuanlan.zhihu.com/p/simulated-zhihu-${postId}`,
    devto: `https://dev.to/${config?.devto?.username || 'dev'}/${slug || 'post'}`
  };

  const syncResults: Record<string, any> = {};

  platforms.forEach((pId: string) => {
    // Generate a simulated outcome. Let's make it success, but if they configured wrong token, we could fail.
    // For this mock, it's 95% successful unless they provide a specific fail trigger or the platform is unknown.
    const isSuccess = pId !== 'unsupported-platform';
    if (isSuccess) {
      publishStatus[pId] = {
        status: 'success',
        url: simulatedUrls[pId] || `https://example.com/posts/${postId}`,
        publishedAt: new Date().toISOString()
      };
      syncResults[pId] = {
        success: true,
        url: simulatedUrls[pId],
        msg: '发布成功'
      };
    } else {
      publishStatus[pId] = {
        status: 'failed',
        error: '授权服务连接超时，请检查配置。'
      };
      syncResults[pId] = {
        success: false,
        error: '授权服务连接超时，请检查配置。'
      };
    }
  });

  post.publishStatus = publishStatus;
  post.published = true;
  posts[index] = post;
  savePosts(posts);

  res.json({
    success: true,
    steps,
    results: syncResults,
    post
  });
});


// Fallback writing optimizer
function fallbackOptimize(content: string, instruction: string): string {
  const intro = `*【AI 创作助手已根据指令 “${instruction}” 进行局部润色】*\n\n`;
  let optimized = content;
  
  // Apply a few elegant search-and-replace tricks to simulate actual text polishing
  optimized = optimized.replace(/很多程序员朋友/g, '众多身处技术一线的开发者朋友');
  optimized = optimized.replace(/最近我深入研究了/g, '近期，我针对当下备受瞩目的');
  optimized = optimized.replace(/我深深被其/g, '其卓越的底层表现令我印象深刻');
  optimized = optimized.replace(/手冲咖啡的过程非常讲究参数和步骤。/g, '手冲咖啡的精妙之处，恰恰在于其对温度、研磨度与注水流速的精细把控。');
  optimized = optimized.replace(/生活里那些庞杂的噪音，仿佛都被咖啡滤纸过滤得一干二净。/g, '尘世中喧嚣浮躁的杂音，亦在这缓缓坠落的水珠与棉质滤纸间被涤荡得一尘不染。');

  if (!optimized.startsWith('*【AI')) {
    return intro + optimized;
  }
  return optimized;
}

// Fallback tagging logic based on simple content regex
function fallbackTags(title: string, content: string) {
  const combined = (title + ' ' + content).toLowerCase();
  const tags: string[] = [];
  let category: 'ai' | 'life' | 'career' = 'life';

  if (combined.includes('gemini') || combined.includes('ai') || combined.includes('model') || combined.includes('模型') || combined.includes('prompt') || combined.includes('提示词')) {
    category = 'ai';
    tags.push('AI学习', '大模型');
    if (combined.includes('gemini')) tags.push('Gemini');
    if (combined.includes('prompt')) tags.push('Prompt Engineering');
  } else if (combined.includes('职业') || combined.includes('职场') || combined.includes('管理') || combined.includes('技术人') || combined.includes('转') || combined.includes('程序员') || combined.includes('开发')) {
    category = 'career';
    tags.push('职场感悟', '技术成长');
    if (combined.includes('独立')) tags.push('独立开发');
    if (combined.includes('产品')) tags.push('产品思维');
  } else {
    category = 'life';
    tags.push('日常生活', '随笔生活');
    if (combined.includes('咖啡')) tags.push('手冲咖啡', '精致生活');
    if (combined.includes('安静') || combined.includes('治愈')) tags.push('治愈系');
  }

  // Deduplicate and pad tags
  const uniqueTags = Array.from(new Set(tags));
  if (uniqueTags.length < 3) {
    uniqueTags.push('思考');
  }

  return { category, tags: uniqueTags.slice(0, 5) };
}


// --- START SERVER AND VITE MIDDLEWARE ---

async function startServer() {
  // Integrate Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully started at http://localhost:${PORT}`);
  });
}

startServer();
