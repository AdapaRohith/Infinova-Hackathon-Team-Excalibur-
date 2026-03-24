import { motion as Motion } from 'framer-motion'
import { Card } from './ui/Card'

export function FeatureCard({ icon, title, description, gradient, delay = 0 }) {
  const IconComponent = icon

  return (
    <Motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-500/10">
        {/* Gradient background on hover */}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient || 'from-indigo-500/10 to-violet-500/10'} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

        <div className="relative z-10">
          <div className="mb-4 inline-flex rounded-xl bg-gray-800/50 p-2.5 transition-colors duration-300 group-hover:bg-indigo-500/15">
            <IconComponent className="size-5 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
          <p className="text-sm leading-relaxed text-gray-400 transition-colors group-hover:text-gray-300">{description}</p>
        </div>
      </Card>
    </Motion.div>
  )
}
