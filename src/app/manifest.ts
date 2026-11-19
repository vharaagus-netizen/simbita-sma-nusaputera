import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SIMBITA — SMA Nusaputera Semarang',
    short_name: 'SIMBITA',
    description:
      'Sistem Informasi Bimbingan Tugas Akhir & Karya Tulis Ilmiah SMA Nusaputera Semarang',
    start_url: '/',
    id: '/',
    display: 'standalone',
    display_override: ['standalone', 'window-controls-overlay'],
    orientation: 'portrait',
    background_color: '#FFFFFF',
    theme_color: '#E11D48',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo-nusaputera.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
