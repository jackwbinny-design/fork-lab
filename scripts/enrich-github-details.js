import { readFile, writeFile } from "node:fs/promises";

const DATA_FILE = new URL("../src/data/repos.json", import.meta.url);
const OWNER = "jackwbinny-design";
const RESERVE_REQUESTS = 2;

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

function mergeDetail(repo, detail) {
  const parent = detail.parent || detail.source || null;
  return {
    ...repo,
    forkUrl: detail.html_url || repo.forkUrl,
    fullName: detail.full_name || repo.fullName,
    upstreamName: parent?.full_name || repo.upstreamName || "",
    upstreamUrl: parent?.html_url || repo.upstreamUrl || detail.html_url || repo.forkUrl,
    homepage: parent?.homepage || detail.homepage || repo.homepage || "",
    defaultBranch: parent?.default_branch || detail.default_branch || repo.defaultBranch || "main",
    createdAt: detail.created_at || repo.createdAt,
    description: parent?.description || detail.description || repo.description || "",
    language: parent?.language || detail.language || repo.language || "Unknown",
    pushedAt: parent?.pushed_at || detail.pushed_at || repo.pushedAt,
    updatedAt: detail.updated_at || repo.updatedAt,
    upstreamStars: parent?.stargazers_count ?? detail.stargazers_count ?? repo.upstreamStars ?? 0
  };
}

async function main() {
  const data = JSON.parse(await readFile(DATA_FILE, "utf8"));
  const rate = await github("/rate_limit");
  const remaining = rate.resources.core.remaining;
  const limit = Math.max(0, remaining - RESERVE_REQUESTS);

  if (limit <= 0) {
    console.log(`No API budget available. remaining=${remaining}`);
    return;
  }

  const candidates = data.repos
    .filter((repo) => !repo.upstreamName || !repo.upstreamUrl || !repo.defaultBranch)
    .slice(0, limit);

  if (!candidates.length) {
    console.log("No missing repo details.");
    return;
  }

  const byId = new Map(data.repos.map((repo) => [repo.id, repo]));
  let enriched = 0;

  for (const repo of candidates) {
    try {
      const name = repo.name;
      const detail = await github(`/repos/${OWNER}/${encodeURIComponent(name)}`);
      byId.set(repo.id, mergeDetail(repo, detail));
      enriched += 1;
      console.log(`enriched ${name}`);
    } catch (error) {
      console.warn(`skipped ${repo.name}: ${error.message}`);
      if (error.message.includes("rate limit")) break;
    }
  }

  data.repos = data.repos.map((repo) => byId.get(repo.id) || repo);
  data.detailEnrichedAt = new Date().toISOString();
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`Updated ${enriched} repos. API budget before run: ${remaining}, planned: ${limit}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
