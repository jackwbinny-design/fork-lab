import { mkdir, readFile, writeFile } from "node:fs/promises";

const OWNER = "jackwbinny-design";
const OUTPUT = new URL("../src/data/repos.json", import.meta.url);
const GENERATED_AT = new Date().toISOString();

const categories = [
  {
    id: "agent",
    label: "AI Agent / 自动化",
    keywords: [
      "agent",
      "agents",
      "workflow",
      "automation",
      "claude",
      "codex",
      "mcp",
      "langflow",
      "workspace",
      "bridge",
      "skill",
      "llm"
    ],
    examples: ["拆它的工作流编排方式", "跑一个最小 demo", "提炼成自己的 Agent 技能模板"],
    why: "能提升你把 AI 工具变成真实工作流的能力。"
  },
  {
    id: "creative",
    label: "设计 / 图像视频",
    keywords: [
      "design",
      "image",
      "seedance",
      "ideogram",
      "diffusion",
      "lora",
      "portrait",
      "anime",
      "gallery",
      "render",
      "ui",
      "component",
      "paywall",
      "video",
      "poster",
      "prompt",
      "gpt-image"
    ],
    examples: ["拆解提示词结构", "复刻一个高质量视觉案例", "沉淀成封面/海报/短视频工作流"],
    why: "能提升你的视觉表达、设计判断和内容生产能力。"
  },
  {
    id: "knowledge",
    label: "知识管理 / 阅读输入",
    keywords: [
      "obsidian",
      "wiki",
      "knowledge",
      "markdown",
      "note",
      "bookmark",
      "read",
      "paper",
      "rss",
      "article",
      "wechat",
      "clipboard",
      "search"
    ],
    examples: ["把一个真实收藏导入", "生成一页结构化笔记", "比较它和你当前知识流程的差异"],
    why: "能减少信息堆积，把收藏变成可检索、可复用的材料。"
  },
  {
    id: "browser",
    label: "浏览器 / 桌面效率",
    keywords: [
      "chrome",
      "extension",
      "browser",
      "tauri",
      "desktop",
      "mac",
      "wechat",
      "twitter",
      "userscript",
      "clipboard",
      "dashboard",
      "tab",
      "translate"
    ],
    examples: ["安装试用核心功能", "记录它节省的具体步骤", "判断能否改造成个人效率工具"],
    why: "能把重复操作产品化，适合做轻量工具或插件型副业。"
  },
  {
    id: "finance",
    label: "金融 / 数据分析",
    keywords: [
      "stock",
      "trading",
      "hedge",
      "fund",
      "finance",
      "crypto",
      "market",
      "forex",
      "quant",
      "kronos"
    ],
    examples: ["只看数据管线和 agent 架构", "跑通非实盘分析", "记录模型如何组织市场信息"],
    why: "适合学习数据产品和多智能体分析框架，不作为投资依据。"
  },
  {
    id: "infra",
    label: "本地部署 / Infra",
    keywords: [
      "self-hosted",
      "cloudflare",
      "worker",
      "proxy",
      "clash",
      "server",
      "docker",
      "deploy",
      "infra",
      "api",
      "localai"
    ],
    examples: ["确认部署成本", "跑本地或容器版本", "记录依赖和坑点"],
    why: "能提升你把项目部署成可交付工具的能力。"
  },
  {
    id: "learning",
    label: "学习资源 / 提示词",
    keywords: [
      "course",
      "learn",
      "learning",
      "english",
      "tcm",
      "tutorial",
      "guide",
      "awesome",
      "prompts",
      "prompt",
      "dataset"
    ],
    examples: ["挑 3 条高价值资料", "转成自己的学习清单", "用一个案例验证资料质量"],
    why: "适合沉淀长期能力，但需要防止只收藏不实践。"
  }
];

const detailedProfiles = {
  openwiki: {
    deepIntro:
      "OpenWiki 是给“复制、收藏很多内容，但后续不整理”的人用的 Mac 桌面知识管理工具。它的核心不是让你先建文件夹，而是在你复制文字、图片或网页链接时弹出保存窗口；你决定要不要留下，后面的网页正文抓取、Wiki 页面整理、关系图谱和知识库问答交给 AI 处理。它适合用来替代一部分浏览器收藏夹、微信收藏和零散笔记，让输入内容自动变成可以搜索、提问、导出的本地知识库。",
    useCases: [
      "复制 X、公众号、网页里的内容，保存后让 AI 自动整理成 Wiki 页面。",
      "把最近收藏的内容生成知识图谱，看这些资料之间有什么关系。",
      "直接向自己的知识库提问，而不是重新翻收藏夹。",
      "每周看 AI 总结，判断自己最近到底在关注哪些主题。",
      "把整理好的内容导出为 Markdown，迁移到 Obsidian 或其他笔记系统。"
    ],
    setupSteps: [
      "去 Releases 下载 Mac 或 Windows 安装包。",
      "在设置里接入 Claude、OpenAI 或 Gemini。",
      "平时正常复制内容，弹窗出现后点击保存。",
      "等 AI 自动整理，再用搜索、问答或知识图谱查看结果。",
      "如果使用 Claude Desktop，可以再配置 MCP 连接。"
    ],
    whyUseful:
      "它正好对应你的核心问题：收藏太多但不整理。这个项目值得优先试，因为它把“整理”从手工分类改成了复制即触发、AI 自动归档。"
  },
  honcho: {
    deepIntro:
      "honcho 是给 AI Agent 增加长期记忆和用户状态的基础库。普通 Agent 每次对话容易忘记用户偏好、历史任务和关系上下文；honcho 的价值是把这些信息变成可持久化、可查询的记忆层，让 Agent 在后续对话里能延续理解。你可以把它当作“个人 AI 助手的大脑记忆模块”来研究。",
    useCases: [
      "保存用户偏好，例如默认中文、喜欢结论先行、重视可执行步骤。",
      "记录一段任务历史，让下次 Agent 能知道之前为什么这样决策。",
      "给不同用户或不同项目维护独立上下文。",
      "把记忆层接入自己的自动化助手或知识工具。"
    ],
    setupSteps: [
      "先读 README 的核心概念：session、user、memory、retrieval。",
      "跑一个最小示例：写入一条用户偏好，再在下一次调用中取出。",
      "记录它和普通向量数据库/聊天历史的区别。",
      "判断它是否能用于你的个人助手或仓库行动账本。"
    ],
    whyUseful:
      "你想让工具持续帮你整理和推荐，就需要“记住上周做过什么、哪些仓库已丢弃、你偏向哪些能力”。honcho 是这类长期 Agent 的底层能力。"
  },
  langflow: {
    deepIntro:
      "Langflow 是一个可视化 AI 工作流搭建工具。它把 LLM、Prompt、工具、数据库、API 调用等节点放在画布上连接起来，让你不用一开始就写大量代码，也能理解一个 Agent 或自动化流程是怎么从输入走到输出的。",
    useCases: [
      "搭一个网页内容总结流程：输入 URL，输出摘要和行动建议。",
      "搭一个多步骤 Agent：搜索资料、分类、打分、生成报告。",
      "把工作流导出或部署成 API。",
      "用它学习 Agent 工作流的基本结构。"
    ],
    setupSteps: [
      "按 README 跑本地版本。",
      "打开官方模板或最小 flow。",
      "记录每个节点的输入、处理和输出。",
      "尝试把 GitHub 仓库分类流程画成一个 flow。"
    ],
    whyUseful:
      "它适合帮你建立工作流思维。你以后做副业工具，本质也是把输入、处理、输出稳定串起来。"
  },
  impeccable: {
    deepIntro:
      "impeccable 是一个面向 AI 生成界面的设计语言项目。它不是简单 UI 组件库，更像是一套约束 AI 做设计时不要乱来的规范：布局、密度、排版、层级、视觉语言都要更像专业产品，而不是通用模板感页面。",
    useCases: [
      "给 Codex/Claude 生成界面时作为设计规范参考。",
      "拆解它如何定义好看的 AI 工具界面。",
      "把它的设计规则迁移到你的 Dashboard 或未来产品原型。",
      "作为评审清单，检查 AI 生成页面是否粗糙。"
    ],
    setupSteps: [
      "打开项目主页或 README，看它定义了哪些设计规则。",
      "挑一个界面样例，记录布局、间距、字体和状态设计。",
      "拿当前 Dashboard 对照检查，列出 3 个可改进点。",
      "沉淀成你自己的 AI 产品设计 checklist。"
    ],
    whyUseful:
      "你明确要求看板好看易懂。这个项目能提升你判断和指导 AI 做界面的能力。"
  },
  "make-x-great-again": {
    deepIntro:
      "make-x-great-again 是一个让 X/Twitter 更可用的浏览器扩展，目标是过滤噪音、提升信息质量，并给账号或内容增加信号判断。它适合研究“如何把社交平台的信息流改造成个人情报系统”。",
    useCases: [
      "降低 X 信息流里的垃圾内容和重复内容。",
      "给关注对象或账号增加信号评分。",
      "快速理解一个账号的资料、关系或内容倾向。",
      "拆成自己的收藏、过滤、推荐插件思路。"
    ],
    setupSteps: [
      "阅读 manifest 和主要功能模块，确认它做了哪些浏览器拦截或增强。",
      "本地安装插件，观察它改变了 X 的哪些操作。",
      "记录一个你最想保留的功能。",
      "判断是否能迁移到“收藏整理/信息雷达”副业方向。"
    ],
    whyUseful:
      "你大量灵感来自 X，这类工具可以从源头减少噪音，让输入更可控。"
  },
  "paywall-gallery": {
    deepIntro:
      "paywall-gallery 是 iOS App 订阅付费页和 onboarding 案例库。它收集截图、视频、价格模型和转化模式，适合学习产品如何让用户理解价值、选择套餐、完成付费。",
    useCases: [
      "研究不同 App 的定价表达方式。",
      "拆解 onboarding 如何把功能转成价值。",
      "为未来副业产品设计付费页和套餐。",
      "积累商业化界面参考。"
    ],
    setupSteps: [
      "打开项目主页，挑 5 个你觉得想付费的案例。",
      "记录每个案例的首屏文案、价格结构、CTA 和视觉重点。",
      "总结 3 条可复用的付费页设计原则。",
      "用这些原则改写一个你自己的副业想法。"
    ],
    whyUseful:
      "你想发展副业，商业化界面不是最后才考虑。这个项目能训练你从产品价值和付费转化角度看工具。"
  },
  "awesome-gpt-image-2": {
    deepIntro:
      "awesome-gpt-image-2 是 GPT Image 相关提示词和案例库，重点是把图像生成从随手写 prompt 变成可复用模板。它适合用来学习图像提示词结构、风格控制、文字渲染、角色一致性和商业级视觉案例。",
    useCases: [
      "复刻优秀海报、UI mockup、角色设定或商品图案例。",
      "拆出提示词里的主体、风格、构图、材质、限制条件。",
      "整理自己的封面图、小红书图、公众号图模板。",
      "形成可交付的设计提示词服务。"
    ],
    setupSteps: [
      "挑 3 个案例，不要全看。",
      "逐条拆解 prompt 结构。",
      "用自己的主题复刻一次。",
      "记录输出差异和可复用模板。"
    ],
    whyUseful:
      "它能直接提高你视觉内容生产能力，也容易转成内容产品、模板库或设计服务。"
  },
  "awesome-seedance-2-prompts": {
    deepIntro:
      "awesome-seedance-2-prompts 是视频生成提示词案例库，偏向 Seedance 2.0 的电影感、动漫、广告、UGC、梗图等场景。它适合你学习如何把一个画面想法写成可执行的视频生成 brief。",
    useCases: [
      "拆解视频提示词如何描述镜头、动作、风格和节奏。",
      "把文章或观点转成短视频视觉方案。",
      "积累广告感、电影感、社媒感视频模板。",
      "为以后做视频工作流或内容副业提供素材。"
    ],
    setupSteps: [
      "挑 3 个不同风格案例。",
      "拆出镜头、主体、运动、光线、风格词。",
      "用同一主题生成 2 个不同风格 prompt。",
      "记录哪个结构最稳定。"
    ],
    whyUseful:
      "视频生成会越来越常用。这个项目适合训练你把模糊想法变成可执行视频 brief。"
  },
  "x-bookmark-to-obsidian": {
    deepIntro:
      "x-bookmark-to-obsidian 是把 X 书签保存到 Obsidian 的 Chrome 插件。它解决的问题很具体：X 里收藏了很多内容，但长期躺在书签里不可搜索、不可整理、不可复用。",
    useCases: [
      "把 X 书签转成 Obsidian Markdown 笔记。",
      "给每条收藏加上来源、作者、时间和标签。",
      "把碎片灵感转成后续写作或产品想法素材。",
      "和 OpenWiki 对比，看哪个更适合你的输入流程。"
    ],
    setupSteps: [
      "安装插件或阅读 manifest。",
      "用 5 条 X 书签测试保存效果。",
      "检查生成 Markdown 是否适合长期整理。",
      "决定它是保留为工具，还是只吸收思路。"
    ],
    whyUseful:
      "它直接对应你的 X 收藏问题，是低成本验证“收藏转知识”的好项目。"
  }
};

detailedProfiles["awesome-gpt-image-2-"] = detailedProfiles["awesome-gpt-image-2"];

function normalize(text) {
  return (text || "").toLowerCase();
}

function classify(repo) {
  const text = normalize([repo.name, repo.description, repo.homepage, ...(repo.topics || [])].join(" "));
  const scored = categories
    .map((category) => ({
      ...category,
      hits: category.keywords.filter((keyword) => text.includes(keyword)).length
    }))
    .sort((a, b) => b.hits - a.hits);

  return scored[0]?.hits > 0 ? scored[0] : {
    id: "unknown",
    label: "待判断",
    examples: ["打开上游 README", "确认它解决的问题", "决定保留或丢弃"],
    why: "当前元数据不足，需要人工验证真实价值。"
  };
}

function plainChinese(repo, category) {
  const text = normalize([repo.name, repo.parent?.description, repo.description, repo.homepage].join(" "));

  if (text.includes("obsidian")) return "把 X/网页/书签等内容保存到 Obsidian 的工具，适合把收藏变成可整理笔记。";
  if (text.includes("wiki")) return "个人知识库或知识管理工具，重点是把零散资料变成可检索、可追问的结构。";
  if (text.includes("memory") && text.includes("agent")) return "给 AI Agent 保存长期记忆、用户状态和上下文的基础库。";
  if (text.includes("langflow")) return "用可视化方式搭建 AI Agent 和工作流的工具，适合学习工作流编排。";
  if (text.includes("chrome") || text.includes("extension")) return "浏览器插件项目，适合学习如何把一个具体痛点做成轻量工具。";
  if (text.includes("paywall")) return "收集订阅付费页和 onboarding 案例的资料库，适合学习产品商业化设计。";
  if (text.includes("seedance") || text.includes("video")) return "视频生成或视频提示词方向的项目，适合拆解短视频生成流程。";
  if (text.includes("gpt-image") || text.includes("image") || text.includes("diffusion") || text.includes("lora")) {
    return "图像生成、提示词、素材库或模型工作流项目，适合沉淀视觉生产能力。";
  }
  if (text.includes("trading") || text.includes("stock") || text.includes("market")) {
    return "金融数据或交易分析工具，适合学习数据管线和多智能体分析，不用于直接投资决策。";
  }
  if (text.includes("self-hosted") || text.includes("docker") || text.includes("deploy")) {
    return "可本地部署或自托管的工具，适合学习如何把项目部署成可用产品。";
  }
  if (text.includes("prompt")) return "提示词或案例集合，适合拆解高质量输入结构并转成自己的模板。";
  if (text.includes("component") || text.includes("ui") || text.includes("design")) return "设计系统、UI 组件或视觉参考项目，适合提高界面审美和实现能力。";

  const fallback = {
    agent: "AI Agent 或自动化工作流项目，适合学习如何把大模型能力串成可执行流程。",
    creative: "设计、图像或视频生成相关项目，适合提升视觉产出能力。",
    knowledge: "知识管理或信息整理项目，适合把收藏、文章和资料变成可复用素材。",
    browser: "浏览器或桌面效率工具，适合学习如何把日常操作做成小产品。",
    finance: "金融、交易或数据分析项目，适合学习数据组织和分析框架。",
    infra: "部署、网络或基础设施项目，适合学习运行和交付工具。",
    learning: "学习资料、教程或提示词集合，适合沉淀长期能力。",
    unknown: "仓库元数据不足，暂时只能判断为待验证项目。"
  };

  return fallback[category.id] || fallback.unknown;
}

function projectExamples(repo, category) {
  const text = normalize([repo.name, repo.parent?.description, repo.description, repo.homepage].join(" "));
  const examples = [];

  if (text.includes("obsidian") || text.includes("bookmark")) {
    examples.push("把 5 条真实收藏导进去，检查能否形成可检索笔记。");
  }
  if (text.includes("chrome") || text.includes("extension")) {
    examples.push("安装插件并完成一次真实网页操作，记录节省了哪一步。");
  }
  if (text.includes("prompt") || text.includes("gpt-image") || text.includes("seedance")) {
    examples.push("挑 3 个案例复刻，拆出提示词结构和可复用模板。");
  }
  if (text.includes("agent") || text.includes("workflow") || text.includes("langflow")) {
    examples.push("跑一个最小工作流，画出输入、处理、输出三段结构。");
  }
  if (text.includes("paywall") || text.includes("design") || text.includes("ui")) {
    examples.push("选 3 个界面案例，拆解布局、定价表达和转化策略。");
  }
  if (text.includes("trading") || text.includes("stock") || text.includes("market")) {
    examples.push("只跑历史数据或示例数据，记录它如何组织数据和结论。");
  }
  if (text.includes("self-hosted") || text.includes("docker") || text.includes("deploy")) {
    examples.push("确认本地启动步骤、依赖和部署成本。");
  }

  return [...new Set([...examples, ...category.examples])].slice(0, 4);
}

function repoKey(repo) {
  return normalize(repo.name);
}

function profileFor(repo) {
  return detailedProfiles[repoKey(repo)] || null;
}

function chineseIntro(repo, category) {
  const profile = profileFor(repo);
  if (profile?.deepIntro) return profile.deepIntro;

  const desc = repo.parent?.description || repo.description;
  const plain = plainChinese(repo, category);
  if (desc) {
    return `${repo.name} 可以先理解为：${plain} 原始说明：${desc}`;
  }
  return `${repo.name} 可以先理解为：${plain} 这个仓库没有公开描述，需要打开上游 README 补充判断。`;
}

function deepIntro(repo, category) {
  const profile = profileFor(repo);
  if (profile?.deepIntro) return profile.deepIntro;

  const desc = repo.parent?.description || repo.description;
  const plain = plainChinese(repo, category);
  const concrete = {
    agent: "具体要看它如何组织输入、工具调用、记忆、输出和部署。试用时不要只看 README，要画出它的流程图，判断哪些能力能搬到自己的自动化工具里。",
    creative: "具体要看它如何把视觉目标拆成提示词、素材、界面、模型或输出流程。试用时重点记录可复用模板，而不是只保存漂亮案例。",
    knowledge: "具体要看它如何把零散输入变成结构化内容，是否支持搜索、问答、导出、标签或图谱。试用时要用你的真实收藏测试。",
    browser: "具体要看它把哪个网页或桌面痛点做成了自动化操作。试用时重点看 manifest、权限、交互入口和节省步骤。",
    finance: "具体只学习数据获取、分析流程和 agent 分工，不把输出当投资建议。试用时用示例数据，不接真实资金动作。",
    infra: "具体要看它如何安装、部署、接 API、持久化数据和处理权限。试用时记录依赖和部署成本。",
    learning: "具体要把它当作资料源，而不是继续收藏。试用时只挑少量内容，转成自己的笔记或模板。",
    unknown: "第一步是打开 README，确认它解决的问题、使用对象和最小可运行方式。"
  };

  return `${plain}${desc ? ` 它的项目描述是“${desc}”。` : ""} ${concrete[category.id] || concrete.unknown}`;
}

function useCases(repo, category) {
  const profile = profileFor(repo);
  if (profile?.useCases) return profile.useCases;
  return projectExamples(repo, category);
}

function setupSteps(repo, category) {
  const profile = profileFor(repo);
  if (profile?.setupSteps) return profile.setupSteps;
  return [
    "打开上游 README，先看项目解决的问题和目标用户。",
    "找到安装或 demo 入口，不要先看完整文档。",
    firstAction(repo, category),
    "用一条真实任务测试，记录是否跑通、是否省事、是否值得继续。"
  ];
}

function usefulReason(repo, category) {
  const profile = profileFor(repo);
  return profile?.whyUseful || category.why;
}

function firstAction(repo, category) {
  const text = normalize([repo.name, repo.parent?.description, repo.description, repo.homepage].join(" "));

  if (text.includes("memory") && text.includes("agent")) {
    return "先读 README 的核心概念，写一个“用户偏好 -> 记忆保存 -> 下次调用”的最小流程。";
  }
  if (text.includes("langflow")) {
    return "先跑官方最小 flow，记录节点、输入、输出和部署方式。";
  }
  if (text.includes("obsidian") || text.includes("bookmark")) {
    return "用 5 条真实收藏测试导入效果，检查笔记格式是否适合长期保存。";
  }
  if (text.includes("wiki")) {
    return "导入一段真实剪贴板内容，验证它能否形成可检索知识页。";
  }
  if (text.includes("paywall")) {
    return "挑 5 个付费页案例，拆解定价表达、首屏结构和 CTA。";
  }
  if (text.includes("prompt") || text.includes("gpt-image") || text.includes("seedance")) {
    return "挑 3 个案例复刻，记录提示词结构、输入素材和输出质量。";
  }
  if (text.includes("chrome") || text.includes("extension")) {
    return "安装或阅读 manifest，确认它解决的单一浏览器痛点。";
  }
  if (text.includes("trading") || text.includes("stock") || text.includes("market")) {
    return "只看数据管线和 agent 架构，用示例数据验证，不做投资判断。";
  }
  if (text.includes("self-hosted") || text.includes("docker") || text.includes("deploy")) {
    return "确认本地启动步骤、依赖、端口和部署成本。";
  }
  if (repo.parent?.html_url || repo.html_url) {
    return "读 README 的安装方式和 3 个核心功能，再决定是否跑 demo。";
  }
  return "先补充项目来源和 README，再判断是否值得继续。";
}

function scoreInfo(repo, category) {
  const updated = Date.parse(repo.updated_at || 0);
  const pushed = Date.parse(repo.parent?.pushed_at || repo.pushed_at || 0);
  const daysSinceUpdate = Number.isFinite(updated) ? (Date.now() - updated) / 86400000 : 365;
  const daysSincePush = Number.isFinite(pushed) ? (Date.now() - pushed) / 86400000 : 365;
  const stars = repo.parent?.stargazers_count || repo.stargazers_count || 0;
  const homepage = repo.parent?.homepage || repo.homepage;
  const hasDescription = Boolean(repo.parent?.description || repo.description);

  const categoryFit = {
    agent: 20,
    creative: 19,
    knowledge: 20,
    browser: 17,
    infra: 13,
    learning: 12,
    finance: 7,
    unknown: 2
  };
  const hasProfile = Boolean(profileFor(repo));
  const recencyScore = Math.round(Math.max(0, 15 - Math.min(15, daysSinceUpdate / 8)));
  const activityScore = Math.round(Math.max(0, 15 - Math.min(15, daysSincePush / 8)));
  const influenceScore = Math.round(Math.min(12, Math.log10(stars + 1) * 2.6));
  const clarityScore = (hasDescription ? 5 : 0) + (homepage ? 3 : 0) + (repo.parent?.html_url ? 4 : 0);
  const fitScore = categoryFit[category.id] ?? 2;
  const actionabilityScore = hasProfile ? 14 : Math.min(10, projectExamples(repo, category).length * 2.5);
  const score = Math.round(Math.max(0, Math.min(100, recencyScore + activityScore + influenceScore + clarityScore + fitScore + actionabilityScore)));

  return {
    score,
    breakdown: [
      { label: "最近更新", value: recencyScore, reason: `你的 fork 最近更新约 ${Math.round(daysSinceUpdate)} 天前。` },
      { label: "上游活跃", value: activityScore, reason: `上游或项目最近 push 约 ${Math.round(daysSincePush)} 天前。` },
      { label: "外部影响", value: influenceScore, reason: `上游或项目 stars 约 ${stars}。` },
      { label: "信息完整", value: clarityScore, reason: `${hasDescription ? "有公开描述" : "缺少公开描述"}${homepage ? "，有项目主页" : "，暂无项目主页"}${repo.parent?.html_url ? "，已识别上游。" : "，暂未识别上游。"}` },
      { label: "目标相关", value: fitScore, reason: category.id === "finance" ? "金融类只作为技术学习，优先级主动降低。" : category.id === "unknown" ? "分类证据不足，暂时低分。" : `匹配「${category.label}」能力方向。` },
      { label: "可行动性", value: actionabilityScore, reason: hasProfile ? "已有较清晰的人工说明、用例和起步步骤。" : "根据元数据生成了可执行试用动作。" }
    ],
    reasons: [
      category.id === "unknown" ? "分类证据不足，需要人工打开 README 判断。" : `匹配你的「${category.label}」能力成长方向。`,
      daysSincePush <= 30 ? "项目近期仍有维护迹象。" : "项目活跃度一般，需要确认是否过时。",
      stars >= 500 ? "上游影响力较高，值得优先理解。" : "外部影响力不是主要依据，更适合作为小样本试用。"
    ]
  };
}

function usefulnessScore(repo, category) {
  return scoreInfo(repo, category).score;
}

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${path}`);
  }

  return response.json();
}

async function fetchRepos() {
  const repos = [];
  for (let page = 1; page <= 5; page += 1) {
    const batch = await github(`/users/${OWNER}/repos?per_page=100&page=${page}&sort=updated&type=owner`);
    if (!batch.length) break;
    repos.push(...batch);
  }
  return repos;
}

function preselect(repos) {
  return repos
    .map((repo) => {
      const category = classify(repo);
      return {
        repo,
        category,
        score: usefulnessScore(repo, category)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
    .map(({ repo }) => repo.name);
}

async function enrichSelected(repos, names) {
  const selected = new Set(names);
  const details = new Map();

  for (const repo of repos) {
    if (!selected.has(repo.name)) continue;
    try {
      const detail = await github(`/repos/${OWNER}/${encodeURIComponent(repo.name)}`);
      details.set(repo.name, detail);
    } catch (error) {
      console.warn(`Skipped detail for ${repo.name}: ${error.message}`);
      if (error.message.includes("rate limit")) break;
    }
  }

  return repos.map((repo) => ({ ...repo, ...(details.get(repo.name) || {}) }));
}

async function readPreviousRecords() {
  try {
    const content = await readFile(OUTPUT, "utf8");
    const parsed = JSON.parse(content);
    return new Map((parsed.repos || []).map((repo) => [repo.name, repo]));
  } catch {
    return new Map();
  }
}

function buildRecord(repo, rank, previous) {
  const category = classify(repo);
  const parent = repo.parent || repo.source || null;
  const selected = rank <= 50;
  const scoring = scoreInfo(repo, category);
  const cached = previous.get(repo.name) || {};
  const homepage = parent?.homepage || repo.homepage || cached.homepage || "";
  const upstreamName = parent?.full_name || cached.upstreamName || "";
  const upstreamUrl = parent?.html_url || cached.upstreamUrl || repo.html_url;
  const upstreamStars = parent?.stargazers_count || cached.upstreamStars || repo.stargazers_count || 0;
  const language = parent?.language || repo.language || cached.language || "Unknown";
  const pushedAt = parent?.pushed_at || repo.pushed_at || cached.pushedAt;
  const defaultBranch = parent?.default_branch || repo.default_branch || cached.defaultBranch || "main";
  const createdAt = repo.created_at || cached.createdAt;

  return {
    id: repo.full_name,
    name: repo.name,
    fullName: repo.full_name,
    forkUrl: repo.html_url,
    upstreamName,
    upstreamUrl,
    homepage,
    defaultBranch,
    description: parent?.description || repo.description || "",
    language,
    category: category.label,
    categoryId: category.id,
    score: scoring.score,
    scoreBreakdown: scoring.breakdown,
    scoreReasons: scoring.reasons,
    rank,
    selected,
    createdAt,
    updatedAt: repo.updated_at,
    pushedAt,
    upstreamStars,
    intro: chineseIntro(repo, category),
    deepIntro: deepIntro(repo, category),
    examples: projectExamples(repo, category),
    useCases: useCases(repo, category),
    setupSteps: setupSteps(repo, category),
    readmeTitle: repo.readmeTitle || cached.readmeTitle,
    readmeOverview: repo.readmeOverview || cached.readmeOverview,
    readmeHighlights: repo.readmeHighlights || cached.readmeHighlights,
    readmeInstallHints: repo.readmeInstallHints || cached.readmeInstallHints,
    readmeUrl: repo.readmeUrl || cached.readmeUrl,
    readmeFetchedAt: repo.readmeFetchedAt || cached.readmeFetchedAt,
    whyUseful: usefulReason(repo, category),
    firstAction: firstAction(repo, category),
    decision: "未判断"
  };
}

async function main() {
  await mkdir(new URL("../src/data", import.meta.url), { recursive: true });

  const previous = await readPreviousRecords();
  let repos;
  let usedCache = false;
  try {
    if (process.env.USE_CACHE === "1") {
      throw new Error("cache-only mode");
    }
    repos = await fetchRepos();
  } catch (error) {
    if (!previous.size) throw error;
    usedCache = true;
    console.warn(`Using cached repo data because GitHub fetch failed: ${error.message}`);
    repos = [...previous.values()].map((repo) => ({
      name: repo.name,
      full_name: repo.fullName || repo.id,
      html_url: repo.forkUrl || repo.upstreamUrl,
      description: repo.description,
      homepage: repo.homepage,
      default_branch: repo.defaultBranch,
      created_at: repo.createdAt,
      readmeTitle: repo.readmeTitle,
      readmeOverview: repo.readmeOverview,
      readmeHighlights: repo.readmeHighlights,
      readmeInstallHints: repo.readmeInstallHints,
      readmeUrl: repo.readmeUrl,
      readmeFetchedAt: repo.readmeFetchedAt,
      language: repo.language,
      updated_at: repo.updatedAt,
      pushed_at: repo.pushedAt,
      stargazers_count: repo.upstreamStars || 0,
      topics: [],
      parent: repo.upstreamName ? {
        full_name: repo.upstreamName,
        html_url: repo.upstreamUrl,
        description: repo.description,
        homepage: repo.homepage,
        default_branch: repo.defaultBranch,
        language: repo.language,
        pushed_at: repo.pushedAt,
        stargazers_count: repo.upstreamStars || 0
      } : null
    }));
  }
  const selectedNames = preselect(repos);
  const enriched = usedCache ? repos : await enrichSelected(repos, selectedNames);
  const records = enriched
    .map((repo) => {
      const category = classify(repo);
      return { repo, score: usefulnessScore(repo, category) };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ repo }, index) => buildRecord(repo, index + 1, previous));

  const payload = {
    owner: OWNER,
    generatedAt: GENERATED_AT,
    total: records.length,
    selectedCount: records.filter((repo) => repo.selected).length,
    categories: categories.map(({ id, label }) => ({ id, label })),
    repos: records
  };

  await writeFile(OUTPUT, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${records.length} repos to ${OUTPUT.pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
