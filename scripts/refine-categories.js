import { readFile, writeFile } from "node:fs/promises";

const DATA_FILE = new URL("../src/data/repos.json", import.meta.url);

const categories = {
  product: {
    id: "product",
    label: "小产品 / 提效工具",
    why: "它更像可直接试用的小产品或效率工具，适合判断是否能节省步骤或迁移成副业小工具。"
  },
  content: {
    id: "content",
    label: "内容工具 / 媒体创作",
    why: "它面向内容生产、音视频、封面、短剧、发布或素材处理，适合沉淀成内容工作流。"
  },
  network: {
    id: "network",
    label: "网络 / 代理工具",
    why: "它属于网络、代理、路由、节点或系统连接工具，适合按基础设施价值单独判断。"
  },
  vertical: {
    id: "vertical",
    label: "垂直知识 / 数据产品",
    why: "它包含特定领域知识、规则、数据或专业分析，适合学习垂直知识产品结构。"
  },
  devtool: {
    id: "devtool",
    label: "开发工具 / 规范工程",
    why: "它更偏开发者工具、规范、CLI、工程效率或代码理解，适合沉淀成工程能力。"
  },
  agent: {
    id: "agent",
    label: "AI Agent / 自动化",
    why: "能提升你把 AI 工具变成真实工作流的能力。"
  },
  finance: {
    id: "finance",
    label: "金融 / 数据分析",
    why: "适合学习数据产品和多智能体分析框架，不作为投资依据。"
  },
  learning: {
    id: "learning",
    label: "学习资源 / 提示词",
    why: "适合沉淀长期能力，但需要防止只收藏不实践。"
  }
};

const rules = [
  {
    category: "network",
    pattern: /shadowrocket|passwall|openwrt|proxy|vpn|vpngate|socks|routing|netns|clash|blocked-sites|aethergate|audiovisual/i
  },
  {
    category: "content",
    pattern: /voice|tts|podcast|youtube|bilibili|short drama|短剧|短视频|小红书|封面|标题|视频|音频|绘图|数字人|aigc|toonflow|jellyfish|redbox|aitu|voicebox|vibevoice|omnivoice|cose/i
  },
  {
    category: "product",
    pattern: /resume|utility|cleaner|monitor|file transfer|media library|video management|desktop app|windows utility|send files|syncthing|weflow|javm|pigeon|xiaomusic|magic-resume|alt-sendme|winutil|macsai/i
  },
  {
    category: "vertical",
    pattern: /紫微|命理|古籍|排盘|radar|phased array|fatecat|plfm|mifish|mirofish|专业知识|知识库/i
  },
  {
    category: "finance",
    pattern: /wyckoff|a股|trader|trading|stock|market/i
  },
  {
    category: "devtool",
    pattern: /spec-driven|sdd|lark-cli|feishu|local development gateway|code understanding|website cloner|editor extension|sync everywhere|openspec|fastcode|coulson|cli-|ai-website-cloner/i
  },
  {
    category: "agent",
    pattern: /openclaw|claw|nanobot|assistant|bot|agent|memory|lancedb|opencode|clawith|oneclaw|picoclaw|lossless/i
  },
  {
    category: "learning",
    pattern: /ebook|course|teacher|tutorial|learn|learning|build your own|电子书|课程|教育|clicky|aetherviz/i
  }
];

function textFor(repo) {
  return [
    repo.name,
    repo.description,
    repo.readmeTitle,
    ...(repo.readmeOverview || []),
    ...(repo.readmeHighlights || [])
  ].filter(Boolean).join(" ");
}

function shouldRefine(repo) {
  return repo.categoryId === "unknown" || repo.category === "待判断";
}

function nextCategory(repo) {
  const text = textFor(repo);
  const matched = rules.find((rule) => rule.pattern.test(text));
  return matched ? categories[matched.category] : null;
}

function refreshReason(repo, category) {
  const breakdown = (repo.scoreBreakdown || []).map((item) => {
    if (item.label !== "目标相关") return item;
    return {
      ...item,
      reason: `重新归入「${category.label}」，不再作为笼统待判断处理。`
    };
  });
  const reasons = (repo.scoreReasons || []).map((reason) => reason.includes("分类证据不足") ? `重新归入「${category.label}」。` : reason);
  return { breakdown, reasons };
}

const data = JSON.parse(await readFile(DATA_FILE, "utf8"));
let changed = 0;

data.repos = data.repos.map((repo) => {
  if (!shouldRefine(repo)) return repo;
  const category = nextCategory(repo);
  if (!category) return repo;
  const refreshed = refreshReason(repo, category);
  changed += 1;
  return {
    ...repo,
    category: category.label,
    categoryId: category.id,
    scoreBreakdown: refreshed.breakdown,
    scoreReasons: refreshed.reasons,
    whyUseful: category.why
  };
});

const categoryMap = new Map((data.categories || []).map((category) => [category.id, category]));
for (const category of Object.values(categories)) {
  if (data.repos.some((repo) => repo.categoryId === category.id)) {
    categoryMap.set(category.id, { id: category.id, label: category.label });
  }
}
data.categories = [...categoryMap.values()];
data.categoryRefinedAt = new Date().toISOString();

await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
console.log(`Refined ${changed} repos.`);
