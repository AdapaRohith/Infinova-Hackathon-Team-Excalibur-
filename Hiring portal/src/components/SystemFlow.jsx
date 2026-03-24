import { motion as Motion } from 'framer-motion'
import { FileText, Cpu, Github, ShieldCheck, Database, ArrowRight, ScanSearch } from 'lucide-react'

const systemNodes = [
  {
    id: 'input',
    icon: FileText,
    label: 'PDF Resume',
    sub: 'Claim Extraction',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    id: 'identity-agent',
    icon: ScanSearch,
    label: 'Identity Agent',
    sub: '3-Way Name Check',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    id: 'github-agent',
    icon: Github,
    label: 'Evidence Agent',
    sub: 'GitHub Claim Audit',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    id: 'decision-agent',
    icon: Cpu,
    label: 'Decision Agent',
    sub: 'Risk + Verdict',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/20',
  },
  {
    id: 'blockchain',
    icon: ShieldCheck,
    label: 'On-Chain Proof',
    sub: 'Tamper-Evident Hash',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    id: 'storage',
    icon: Database,
    label: 'Recruiter Console',
    sub: 'Decision Ready',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  }
]

export function SystemFlow() {
  return (
    <div className="relative rounded-2xl border border-gray-800 bg-gray-950/50 p-6 md:p-10 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
        {systemNodes.map((node, index) => (
          <div key={node.id} className="flex flex-col md:flex-row items-center flex-1 w-full md:w-auto">
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative z-10 flex flex-col items-center justify-center p-4 rounded-2xl border ${node.border} ${node.bg} backdrop-blur-sm w-full md:w-40 text-center hover:scale-105 transition-transform duration-300 shadow-lg`}
            >
              <div className={`p-2 rounded-xl bg-gray-900/80 mb-3 ${node.color}`}>
                <node.icon className="size-6" />
              </div>
              <p className="text-sm font-bold text-white mb-0.5">{node.label}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{node.sub}</p>
              
              {/* Pulse effect for active nodes */}
              <Motion.div 
                className={`absolute -inset-1 rounded-2xl border ${node.border} opacity-0`}
                animate={{ opacity: [0, 0.4, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
              />
            </Motion.div>

            {index < systemNodes.length - 1 && (
              <div className="flex items-center justify-center py-4 md:py-0 md:flex-1">
                <Motion.div
                  initial={{ width: 0, opacity: 0 }}
                  whileInView={{ width: "100%", opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  className="relative h-px bg-linear-to-r from-gray-800 via-indigo-500/40 to-gray-800 w-full flex items-center justify-center"
                >
                   <Motion.div 
                    animate={{ x: [-20, 20], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute size-1.5 rounded-full bg-indigo-400 blur-[2px]"
                   />
                   <ArrowRight className="size-3 text-gray-600 absolute md:relative" />
                </Motion.div>
                <div className="md:hidden">
                    <Motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      whileInView={{ height: 32, opacity: 1 }}
                      className="w-px bg-gray-800"
                    />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Connection Info Tags */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Data Ingest</p>
          <p className="text-[11px] text-gray-300">pdfjs-dist coordinate parser</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Agentic Layer</p>
          <p className="text-[11px] text-gray-300">Resume, identity, evidence, decision agents</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Evidence</p>
          <p className="text-[11px] text-gray-300">Resume parsing + GitHub API + mismatch checks</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-gray-900/40 border border-gray-800/50">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Trust Model</p>
          <p className="text-[11px] text-gray-300">Tamper-evident decision report anchored on-chain</p>
        </div>
      </div>
    </div>
  )
}
