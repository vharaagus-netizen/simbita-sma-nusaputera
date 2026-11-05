import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SIMBITA — SMA Nusaputera Semarang',
    short_name: 'SIMBITA',
    description: 'Sistem Informasi Bimbingan Tugas Akhir & Karya Tulis Ilmiah SMA Nusaputera Semarang',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}

