# Infinova Hackathon

An agentic hiring trust engine that verifies candidate identity, audits GitHub-backed skill claims, and anchors tamper-evident hiring attestations on-chain.

## What It Does

Traditional hiring tools help collect applications. This project focuses on trust.

The app takes three signals:
- recruiter-entered candidate identity
- uploaded resume
- GitHub profile or portfolio link

It then runs a verification workflow that:
- extracts resume claims and structured metadata
- compares identity across form name, resume name, and GitHub profile
- flags false-claim or mismatch risks
- audits public GitHub evidence against claimed skills
- generates a recruiter verdict such as `Trusted`, `Needs Review`, or `High Risk`
- creates an on-chain attestation for the final hiring report

## Why It Is Different

This is not just a resume scorer and not just a blockchain add-on.

The product combines:
- agentic AI workflow for resume analysis, identity checking, evidence auditing, and decision synthesis
- evidence-backed hiring verification instead of generic AI scoring
- blockchain-based integrity for tamper-evident hiring attestations

## Key Features

- AI candidate analysis with strengths, weaknesses, summary, and score
- 3-way identity verification across form, resume, and GitHub
- false-claim detection when submitted sources do not align
- GitHub verification with public evidence review
- recruiter decision layer with verdict, risk, and confidence
- on-chain hiring attestation generation on Sepolia
- attestation verification page with contract, transaction, and integrity checks
- recruiter dashboard with verdicts, proof status, and Etherscan links

## Product Flow

1. Submit candidate name, email, resume, and GitHub profile
2. Run AI analysis and verification agents
3. Review the evidence snapshot, verdict, and identity warnings
4. Generate blockchain proof for the hiring report
5. Verify the report later using the stored on-chain attestation

## Tech Stack

- React
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- React Hot Toast
- Ethers.js
- PDF.js
- Local browser persistence with `localStorage`

## Blockchain Layer

- Network: `Sepolia`
- Contract stores report hashes by candidate ID
- Full candidate data is kept off-chain
- Only the attestation hash and verification metadata are anchored on-chain

This keeps the system lighter, cheaper, and better for privacy while still making the final report tamper-evident.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Demo Pitch

“We verify truth, not just talent. Agentic AI checks the claims, GitHub provides evidence, and blockchain preserves the proof.”
