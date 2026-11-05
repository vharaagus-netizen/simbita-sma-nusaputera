'use client'

import { useState } from 'react'
import { MessageCircle, Copy, Check, ExternalLink, X } from 'lucide-react'

interface WhatsAppButtonProps {
  mentorName?: string | null
  mentorPhone?: string | null
  studentName?: string | null
  studentIdentifier?: string | null
  thesisTitle?: string | null
}

export default function WhatsAppButton({
  mentorName = 'Guru Pembimbing',
  mentorPhone = '',
  studentName = 'Siswa',
  studentIdentifier = 'SIS-XXXX',
  thesisTitle = 'Tugas Akhir',
}: WhatsAppButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [customPhone, setCustomPhone] = useState(mentorPhone || '')
  const [copied, setCopied] = useState(false)

  // Template pesan sopan & formal akademik sekolah
  const messageTemplate = `Assalamu'alaikum / Selamat pagi/siang Bapak/Ibu ${mentorName || 'Pembimbing'},

Mohon izin Bapak/Ibu, saya ${studentName} (${studentIdentifier}) dari kelompok bimbingan tugas akhir dengan judul:
"${thesisTitle}"

Bermaksud memohon arahan konsultasi dan bimbingan terkait naskah tugas akhir di portal SIMBITA. Jika Bapak/Ibu berkenan, kapankah kami dapat berkonsultasi tatap muka di sekolah?

Terima kasih banyak atas waktu dan bimbingan Bapak/Ibu.`

  // Format nomor HP agar standar internasional 62
  function formatPhoneNumber(num: string) {
    let clean = num.replace(/\D/g, '')
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1)
    }
    return clean
  }

  function handleOpenWhatsApp(targetNum: string) {
    const formatted = formatPhoneNumber(targetNum)
    if (!formatted) {
      alert('Silakan masukkan nomor WhatsApp guru pembimbing.')
      return
    }
    const encoded = encodeURIComponent(messageTemplate)
    const url = `https://wa.me/${formatted}?text=${encoded}`
    window.open(url, '_blank')
    setModalOpen(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(messageTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (mentorPhone) {
            handleOpenWhatsApp(mentorPhone)
          } else {
            setModalOpen(true)
          }
        }}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs seamless-btn cursor-pointer"
        title="Hubungi Guru Pembimbing dengan template pesan sopan via WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
        <span>Hubungi Pembimbing (WA)</span>
      </button>

      {/* MODAL TEMPLATE PESAN WA */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Template Pesan WhatsApp Sopan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gunakan kalimat formal di bawah ini untuk menghubungi <strong>{mentorName}</strong> via WhatsApp:
            </p>

            {/* PREVIEW PESAN */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto font-sans">
              {messageTemplate}
            </div>

            {/* INPUT NOMOR JIKA BELUM ADA DI DATABASE */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp Guru Pembimbing:
              </label>
              <input
                type="tel"
                placeholder="Contoh: 08123456789 atau 628123456789"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors seamless-btn"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Pesan</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleOpenWhatsApp(customPhone)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors seamless-btn shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka WhatsApp Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

