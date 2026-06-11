# Attribution

This file exists to make Fork Lab more transparent as an open-source project.

The goal is simple:

- say clearly what is dependency usage
- say clearly what is inspiration
- say clearly what is direct reuse
- reduce ambiguity before anyone has to ask

## Current Status

Based on the current repository audit, I did not find a copied application codebase from a named external project.

At the moment, Fork Lab appears to be:

- a custom React + Vite application built for a specific GitHub fork review workflow
- powered by standard open-source dependencies
- shaped by general dashboard, triage, and research-workflow patterns

That means the current known attribution picture is:

### 1. Dependencies

These are third-party libraries used as dependencies rather than copied source files:

- `react`
- `react-dom`
- `vite`
- `@vitejs/plugin-react`
- `lucide-react`
- `playwright`

Their licenses, source code, and ownership remain with their original maintainers.

## What Counts As What

To avoid confusion later, Fork Lab uses the following distinction:

### Inspiration

Use this when the project borrowed:

- a product idea
- a workflow framing
- a UI pattern
- a naming pattern
- a dashboard information architecture

without copying implementation code directly.

### Reference

Use this when a project influenced:

- a feature direction
- a data model
- a review flow
- a categorization idea

but the implementation here was rewritten for this repo.

### Direct Reuse

Use this only when code, assets, copy, or interaction logic were actually adapted from another project in a meaningful way.

If that happens, document:

- source project
- exact file, module, or interaction borrowed
- whether it was modified
- original license

## Recommended Disclosure Format

If you borrow something in the future, append an entry like this:

```md
## Borrowed or Adapted Pieces

### Source: owner/repo

- Type: inspiration | reference | direct reuse
- What was borrowed: dashboard flow / specific component / copy / data schema
- How it was used here: rewritten / adapted / partially reused
- Original license: MIT / Apache-2.0 / etc.
- Notes: any extra context worth making explicit
```

## Data and Upstream Projects

Fork Lab processes public GitHub repository metadata and short README-derived clues for learning and review purposes.

Important distinction:

- the dashboard does not claim ownership over upstream repositories
- the upstream project content still belongs to the original maintainers
- short extracted summaries or highlights should be treated as contextual signals, not replacement documentation

## Maintenance Rule

If a future version of Fork Lab borrows from a specific repo in a way that a reasonable maintainer would want acknowledged, add it here and link it from the README.
