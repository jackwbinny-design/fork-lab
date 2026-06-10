import { readFile, writeFile } from "node:fs/promises";

const DATA_FILE = new URL("../src/data/repos.json", import.meta.url);
const README_FILES = ["README.md", "README.zh-CN.md", "README_CN.md", "readme.md"];
const LIMIT = Number.parseInt(process.env.README_LIMIT || "80", 10);

function cleanLine(line) {
  return line
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[[^\]]+]\([^)]*\)/g, (match) => match.replace(/\]\([^)]*\)/, "]").replace("[", "").replace("]", ""))
    .replace(/[#>*`|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreBullet(line) {
  const text = line.toLowerCase();
  const keywords = [
    "feature",
    "support",
    "supports",
    "automatic",
    "generate",
    "search",
    "local",
    "open-source",
    "mcp",
    "agent",
    "workflow",
    "dashboard",
    "install",
    "quick start",
    "支持",
    "自动",
    "生成",
    "搜索",
    "本地",
    "开源",
    "知识",
    "安装",
    "快速"
  ];
  return keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0);
}

function parseReadme(markdown) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "\n");
  const lines = withoutCode.split(/\r?\n/);
  const cleaned = lines.map(cleanLine).filter(Boolean);
  const title = cleanLine(
    lines.find((line) => /^#\s+/.test(line)) ||
    cleaned.find((line) => line !== "---" && !/^https?:\/\//.test(line) && !/^\[\]\(/.test(line)) ||
    ""
  );
  const paragraphs = cleaned
    .filter((line) => line.length >= 30 && line.length <= 260)
    .filter((line) => !/^[-\d.]+\s/.test(line))
    .filter((line) => !/badge|license|stars|forks|npm|pypi/i.test(line))
    .slice(0, 3);
  const bulletCandidates = lines
    .filter((line) => /^\s*(-|\*|\d+\.)\s+/.test(line))
    .map(cleanLine)
    .filter((line) => line.length >= 12 && line.length <= 180)
    .map((line) => ({ line, score: scoreBullet(line) }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.line);
  const highlights = [...new Set(bulletCandidates)].slice(0, 8);
  const installLines = cleaned
    .filter((line) => /install|quick start|getting started|usage|安装|快速开始|使用/i.test(line))
    .slice(0, 6);

  return {
    title,
    overview: paragraphs,
    highlights,
    installHints: installLines
  };
}

async function fetchReadme(repo, fullName) {
  const branch = repo.defaultBranch || "main";
  for (const file of README_FILES) {
    const url = `https://raw.githubusercontent.com/${fullName}/${encodeURIComponent(branch)}/${file}`;
    const response = await fetch(url);
    if (response.ok) {
      const markdown = await response.text();
      if (markdown.trim().length > 80) {
        return { url, ...parseReadme(markdown) };
      }
    }
  }
  return null;
}

async function main() {
  const data = JSON.parse(await readFile(DATA_FILE, "utf8"));
  const targets = data.repos
    .filter((repo) => process.env.REFRESH_README === "1" || !repo.readmeFetchedAt)
    .slice(0, LIMIT);

  let fetched = 0;
  for (const repo of targets) {
    const fullNames = [repo.upstreamName, repo.fullName].filter(Boolean);
    let readme = null;
    for (const fullName of fullNames) {
      try {
        readme = await fetchReadme(repo, fullName);
        if (readme) break;
      } catch {
        // Try the next source.
      }
    }
    if (readme) {
      repo.readmeTitle = readme.title;
      repo.readmeOverview = readme.overview;
      repo.readmeHighlights = readme.highlights;
      repo.readmeInstallHints = readme.installHints;
      repo.readmeUrl = readme.url;
      repo.readmeFetchedAt = new Date().toISOString();
      fetched += 1;
      console.log(`readme ${repo.name}`);
    } else {
      repo.readmeFetchedAt = new Date().toISOString();
      console.log(`no readme ${repo.name}`);
    }
  }

  data.readmeEnrichedAt = new Date().toISOString();
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`Fetched README data for ${fetched}/${targets.length} repos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
