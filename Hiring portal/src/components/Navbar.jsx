import { Link, NavLink } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/analyze', label: 'Analyze' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/verify', label: 'Verify' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <Motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="size-6 text-white" />
          </div>
          <div>
            <Link to="/" className="text-lg font-bold tracking-tight text-white md:text-xl">
              Proof-of-Workforce
            </Link>
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Agentic Trust Layer</p>
            </div>
          </div>
        </Motion.div>

        <nav className="hidden items-center gap-2 rounded-2xl border border-gray-800 bg-gray-900/40 p-1.5 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <Motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 z-0 rounded-xl bg-gray-800 shadow-inner"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {/* Hover effect highlight */}
                  <div className="absolute inset-0 z-0 rounded-xl bg-white/0 transition-colors duration-300 hover:bg-white/5" />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Mini-Nav indicator */}
        <div className="flex items-center gap-3 md:hidden">
           <Link to="/analyze" className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
             Start Analysis
           </Link>
        </div>
      </div>
    </header>
  )
}
