import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { cn } from '../utils/helpers'

const steps = [
  {
    title: 'Upload Candidate',
    detail: 'Capture resume and profile metadata as structured input for analysis.',
    to: '/analyze',
  },
  {
    title: 'AI Analysis',
    detail: 'Run model-driven skill scoring, strengths, weaknesses, and summary generation.',
    to: '/analyze',
  },
  {
    title: 'Generate Proof',
    detail: 'Create an immutable hash with timestamp and verified on-chain status.',
    to: '/dashboard',
  },
  {
    title: 'Verify on Blockchain',
    detail: 'Validate trust by resolving proof hash back to candidate and report data.',
    to: '/verify',
  },
]

export function FlowStepper({ currentStep = 1 }) {
  const [focusStep, setFocusStep] = useState(currentStep)

  useEffect(() => {
    setFocusStep(currentStep)
  }, [currentStep])

  const selectedStep = steps[focusStep - 1]

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-gray-400">Interactive Workflow</p>
      <ol className="mt-3 grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const active = stepNumber === focusStep
          const done = stepNumber < currentStep

          return (
            <li key={step.title} className="relative">
              <button
                type="button"
                onMouseEnter={() => setFocusStep(stepNumber)}
                onFocus={() => setFocusStep(stepNumber)}
                onClick={() => setFocusStep(stepNumber)}
                className={cn(
                  'w-full rounded-xl border p-3 text-left transition-all duration-300 hover:scale-[1.02]',
                  active
                    ? 'border-indigo-400/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                    : 'border-gray-800 bg-gray-950/70',
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold',
                      done
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : active
                          ? 'bg-indigo-500/25 text-indigo-200'
                          : 'bg-gray-800 text-gray-400',
                    )}
                  >
                    {stepNumber}
                  </span>
                  <p className="text-sm font-medium text-gray-200">{step.title}</p>
                </div>
              </button>

              {index < steps.length - 1 ? (
                <div className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-4 bg-gray-700 md:block" />
              ) : null}

              {active ? (
                <Motion.div
                  className="pointer-events-none absolute -inset-px rounded-xl border border-indigo-400/40"
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                />
              ) : null}
            </li>
          )
        })}
      </ol>

      <Motion.div
        key={focusStep}
        className="mt-4 rounded-2xl border border-gray-800 bg-gray-950/70 p-4"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs uppercase tracking-wide text-gray-400">Flow Step {focusStep}</p>
        <p className="mt-1 text-sm font-semibold text-white">{selectedStep.title}</p>
        <p className="mt-2 text-sm text-gray-300">{selectedStep.detail}</p>
        <div className="mt-3">
          <Link
            to={selectedStep.to}
            className="inline-flex rounded-lg border border-gray-700 bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:border-indigo-400/60 hover:text-white"
          >
            Open Step
          </Link>
        </div>
      </Motion.div>
    </div>
  )
}
