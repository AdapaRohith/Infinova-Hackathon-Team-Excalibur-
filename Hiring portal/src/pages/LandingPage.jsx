import { motion as Motion } from 'framer-motion'
import {
  Brain,
  Blocks,
  LayoutDashboard,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { FeatureCard } from '../components/FeatureCard'
import { FlowStepper } from '../components/FlowStepper'
import { SystemFlow } from '../components/SystemFlow'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const features = [
  {
    icon: Brain,
    title: 'Agentic Verification',
    description: 'Multiple agents extract claims, cross-check identity, audit GitHub evidence, and issue a recruiter verdict.',
    gradient: 'from-indigo-500/20 to-violet-500/20',
  },
  {
    icon: Blocks,
    title: 'Blockchain Verification',
    description: 'Each candidate proof is hashed and recorded for immutable trust.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    icon: LayoutDashboard,
    title: 'Recruiter Dashboard',
    description: 'Track evaluated candidates with instant verification status and filters.',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
]

const stats = [
  { icon: Sparkles, value: 'AI', label: 'Structured Evaluation', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { icon: Shield, value: 'Web3', label: 'On-chain Proof', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Zap, value: 'Audit', label: 'False Claim Detection', color: 'text-violet-400', bg: 'bg-violet-500/10' },
]

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function LandingPage() {
  return (
    <div className="space-y-16 pb-20 md:space-y-24">

      {/* ═══ HERO ═══ */}
      <section className="relative grid items-center gap-10 overflow-hidden rounded-3xl border border-gray-800/60 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-950/90 p-8 pt-10 lg:grid-cols-2 lg:p-12 lg:pt-14">
        {/* Ambient blurs */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-indigo-500/20 blur-[100px] animate-float" />
        <div className="pointer-events-none absolute -bottom-24 -right-28 h-80 w-80 rounded-full bg-violet-500/20 blur-[100px]" style={{ animationDelay: '2s' }} />
        <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 rounded-full bg-indigo-400/15 blur-[80px]" />

        {/* Grid pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

        {/* Left: Copy */}
        <Motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10"
        >
          <Motion.p variants={fadeUp} className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 animate-pulse-glow">
            <Sparkles className="size-3" />
            Trust Layer for Hiring Decisions
          </Motion.p>

          <Motion.h1 variants={fadeUp} className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-indigo-200 bg-clip-text text-transparent animate-gradient">
              Verified Talent.
            </span>{' '}
            Not Just Resumes.
          </Motion.h1>

          <Motion.p variants={fadeUp} className="mt-5 max-w-lg text-base text-gray-300 md:text-lg">
            An agentic hiring trust engine that verifies identity, audits public code claims, and anchors tamper-proof reports on-chain.
          </Motion.p>

          <Motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            <Link to="/analyze">
              <Button>Analyze Candidate</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary">View Dashboard</Button>
            </Link>
          </Motion.div>

          <Motion.p variants={fadeUp} className="mt-6 max-w-lg text-sm italic text-gray-400">
            Hiring based on claims is broken. We verify truth.
          </Motion.p>

          {/* Stats row */}
          <Motion.div variants={fadeUp} className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className={`group relative overflow-hidden rounded-xl border border-gray-800/60 ${stat.bg} p-4 text-center transition-all duration-300 hover:border-gray-700 hover:scale-[1.03]`}>
                <stat.icon className={`mx-auto mb-2 size-4 ${stat.color} transition group-hover:scale-110`} />
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-400">{stat.label}</p>
              </div>
            ))}
          </Motion.div>
        </Motion.div>

        {/* Right: Preview panel */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.94, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="relative z-10 rounded-2xl border border-gray-800/60 bg-gray-900/70 p-6 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl"
        >
          <div className="space-y-4">
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-gray-800/50 bg-gray-950/60 p-4"
            >
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Live Verification Status
              </p>
              <p className="mt-2.5 text-sm leading-relaxed text-gray-300">Every analysis produces a recruiter verdict, evidence snapshot, mismatch warning, and blockchain proof.</p>
              <p className="mt-1 text-sm text-emerald-300/90">Designed to expose fake claims, not just score resumes.</p>
            </Motion.div>

            <Motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              aria-label="Verification details"
              className="rounded-xl border border-gray-800/50 bg-gray-950/60 p-4"
            >
              <h3 className="text-sm font-semibold text-white">What this proof includes</h3>
              <ul className="mt-3 space-y-2.5 text-sm text-gray-300">
                {[
                  { color: 'bg-blue-400', text: '3-way identity check across form name, resume name, and GitHub profile' },
                  { color: 'bg-violet-400', text: 'Evidence-backed claim audit against public GitHub data' },
                  { color: 'bg-emerald-400', text: 'Immutable hash and timestamp for independent recruiter verification' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-2.5">
                    <span className={`mt-1.5 size-1.5 rounded-full ${item.color} shrink-0`} aria-hidden="true" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </Motion.section>
          </div>
        </Motion.div>
      </section>

      {/* ═══ INTERACTIVE WORKFLOW ═══ */}
      <Motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Interactive Workflow</h2>
          <p className="mt-2 text-gray-400">Step-by-step guide to using the Proof-of-Workforce platform.</p>
        </div>
        <FlowStepper currentStep={1} />
      </Motion.section>

      {/* ═══ PLATFORM CAPABILITIES ═══ */}
      <section>
        <Motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white">Platform Capabilities</h2>
          <p className="mt-2 text-gray-400">Built to make hiring decisions evidence-driven and audit-friendly.</p>
        </Motion.div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} delay={index * 0.12} />
          ))}
        </div>
      </section>

      {/* ═══ SYSTEM FLOW ═══ */}
      <Motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">System Flow</h2>
          <p className="mt-2 text-gray-400">The technical architecture that powers our autonomous trust engine.</p>
        </div>
        <SystemFlow />
      </Motion.section>

      {/* ═══ ABOUT + WHY ═══ */}
      <Motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="grid gap-5 lg:grid-cols-2"
      >
        <Motion.div variants={fadeUp}>
          <Card className="h-full">
            <h3 className="text-lg font-bold text-white">About Proof-of-Workforce</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              Proof-of-Workforce is built as a hiring trust infrastructure layer. It does not replace recruiters or ATS workflows.
              It adds a defensible verification signal, helping teams justify hiring decisions with transparent AI output and tamper-resistant proof records.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-gray-400">
              {[
                'Reduces resume inflation risk with structured assessment signals.',
                'Enables audit-friendly candidate history for leadership and compliance.',
                'Improves recruiter confidence with consistent, comparable reports.',
              ].map((text) => (
                <li key={text} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1 rounded-full bg-indigo-400 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </Card>
        </Motion.div>

        <Motion.div variants={fadeUp}>
          <Card className="h-full">
            <h3 className="text-lg font-bold text-white">Why Teams Use It</h3>
            <div className="mt-4 space-y-3">
              {[
                { role: 'For Recruiters', desc: 'Get clarity fast on who to advance and why.', color: 'border-indigo-500/20' },
                { role: 'For Hiring Managers', desc: 'See strengths and risk areas before technical interviews.', color: 'border-violet-500/20' },
                { role: 'For Operations', desc: 'Retain proof trails and verification records for decision audits.', color: 'border-emerald-500/20' },
              ].map((item) => (
                <div key={item.role} className={`group rounded-xl border ${item.color} bg-gray-950/50 p-3.5 transition-all duration-300 hover:bg-gray-900/60 hover:scale-[1.01]`}>
                  <p className="text-sm font-semibold text-white">{item.role}</p>
                  <p className="mt-1 text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </Motion.div>
      </Motion.section>
    </div>
  )
}
