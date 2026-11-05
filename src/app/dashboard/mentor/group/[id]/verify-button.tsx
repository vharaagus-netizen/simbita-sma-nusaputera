'use client'

import { useState } from 'react'
import { verifyGuidanceJournal } from './actions'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

export default function VerifyJournalButton({
  journalId,
  groupId,
  isVerified,
}: {
  journalId: string
  groupId: string
  isVerified: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(isVerified)

  async function handleVerify() {
    setLoading(true)
    const formData = new FormData()
    formData.set('journal_id', journalId)
    formData.set('group_id', groupId)

    const result = await verifyGuidanceJournal(formData)
    setLoading(false)

    if (result?.success) {
      setVerified(true)
    }
  }

  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 animate-fade-in">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Tervalidasi / Diparaf</span>
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={handleVerify}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-60 seamless-btn"
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>{loading ? 'Memvalidasi...' : 'Berikan Paraf Digital'}</span>
    </button>
  )
}
