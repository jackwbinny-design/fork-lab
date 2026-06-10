import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Github,
  LayoutDashboard,
  Library,
  Search,
  Sparkles,
  Target,
  Trash2
} from "lucide-react";
import clusterData from "./data/clusters.json";
import data from "./data/repos.json";
import "./styles.css";

const decisionOptions = ["未判断", "本周试用", "继续深入", "保留参考", "转副业方向", "已吸收", "丢弃"];
const categoryOrder = [
  "agent",
  "creative",
  "content",
  "product",
  "browser",
  "knowledge",
  "vertical",
  "devtool",
  "network",
  "infra",
  "learning",
  "finance",
  "unknown"
];
const relationRoleOrder = ["主项目", "配套工具", "轻量替代", "同类替代", "资料索引", "采集工具", "第二阶段", "灵感参考", "疑似重复"];

function relationRoleRank(role) {
  const index = relationRoleOrder.indexOf(role);
  return index === -1 ? 99 : index;
}

function useLocalState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function update(next) {
    setValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  }

  return [value, update];
}

function formatDate(value) {
  if (!value) return "未知";
  return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function scoreTone(score) {
  if (score >= 80) return "high";
  if (score >= 65) return "mid";
  return "low";
}

function resolveClusters(rawClusters, repoMap) {
  return rawClusters.map((cluster) => {
    const relations = cluster.repoRelations
      .map((relation) => ({
        ...relation,
        repoData: repoMap.get(relation.repo) || null
      }))
      .sort((a, b) => relationRoleRank(a.role) - relationRoleRank(b.role));

    const primaryRepoData = repoMap.get(cluster.primaryRepo) || relations.find((relation) => relation.repoData)?.repoData || null;

    return {
      ...cluster,
      relations,
      primaryRepoData,
      projectCount: relations.filter((relation) => relation.repoData).length
    };
  });
}

function buildRepoClusterIndex(clusters) {
  const mapped = new Map();
  for (const cluster of clusters) {
    for (const relation of cluster.relations) {
      const list = mapped.get(relation.repo) || [];
      list.push(cluster);
      mapped.set(relation.repo, list);
    }
  }
  return mapped;
}

function pickRepoCluster(repo, repoClusterIndex) {
  if (!repo) return null;
  const clusters = repoClusterIndex.get(repo.name) || [];
  return clusters.find((cluster) => cluster.primaryRepo === repo.name) || clusters[0] || null;
}

function pickWeeklyClusters(clusters, decisions) {
  const blocked = new Set(
    Object.entries(decisions)
      .filter(([, decision]) => ["丢弃", "已吸收"].includes(decision))
      .map(([id]) => id)
  );

  const preferred = clusters
    .filter((cluster) => cluster.relations.some((relation) => relation.repoData && !blocked.has(relation.repoData.id)))
    .sort((a, b) => {
      const aPinned = a.relations.some((relation) => relation.repoData && decisions[relation.repoData.id] === "本周试用") ? -1000 : 0;
      const bPinned = b.relations.some((relation) => relation.repoData && decisions[relation.repoData.id] === "本周试用") ? -1000 : 0;
      const aRank = a.weeklyRank || 999;
      const bRank = b.weeklyRank || 999;
      return aRank + aPinned - (bRank + bPinned) || b.priorityScore - a.priorityScore;
    });

  return preferred.slice(0, 3);
}

function repoSearchRank(repo, query, clusterText) {
  if (!query) return 10;
  const name = repo.name.toLowerCase();
  const fullName = (repo.fullName || "").toLowerCase();
  const upstreamName = (repo.upstreamName || "").toLowerCase();
  if (name === query) return 0;
  if (name.includes(query)) return 1;
  if (fullName.includes(query) || upstreamName.includes(query)) return 2;
  if (clusterText.toLowerCase().includes(query)) return 3;
  return 4;
}

function compactNumber(value) {
  if (!value) return "0";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function Stat({ label, value, hint }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

function RepoScore({ score }) {
  return <span className={`score ${scoreTone(score)}`}>{score}</span>;
}

function ProjectRow({ repo, active, decision, clusterLabel, onClick }) {
  return (
    <button className={`project-row ${active ? "active" : ""}`} type="button" onClick={() => onClick(repo)}>
      <div>
        <strong>{repo.name}</strong>
        <span>{repo.category}{clusterLabel ? ` · ${clusterLabel}` : ""}</span>
      </div>
      <div className="project-row-meta">
        <small>{repo.upstreamStars ? `${compactNumber(repo.upstreamStars)} stars` : repo.language}</small>
        <RepoScore score={repo.score} />
      </div>
      {decision && decision !== "未判断" ? <em>{decision}</em> : null}
    </button>
  );
}

function WeeklyClusterActions({ weeklyClusters, onOpenCluster, onOpenRepo }) {
  return (
    <section className="panel action-panel">
      <div className="panel-title">
        <div>
          <span>Monday clusters</span>
          <h2>本周只推进这 3 组</h2>
        </div>
        <Target size={20} />
      </div>
      <div className="action-list">
        {weeklyClusters.map((cluster, index) => {
          const related = cluster.relations.filter((relation) => relation.repo !== cluster.primaryRepo && relation.repoData).slice(0, 4);

          return (
            <article className="action-card cluster-card" key={cluster.id}>
            <span className="action-index">{index + 1}</span>
            <div>
              <div className="action-head">
                <strong>{cluster.name}</strong>
                <RepoScore score={cluster.priorityScore} />
              </div>
              <div className="cluster-primary">
                <span>主线</span>
                <button type="button" onClick={() => cluster.primaryRepoData && onOpenRepo(cluster.primaryRepoData)}>
                  {cluster.primaryRepo}<ArrowUpRight size={14} />
                </button>
              </div>
              <p>{cluster.weeklyAction}</p>
              <div className="repo-chip-row">
                {related.map((relation) => (
                  <button type="button" key={relation.repo} onClick={() => onOpenRepo(relation.repoData)}>
                    {relation.repo}
                  </button>
                ))}
              </div>
              <button className="cluster-open" type="button" onClick={() => onOpenCluster(cluster)}>
                看整组<ArrowUpRight size={14} />
              </button>
              <small>完成标准：{cluster.doneCriteria}</small>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}

function RecentRepos({ repos, onOpen }) {
  const recent = [...repos]
    .filter((repo) => repo.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <section className="panel">
      <div className="panel-title">
        <div>
          <span>New forks</span>
          <h2>最近加入</h2>
        </div>
        <Sparkles size={20} />
      </div>
      <div className="recent-list">
        {recent.map((repo) => (
          <button type="button" key={repo.id} onClick={() => onOpen(repo)}>
            <strong>{repo.name}</strong>
            <span>{repo.category} · {formatDate(repo.createdAt)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function CategoryRoutes({ categories, repos, clusters, decisions, onOpenCategory, onOpenRepo }) {
  return (
    <section className="panel route-panel">
      <div className="panel-title">
        <div>
          <span>Capability routes</span>
          <h2>能力路线</h2>
        </div>
        <FolderOpen size={20} />
      </div>
      <div className="route-grid">
        {categories.map((category) => {
          const list = repos.filter((repo) => repo.categoryId === category.id);
          const top = [...list].sort((a, b) => b.score - a.score).slice(0, 4);
          const kept = list.filter((repo) => ["继续深入", "保留参考", "转副业方向"].includes(decisions[repo.id])).length;
          const selected = list.filter((repo) => repo.selected).length;
          const clusterCount = clusters.filter((cluster) => cluster.categoryId === category.id).length;

          return (
            <article className="route-card" key={category.id}>
              <button className="route-main" type="button" onClick={() => onOpenCategory(category.id)}>
                <div>
                  <span>{selected} 个精选 · {clusterCount} 个项目簇 · {kept} 个留存</span>
                  <h3>{category.label}</h3>
                </div>
                <strong>{list.length}</strong>
              </button>
              <div className="route-projects">
                {top.map((repo) => (
                  <button type="button" key={repo.id} onClick={() => onOpenRepo(repo)}>
                    <span>{repo.name}</span>
                    <small>{repo.score}</small>
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function logMatchesCluster(log, cluster) {
  if (log.clusterId === cluster.id || log.clusterName === cluster.name) return true;
  const relationRepoNames = new Set(cluster.relations.map((relation) => relation.repo));
  const relationRepoIds = new Set(cluster.relations.map((relation) => relation.repoData?.id).filter(Boolean));
  return (
    relationRepoNames.has(log.repoName) ||
    relationRepoNames.has(log.primaryRepo) ||
    relationRepoIds.has(log.repoId)
  );
}

function latestLogForCluster(logs, cluster) {
  return logs
    .filter((log) => logMatchesCluster(log, cluster))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0] || null;
}

function reviewFromDecision(cluster, latestLog) {
  if (!latestLog) {
    return {
      label: "待行动",
      tone: "pending",
      reason: "还没有本周记录，先完成一次最小试用，再判断留弃。",
      nextStep: cluster.weeklyAction
    };
  }

  const decision = latestLog.decision || "未判断";
  if (decision === "继续深入") {
    return {
      label: "继续",
      tone: "continue",
      reason: latestLog.output ? "已经有产出记录，适合下周继续加一个配套项目。" : "已经开始行动，但还需要补一个可复用产出。",
      nextStep: "保留主项目，下一步只接入一个配套工具。"
    };
  }
  if (decision === "保留参考") {
    return {
      label: "保留",
      tone: "keep",
      reason: "有参考价值，但暂时不需要继续投入执行时间。",
      nextStep: "把关键 README/案例留作资料，停止本周深挖。"
    };
  }
  if (decision === "转副业方向") {
    return {
      label: "副业",
      tone: "side",
      reason: "你已经把它判断为未来产品机会，需要从学习任务升级成机会验证。",
      nextStep: "写一个用户痛点、最小功能和 1 个可交付 demo。"
    };
  }
  if (decision === "已吸收") {
    return {
      label: "归档",
      tone: "archive",
      reason: "核心知识已经吸收，不需要继续占用行动台。",
      nextStep: "沉淀到笔记或模板里，后续只在需要时回查。"
    };
  }
  if (decision === "丢弃") {
    return {
      label: "丢弃",
      tone: "drop",
      reason: "你已经判断它不值得继续投入，应从下周行动里移出。",
      nextStep: "保留一句丢弃理由，避免以后重复收藏。"
    };
  }

  return {
    label: "待判断",
    tone: "pending",
    reason: "已有记录但还没有明确判断，需要补一个继续/保留/丢弃结论。",
    nextStep: "补充完成标准和留弃理由。"
  };
}

function buildWeeklyReview(weeklyClusters, logs) {
  const items = weeklyClusters.map((cluster) => {
    const latestLog = latestLogForCluster(logs, cluster);
    const review = reviewFromDecision(cluster, latestLog);
    return { cluster, latestLog, ...review };
  });

  const summary = items.reduce((result, item) => {
    result[item.tone] = (result[item.tone] || 0) + 1;
    return result;
  }, {});

  return { items, summary };
}

function WeeklyReview({ weeklyClusters, logs }) {
  const review = useMemo(() => buildWeeklyReview(weeklyClusters, logs), [weeklyClusters, logs]);
  const summaryItems = [
    ["继续", review.summary.continue || 0],
    ["保留", review.summary.keep || 0],
    ["副业", review.summary.side || 0],
    ["归档", review.summary.archive || 0],
    ["丢弃", review.summary.drop || 0],
    ["待行动", review.summary.pending || 0]
  ].filter(([, value]) => value > 0);

  return (
    <div className="weekly-review">
      <div className="review-heading">
        <div>
          <span>Auto review</span>
          <strong>自动复盘报告</strong>
        </div>
        <small>{weeklyClusters.length} 组</small>
      </div>
      <div className="review-summary">
        {summaryItems.map(([label, value]) => (
          <span key={label}>{label} {value}</span>
        ))}
      </div>
      <div className="review-list">
        {review.items.map((item) => (
          <article className={`review-item ${item.tone}`} key={item.cluster.id}>
            <div>
              <strong>{item.cluster.name}</strong>
              <span>{item.label}</span>
            </div>
            <p>{item.reason}</p>
            <small>下步：{item.nextStep}</small>
            <em>
              {item.latestLog
                ? `${formatDate(item.latestLog.date)}：${item.latestLog.did}`
                : `合并建议：${item.cluster.mergeStrategy}`}
            </em>
          </article>
        ))}
      </div>
    </div>
  );
}

function WeeklyLog({ weeklyClusters, logs, setLogs }) {
  const [form, setForm] = useState({
    clusterId: weeklyClusters[0]?.id || "",
    did: "",
    learned: "",
    output: "",
    decision: "继续深入"
  });

  useEffect(() => {
    if (weeklyClusters.some((cluster) => cluster.id === form.clusterId)) return;
    setForm((current) => ({ ...current, clusterId: weeklyClusters[0]?.id || "" }));
  }, [form.clusterId, weeklyClusters]);

  function submit(event) {
    event.preventDefault();
    if (!form.clusterId || !form.did.trim()) return;
    const cluster = weeklyClusters.find((item) => item.id === form.clusterId);
    setLogs([
      {
        id: `${Date.now()}`,
        date: new Date().toISOString(),
        clusterName: cluster?.name || form.clusterId,
        primaryRepo: cluster?.primaryRepo,
        ...form
      },
      ...logs
    ]);
    setForm({ ...form, did: "", learned: "", output: "" });
  }

  return (
    <section className="panel ledger">
      <div className="panel-title">
        <div>
          <span>Weekly ledger</span>
          <h2>本周进度</h2>
        </div>
        <ClipboardList size={20} />
      </div>
      <form className="log-form" onSubmit={submit}>
        <select value={form.clusterId} onChange={(event) => setForm({ ...form, clusterId: event.target.value })}>
          {weeklyClusters.map((cluster) => (
            <option key={cluster.id} value={cluster.id}>{cluster.name}</option>
          ))}
        </select>
        <textarea value={form.did} onChange={(event) => setForm({ ...form, did: event.target.value })} placeholder="实际做了什么" rows={3} />
        <textarea value={form.learned} onChange={(event) => setForm({ ...form, learned: event.target.value })} placeholder="学到了什么" rows={3} />
        <textarea value={form.output} onChange={(event) => setForm({ ...form, output: event.target.value })} placeholder="产出了什么" rows={3} />
        <div className="form-row">
          <select value={form.decision} onChange={(event) => setForm({ ...form, decision: event.target.value })}>
            {decisionOptions.filter((item) => !["未判断", "本周试用"].includes(item)).map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <button type="submit"><CheckCircle2 size={16} />记录</button>
        </div>
      </form>
      <div className="log-list">
        {logs.length === 0 ? <p className="empty-copy">暂无记录</p> : logs.map((log) => (
          <article className="log-item" key={log.id}>
            <div>
              <strong>{log.clusterName || log.repoName}</strong>
              <span>{formatDate(log.date)} · {log.decision}</span>
            </div>
            <p>{log.did}</p>
            {log.learned ? <p>{log.learned}</p> : null}
            {log.output ? <p>{log.output}</p> : null}
            <button type="button" onClick={() => setLogs(logs.filter((item) => item.id !== log.id))} aria-label="删除记录">
              <Trash2 size={15} />
            </button>
          </article>
        ))}
      </div>
      <WeeklyReview weeklyClusters={weeklyClusters} logs={logs} />
    </section>
  );
}

function DetailPanel({ repo, cluster, decision, onDecision, onOpenRepo }) {
  if (!repo) {
    return (
      <aside className="detail-panel empty-panel">
        <CircleDot size={22} />
        <h2>选择一个项目</h2>
        <p>这里会显示中文介绍、README 线索、用例、起步步骤和评分依据。</p>
      </aside>
    );
  }

  const currentRelation = cluster?.relations.find((relation) => relation.repo === repo.name);

  return (
    <aside className="detail-panel">
      <div className="detail-hero">
        <div>
          <span>{repo.category}</span>
          <h2>{repo.name}</h2>
          <p>{repo.upstreamName || repo.fullName}</p>
        </div>
        <RepoScore score={repo.score} />
      </div>

      <div className="detail-actions">
        <select value={decision} onChange={(event) => onDecision(repo.id, event.target.value)}>
          {decisionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <a href={repo.upstreamUrl || repo.forkUrl} target="_blank" rel="noreferrer"><Github size={16} />上游</a>
        {repo.homepage ? <a href={repo.homepage} target="_blank" rel="noreferrer"><ExternalLink size={16} />主页</a> : null}
      </div>

      {decision === "丢弃" ? (
        <div className="delete-prepare">
          <strong>GitHub 删除准备</strong>
          <p>这个项目已标记为丢弃。为避免误删，Dashboard 不会在浏览器里直接删除 GitHub 仓库；需要你确认后由本地脚本执行。</p>
          <code>npm run delete:repo -- {repo.fullName || repo.id}</code>
        </div>
      ) : null}

      <section>
        <h3>项目是什么</h3>
        <p>{repo.deepIntro || repo.intro}</p>
      </section>

      {cluster ? (
        <section>
          <h3>相关项目 / 可合并研究</h3>
          <div className="cluster-summary">
            <div>
              <strong>{cluster.name}</strong>
              <span>{cluster.projectCount} 个可关联项目</span>
            </div>
            <p>{cluster.purpose}</p>
            <small>合并建议：{cluster.mergeStrategy}</small>
          </div>
          {currentRelation ? (
            <p className="relation-note">当前项目关系：{currentRelation.relationReason}</p>
          ) : null}
          <div className="relation-list">
            {cluster.relations.map((relation) => (
              <button
                className={`relation-item ${relation.repo === repo.name ? "active" : ""}`}
                disabled={!relation.repoData}
                key={relation.repo}
                type="button"
                onClick={() => relation.repoData && onOpenRepo(relation.repoData)}
              >
                <div>
                  <strong>{relation.repo}</strong>
                  <span>{relation.role} · {relation.relationType}</span>
                </div>
                <p>{relation.mergeSuggestion}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {repo.readmeTitle || repo.readmeHighlights?.length ? (
        <section>
          <h3>README 线索</h3>
          {repo.readmeTitle ? <p className="readme-title">{repo.readmeTitle}</p> : null}
          {repo.readmeOverview?.length ? (
            <div className="readme-overview">
              {repo.readmeOverview.slice(0, 2).map((line) => <p key={line}>{line}</p>)}
            </div>
          ) : null}
          {repo.readmeHighlights?.length ? (
            <ul>
              {repo.readmeHighlights.slice(0, 5).map((line) => <li key={line}>{line}</li>)}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section>
        <h3>能干什么</h3>
        <ul>{(repo.useCases || repo.examples || []).map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section>
        <h3>怎么开始</h3>
        <ol>{(repo.setupSteps || [repo.firstAction]).map((item) => <li key={item}>{item}</li>)}</ol>
      </section>

      <section>
        <h3>评分依据</h3>
        <div className="score-grid">
          {(repo.scoreBreakdown || []).map((item) => (
            <div key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.value > 0 ? `+${item.value}` : item.value}</span>
              <p>{item.reason}</p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

function App() {
  const [mode, setMode] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState("selected");
  const [decisions, setDecisions] = useLocalState("github-dashboard-decisions", {});
  const [logs, setLogs] = useLocalState("github-dashboard-logs", []);
  const [selectedRepo, setSelectedRepo] = useState(data.repos[0] || null);

  const repos = data.repos || [];
  const repoMap = useMemo(() => new Map(repos.map((repo) => [repo.name, repo])), [repos]);
  const clusters = useMemo(() => resolveClusters(clusterData.clusters || [], repoMap), [repoMap]);
  const repoClusterIndex = useMemo(() => buildRepoClusterIndex(clusters), [clusters]);

  const categories = useMemo(() => {
    const mapped = new Map();
    for (const repo of repos) mapped.set(repo.categoryId, repo.category);
    return [...mapped.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => categoryOrder.indexOf(a.id) - categoryOrder.indexOf(b.id));
  }, [repos]);

  const weeklyClusters = useMemo(() => pickWeeklyClusters(clusters, decisions), [clusters, decisions]);
  const weeklyRepoNames = useMemo(() => new Set(weeklyClusters.flatMap((cluster) => cluster.relations.map((relation) => relation.repo))), [weeklyClusters]);

  const filteredRepos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return repos.filter((repo) => {
      const clusterText = (repoClusterIndex.get(repo.name) || [])
        .map((cluster) => `${cluster.name} ${cluster.purpose} ${cluster.mergeStrategy}`)
        .join(" ");
      const readmeText = `${repo.readmeTitle || ""} ${(repo.readmeOverview || []).join(" ")} ${(repo.readmeHighlights || []).join(" ")}`;
      const text = `${repo.name} ${repo.fullName || ""} ${repo.upstreamName || ""} ${repo.category} ${clusterText} ${repo.deepIntro || ""} ${repo.description || ""} ${readmeText}`.toLowerCase();
      const matchesQuery = !normalizedQuery || text.includes(normalizedQuery);
      const matchesCategory = category === "all" || repo.categoryId === category;
      const matchesView =
        view === "all" ||
        (view === "selected" && repo.selected) ||
        (view === "weekly" && weeklyRepoNames.has(repo.name)) ||
        (view === "kept" && ["继续深入", "保留参考", "转副业方向"].includes(decisions[repo.id]));
      return matchesQuery && matchesCategory && matchesView;
    }).sort((a, b) => {
      if (!normalizedQuery) return 0;
      const aClusterText = (repoClusterIndex.get(a.name) || [])
        .map((cluster) => `${cluster.name} ${cluster.purpose} ${cluster.mergeStrategy}`)
        .join(" ");
      const bClusterText = (repoClusterIndex.get(b.name) || [])
        .map((cluster) => `${cluster.name} ${cluster.purpose} ${cluster.mergeStrategy}`)
        .join(" ");
      return repoSearchRank(a, normalizedQuery, aClusterText) - repoSearchRank(b, normalizedQuery, bClusterText) || b.score - a.score;
    });
  }, [repos, query, category, view, weeklyRepoNames, decisions, repoClusterIndex]);

  useEffect(() => {
    if (mode !== "library" || filteredRepos.length === 0) return;
    if (!selectedRepo || !filteredRepos.some((repo) => repo.id === selectedRepo.id)) {
      setSelectedRepo(filteredRepos[0]);
    }
  }, [mode, filteredRepos, selectedRepo]);

  const stats = useMemo(() => {
    const kept = Object.values(decisions).filter((item) => ["继续深入", "保留参考"].includes(item)).length;
    const side = Object.values(decisions).filter((item) => item === "转副业方向").length;
    return {
      total: data.total || repos.length,
      selected: data.selectedCount || repos.filter((repo) => repo.selected).length,
      clusters: clusters.length,
      upstream: repos.filter((repo) => repo.upstreamName).length,
      readme: repos.filter((repo) => repo.readmeTitle || repo.readmeHighlights?.length).length,
      kept,
      side
    };
  }, [repos, clusters, decisions]);

  const selectedCluster = pickRepoCluster(selectedRepo, repoClusterIndex);

  function updateDecision(id, decision) {
    setDecisions({ ...decisions, [id]: decision });
  }

  function openRepo(repo) {
    setSelectedRepo(repo);
    setCategory(repo.categoryId || "all");
    setView("all");
    setQuery("");
    setMode("library");
  }

  function submitSearch(event) {
    event.preventDefault();
    const normalizedQuery = query.trim().toLowerCase();
    setCategory("all");
    setView("all");
    setMode("library");

    if (!normalizedQuery) return;

    const bestMatch = [...repos]
      .map((repo) => {
        const clusterText = (repoClusterIndex.get(repo.name) || [])
          .map((cluster) => `${cluster.name} ${cluster.purpose} ${cluster.mergeStrategy}`)
          .join(" ");
        const readmeText = `${repo.readmeTitle || ""} ${(repo.readmeOverview || []).join(" ")} ${(repo.readmeHighlights || []).join(" ")}`;
        const text = `${repo.name} ${repo.fullName || ""} ${repo.upstreamName || ""} ${repo.category} ${clusterText} ${repo.deepIntro || ""} ${repo.description || ""} ${readmeText}`.toLowerCase();
        return { repo, clusterText, matched: text.includes(normalizedQuery) };
      })
      .filter((item) => item.matched)
      .sort((a, b) => repoSearchRank(a.repo, normalizedQuery, a.clusterText) - repoSearchRank(b.repo, normalizedQuery, b.clusterText) || b.repo.score - a.repo.score)[0]?.repo;

    if (bestMatch) setSelectedRepo(bestMatch);
  }

  function openCategory(id) {
    const first = repos.filter((repo) => repo.categoryId === id).sort((a, b) => b.score - a.score)[0];
    setCategory(id);
    setView("all");
    if (first) setSelectedRepo(first);
    setMode("library");
  }

  function openCluster(cluster) {
    if (cluster.primaryRepoData) setSelectedRepo(cluster.primaryRepoData);
    setCategory(cluster.categoryId || "all");
    setView("weekly");
    setMode("library");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>Fork Lab</span>
          <h1>仓库行动账本</h1>
          <p>把收藏变成每周可执行的学习和产品素材。</p>
        </div>
        <nav>
          {[
            ["dashboard", "行动台", LayoutDashboard],
            ["routes", "能力路线", FolderOpen],
            ["library", "项目库", Library]
          ].map(([id, label, Icon]) => (
            <button key={id} className={mode === id ? "active" : ""} type="button" onClick={() => setMode(id)}>
              <Icon size={17} />{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span>{data.owner}</span>
          <small>更新 {formatDate(data.generatedAt)}</small>
        </div>
      </aside>

      <section className="main-stage">
        <header className="stage-header">
          <div>
            <span className="kicker">Learning dashboard</span>
            <h2>{mode === "dashboard" ? "今天按项目簇推进" : mode === "routes" ? "按能力路线整理项目" : "项目库"}</h2>
          </div>
          <form className="global-search" onSubmit={submitSearch}>
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索项目、用途、分类" />
          </form>
        </header>

        <section className="stats-strip">
          <Stat label="全部 fork" value={stats.total} hint={`${stats.upstream} 个已识别上游`} />
          <Stat label="项目簇" value={stats.clusters} hint="可合并行动包" />
          <Stat label="精选候选" value={stats.selected} hint="优先学习池" />
          <Stat label="README 线索" value={stats.readme} hint="已抽取说明" />
        </section>

        {mode === "dashboard" ? (
          <div className="dashboard-layout">
            <div className="primary-stack">
              <WeeklyClusterActions weeklyClusters={weeklyClusters} onOpenCluster={openCluster} onOpenRepo={openRepo} />
              <RecentRepos repos={repos} onOpen={openRepo} />
              <CategoryRoutes categories={categories} repos={repos} clusters={clusters} decisions={decisions} onOpenCategory={openCategory} onOpenRepo={openRepo} />
            </div>
            <WeeklyLog weeklyClusters={weeklyClusters} logs={logs} setLogs={setLogs} />
          </div>
        ) : null}

        {mode === "routes" ? (
          <CategoryRoutes categories={categories} repos={repos} clusters={clusters} decisions={decisions} onOpenCategory={openCategory} onOpenRepo={openRepo} />
        ) : null}

        {mode === "library" ? (
          <div className="library-layout">
            <section className="panel library-list">
              <div className="library-controls">
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="all">全部分类</option>
                  {categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
                <div className="segments">
                  {[["selected", "精选"], ["weekly", "本周"], ["kept", "留存"], ["all", "全量"]].map(([id, label]) => (
                    <button key={id} type="button" className={view === id ? "active" : ""} onClick={() => setView(id)}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="project-list">
                {filteredRepos.map((repo) => (
                  <ProjectRow
                    key={repo.id}
                    repo={repo}
                    active={selectedRepo?.id === repo.id}
                    decision={decisions[repo.id]}
                    clusterLabel={pickRepoCluster(repo, repoClusterIndex)?.name}
                    onClick={setSelectedRepo}
                  />
                ))}
              </div>
            </section>
            <DetailPanel
              repo={selectedRepo}
              cluster={selectedCluster}
              decision={selectedRepo ? decisions[selectedRepo.id] || selectedRepo.decision : "未判断"}
              onDecision={updateDecision}
              onOpenRepo={openRepo}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
