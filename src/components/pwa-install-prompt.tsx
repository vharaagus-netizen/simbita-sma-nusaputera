'use client'

import React, { useEffect, useState } from 'react'
import { Download, X, Share, Smartphone, PlusSquare } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)

  useEffect(() => {
    // 1. Cek apakah aplikasi sudah berjalan dalam mode standalone (sudah ter-install)
    const isAppStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    if (isAppStandalone) {
      setIsStandalone(true)
      return
    }

    // 2. Cek apakah pengguna sudah menutup prompt dalam sesi ini
    const dismissed = sessionStorage.getItem('pwa_prompt_dismissed')
    if (dismissed) return

    // 3. Deteksi platform iOS (iPhone/iPad di Safari)
    const ua = window.navigator.userAgent.toLowerCase()
    const isAppleDevice = /iphone|ipad|ipod/.test(ua)
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua)

    if (isAppleDevice && isSafari) {
      setIsIOS(true)
      // Tampilkan banner setelah jeda 3 detik agar ramah pengguna
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }

    // 4. Tangkap event beforeinstallprompt (Android / Chrome / Edge Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  async function handleInstallClick() {
    if (isIOS) {
      setShowIOSModal(true)
      return
    }

    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
      setDeferredPrompt(null)
    }
  }

  function handleDismiss() {
    setShowPrompt(false)
    sessionStorage.setItem('pwa_prompt_dismissed', 'true')
  }

  if (isStandalone || !showPrompt) return null

  return (
    <>
      {/* FLOATING PROMPT BANNER */}
      <aside aria-label="Instalasi Aplikasi SIMBITA" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slide-up">
        <div className="bg-[#FFF0F6]/95 dark:bg-[#1E1B24]/95 backdrop-blur-md border border-pink-200/90 dark:border-[#2E2838] p-4 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-nusaputera.png"
                alt="Logo SIMBITA"
                className="w-10 h-10 object-contain rounded-xl bg-white dark:bg-[#0F0F12] p-1 border border-pink-200/60 dark:border-[#2E2838] shrink-0"
              />
              <div>
                <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Pasang Aplikasi SIMBITA
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Akses bimbingan lebih cepat langsung dari layar utama perangkat Anda.
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              aria-label="Tutup pemberitahuan"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-white/50 dark:hover:bg-[#15131C] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] text-white dark:text-[#0F0F12] text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIOS ? 'Petunjuk Pasang di iPhone' : 'Install Aplikasi'}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 rounded-xl border border-pink-200 dark:border-[#2E2838] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-pink-100/50 dark:hover:bg-[#15131C] transition-colors cursor-pointer"
            >
              Nanti
            </button>
          </div>
        </div>
      </aside>

      {/* MODAL PETUNJUK KHUSUS IPHONE / IPAD */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFF0F6] dark:bg-[#1E1B24] border border-pink-200/90 dark:border-[#2E2838] w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-pink-200/60 dark:border-[#2E2838]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#E11D48] dark:text-[#FF80AB]" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Pasang di iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Buka website SIMBITA menggunakan browser <strong>Safari</strong> di iPhone Anda.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="flex items-center gap-1.5 flex-wrap">
                  Ketuk tombol <strong>Bagikan (Share)</strong>
                  <Share className="w-3.5 h-3.5 text-[#E11D48] dark:text-[#FF80AB] inline" />
                  di bilah bawah layar Safari.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-100 dark:bg-[#2D2235] text-[#E11D48] dark:text-[#FF80AB] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p className="flex items-center gap-1.5 flex-wrap">
                  Gulir ke bawah dan pilih <strong>Tambahkan ke Layar Utama</strong>
                  <PlusSquare className="w-3.5 h-3.5 text-[#E11D48] dark:text-[#FF80AB] inline" />
                  (<em>Add to Home Screen</em>).
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSModal(false)
                handleDismiss()
              }}
              className="w-full py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] dark:bg-[#F472B6] dark:hover:bg-[#FF80AB] text-white dark:text-[#0F0F12] text-xs font-bold transition-colors cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  )
}
