import { motion as Motion } from 'framer-motion'
import { CheckCircle2, ShieldAlert, XCircle } from 'lucide-react'
import { Card } from './ui/Card'

export function VerificationResultBanner({ status = 'idle' }) {
  if (status === 'idle') return null

  const config =
    status === 'verified'
      ? {
          title: 'VERIFIED ON-CHAIN',
          message: 'This hiring report still matches the attestation stored on the blockchain',
          icon: <CheckCircle2 className="size-8 text-emerald-300" />,
          classes: 'border-emerald-500/40 bg-emerald-500/10 shadow-emerald-500/20',
          titleClass: 'text-4xl font-extrabold tracking-wide text-emerald-300',
          messageClass: 'text-emerald-100/90',
        }
      : status === 'pending'
        ? {
            title: 'VERIFYING ATTESTATION',
            message: 'Checking this report hash against the blockchain record',
            icon: <ShieldAlert className="size-8 animate-pulse text-amber-200" />,
            classes: 'border-amber-500/40 bg-amber-500/10 shadow-amber-500/10',
            titleClass: 'text-3xl font-bold tracking-wide text-amber-200',
            messageClass: 'text-amber-100/90',
          }
        : {
            title: 'TAMPERED',
            message: 'This report no longer matches the original blockchain attestation',
            icon: <XCircle className="size-8 text-red-300" />,
            classes: 'border-red-500/40 bg-red-500/10 shadow-red-500/20',
            titleClass: 'text-4xl font-extrabold tracking-wide text-red-300',
            messageClass: 'text-red-100/90',
          }

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-3xl"
    >
      <Card className={`rounded-2xl border p-8 text-center shadow-lg ${config.classes}`}>
        <div className="flex justify-center">{config.icon}</div>
        <p className={`mt-3 ${config.titleClass}`}>{config.title}</p>
        <p className={`mx-auto mt-2 max-w-xl text-base ${config.messageClass}`}>{config.message}</p>
      </Card>
    </Motion.div>
  )
}
