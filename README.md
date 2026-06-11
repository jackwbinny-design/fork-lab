# Fork Lab

[中文说明](./README.zh-CN.md)

Fork Lab is a GitHub fork dashboard demo for personal learning, evaluation, and weekly project prioritization.

This project turns the forked repositories under `jackwbinny-design` into a browsable React dashboard designed to answer three practical questions:

- Which forks are worth spending more time on?
- Which three project groups should be pushed forward this week?
- Which repositories belong to the same capability track and should be reviewed together?

## Features

- React + Vite single-page dashboard
- Repository overview, selected picks, and weekly action groups
- Cluster view for reviewing related repositories together
- Local persistence for decisions and weekly notes
- README clue enrichment and upstream metadata scripts
- GitHub Pages deployment workflow

## Run Locally

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

## Notes

This is the first public product demo of the project. The goal is to turn “I forked a lot of repos but don’t know what to do next” into an actionable interface.

> For public demo publishing, the repository may use a reduced sample dataset to keep the repo lightweight and deployment stable, while the local workspace can continue using the full dataset and update scripts.
