# LeverUp Developer Docs

Documentation for integrating with the LeverUp Protocol. This project is built using [VitePress](https://vitepress.dev/).

## Features

- **Decentralized Trading**: Direct integration with smart contracts for trading.
- **High Leverage**: Access high-leverage trading pairs.
- **One-Click Trading**: Integration guide for a simplified trading experience.

## Prerequisites

- Node.js 18+
- npm or yarn/pnpm

## Installation

```bash
npm install
```

## Local Development

Start the local development server:

```bash
npm run docs:dev
```

The documentation will be available at http://localhost:5173.

## Build & Deployment

Build the documentation for production:

```bash
npm run docs:build
```

Preview the build locally:

```bash
npm run docs:preview
```

## Directory Structure

```
.
├── docs/
│   ├── .vitepress/   # VitePress configuration
│   ├── guide/        # Documentation guide content
│   ├── public/       # Static assets
│   └── index.md      # Home page
└── package.json
```
