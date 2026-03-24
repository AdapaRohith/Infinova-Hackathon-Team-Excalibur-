# Infinova Hiring Trust Engine

Infinova is a recruiter-focused verification platform that checks candidate claims and creates tamper-evident hiring attestations on-chain.

It combines resume intelligence, identity cross-checks, GitHub evidence review, and blockchain proof in one workflow.

## Why This Project

Most hiring tools optimize for collection and ranking. Infinova optimizes for trust.

The platform helps teams answer:

- Is this candidate identity consistent across submitted sources?
- Do listed skills have public evidence?
- Can the final hiring report be verified later without tampering?

## Core Capabilities

- AI-assisted resume analysis (summary, strengths, risks, score)
- 3-way identity verification across form input, resume, and GitHub/profile data
- Claim consistency checks and mismatch alerts
- Recruiter-friendly verdicting (`Trusted`, `Needs Review`, `High Risk`)
- On-chain attestation with transaction-level verification metadata

## How It Works

1. Recruiter submits candidate profile, resume, and GitHub/portfolio link.
2. The app extracts and normalizes resume information.
3. Identity and claim checks run across all available sources.
4. A final evidence-backed report and verdict are generated.
5. A cryptographic proof is anchored on-chain for later verification.

## Tech Stack

- React 19 + Vite
- Tailwind CSS
- React Router
- Framer Motion
- PDF.js (`pdfjs-dist`)
- Algorand SDK (`algosdk`) + Pera Wallet Connect
- Browser persistence via `localStorage`

## Blockchain Attestation Model

- Network: `Algorand TestNet`
- Attestation method: self-payment transaction note
- Stored on-chain: candidate identifier + report hash metadata (in encoded note)
- Stored off-chain: full report payload and sensitive candidate data

This design keeps costs low and preserves privacy while still providing tamper-evident integrity.

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Modern browser (Chrome/Edge/Firefox)

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app starts on the local Vite URL shown in your terminal (typically `http://localhost:5173`).

## Available Scripts

- `npm run dev` - start local development server
- `npm run build` - create production build in `dist/`
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint checks
- `npm run deploy` - publish `dist/` with GitHub Pages

## Project Structure

```text
src/
	components/     Reusable UI and feature components
	pages/          Route-level pages (dashboard, analysis, verification)
	utils/          Verification, hashing, blockchain, and extraction logic
public/           Static assets
```

## Deployment (GitHub Pages)

```bash
npm run build
npm run deploy
```

The configured `homepage` in `package.json` is used for the published route.

## Recommended Demo Narrative

"Infinova verifies truth, not just talent. It cross-checks identity and skill evidence, then anchors a tamper-evident proof of the hiring report on-chain."
