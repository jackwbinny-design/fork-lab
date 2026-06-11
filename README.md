# Fork Lab

[中文说明](./README.zh-CN.md)

Fork Lab is a learning dashboard for people who fork a lot of GitHub repositories, save them with good intentions, and then lose track of what is actually worth exploring.

It helps turn a fork backlog into a weekly decision system.

If your GitHub account looks like “hundreds of interesting repos, zero clear next step,” this project is for you.

## At a Glance

Fork Lab is built for a very specific situation:

- you fork repos faster than you review them
- you remember that something looked promising, but not why
- you want to compare related repos instead of judging them one by one
- you need a short weekly shortlist, not another infinite archive

In one sentence:

> Fork Lab turns GitHub forks from saved links into a structured learning queue.

Most fork collections eventually become a messy backlog:

- too many interesting repos
- too little context about why each one was saved
- no clear weekly priority
- no structure for deciding whether to keep, explore, or drop a project

Fork Lab was built as a response to that problem.

Instead of treating forked repositories as a passive archive, it turns them into an action-oriented review system: something you can open every week to decide what deserves time, what belongs together, and what should be ignored.

## What You See When You Open It

Fork Lab is designed around three views:

- a dashboard that surfaces weekly action groups
- a cluster layer that shows which repos belong together
- a library view for searching, filtering, and judging individual projects

The intended experience is simple:

1. Open the dashboard.
2. See what matters this week.
3. Pick one cluster.
4. Test one project for real.
5. Record what to keep, deepen, or drop.

## Why This Exists

The original use case was simple:

Someone keeps finding interesting open-source projects on GitHub, especially around AI agents, design tools, automation, browser workflows, local deployment, and knowledge systems. They fork first so they do not lose the link. After a while, the account contains hundreds of forks, but almost none of them are truly “processed.”

At that point, the problem is no longer discovery. The problem is decision-making.

Fork Lab is meant to help answer questions like:

- Why did I fork this repo in the first place?
- Is it still active or useful?
- Which repos are actually part of the same learning direction?
- What are the three best things to explore this week?
- Which ones should be kept as references, and which ones should be dropped?

## What Fork Lab Is

Fork Lab is a React + Vite dashboard that organizes a GitHub fork collection into a more usable decision layer.

It combines:

- repository metadata
- upstream project clues
- extracted README signals
- hand-curated relationship clusters
- local weekly decisions and notes

The result is not just a list of repositories. It is a lightweight personal research workflow.

## The Product Perspective

Fork Lab is not trying to solve repository discovery.

There are already many ways to discover projects:

- GitHub trending
- social feeds
- newsletters
- bookmarks
- stars
- random links from friends

The harder problem starts after discovery.

Once you have already collected too much, you need a system for:

- context
- ranking
- grouping
- weekly review
- explicit decisions

That is the product angle behind Fork Lab.

## Core Idea

Fork Lab treats a fork collection as a pipeline with three stages:

1. Save interesting repositories before they disappear from view.
2. Enrich them with enough context to make faster judgments later.
3. Review them in weekly batches so the collection turns into action, not hoarding.

This is why the UI is built around:

- selected repositories
- weekly action groups
- related project clusters
- keep / deepen / drop decisions

## How It Works

### 1. Repository Inventory

The dashboard starts with a GitHub account’s forked repositories and turns them into a structured dataset.

Each record can include:

- repository name and upstream source
- category and score
- basic description and language
- README highlights
- action suggestions
- learning-oriented explanations

### 2. Cluster-Based Review

Many repositories should not be reviewed in isolation.

For example, one repo may be the main product, while others are:

- companion tools
- lighter alternatives
- implementation references
- datasets or prompt collections

Fork Lab groups these into clusters so a weekly review is based on themes, not random single repos.

### 3. Weekly Action Layer

The dashboard then narrows the whole backlog into a small set of weekly priorities.

The goal is not “review everything.”

The goal is:

- choose a few strong candidates
- run one real test
- write down what was learned
- decide whether to continue, keep as reference, move toward productization, or drop

## Who It Is For

Fork Lab is especially useful for people who:

- fork many repos as part of research or inspiration collection
- work across AI, design, automation, tooling, or indie product exploration
- need a better system than browser bookmarks or raw GitHub stars
- want a more opinionated weekly review workflow for open-source discovery

It is not trying to be a general-purpose GitHub analytics tool.

It is closer to a personal learning and decision dashboard.

## Example Use Cases

- An AI tooling researcher who forks new agent frameworks every week and needs a better triage flow.
- A designer or indie maker collecting inspiration repos, component systems, and product references.
- A builder exploring multiple adjacent open-source tools and wanting to review them as clusters instead of isolated links.
- Someone turning GitHub discovery into a repeatable weekly habit rather than passive accumulation.

## Current Features

- React + Vite single-page dashboard
- repository overview and selected picks
- weekly action groups
- cluster view for related repositories
- local persistence for decisions and weekly notes
- scripts for upstream detail enrichment
- scripts for README clue extraction
- GitHub Pages deployment workflow

## Local Development

```bash
npm install
npm run dev
```

Default local URL:

```text
http://127.0.0.1:5173
```

## Build

```bash
npm run build
```

## Refresh Data

```bash
npm run update:data
npm run enrich:details
npm run enrich:readmes
npm run refine:categories
```

Refresh everything and rebuild:

```bash
npm run update:dashboard
```

## Deploy to GitHub Pages

This repository already includes a GitHub Actions workflow that:

- builds automatically after pushes to `main`
- deploys `dist/` to GitHub Pages

For first-time setup, confirm the following in the repository settings:

1. `Settings -> Pages`
2. `Build and deployment` is set to `GitHub Actions`

## Tech Stack

- React 18
- Vite 8
- Lucide React
- Node.js scripts for GitHub data enrichment

## Attribution and References

Fork Lab is open source, so it is worth being explicit about what comes from where.

- Third-party runtime and build dependencies are listed in [`package.json`](./package.json).
- Upstream repository metadata and README clues come from public GitHub repositories and remain the property of their respective maintainers.
- A dedicated attribution note lives in [`ATTRIBUTION.md`](./ATTRIBUTION.md), where inspiration, references, direct code reuse, and future acknowledgements should be documented clearly.

## Project Status

This is the first public demo version of Fork Lab.

It is intentionally focused on one core problem: turning a large GitHub fork backlog into something reviewable, understandable, and actionable.

> For public demo publishing, the repository may use a reduced sample dataset to keep the repo lightweight and deployment stable, while the local workspace can continue using the full dataset and update scripts.
