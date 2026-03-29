import type { Metadata } from 'next'
import { Suspense } from 'react'
import BuscarPageClient from '@/components/pages/BuscarPage'

export const metadata: Metadata = {
  title: 'Buscar Instrutores de Trânsito Autônomos',
  description:
    'Pesquise e compare instrutores de trânsito autônomos credenciados na sua cidade. Filtre por categoria (A, B, C, D, E), preço, experiência, avaliações e agende sua aula prática de direção.',
  openGraph: {
    title: 'Buscar Instrutores de Trânsito — Voltz',
    description:
      'Encontre instrutores de direção autônomos credenciados perto de você. Compare preços e avaliações.',
  },
  alternates: {
    canonical: '/buscar',
  },
}

export default function Page() {
  return (
    <Suspense>
      <BuscarPageClient />
    </Suspense>
  )
}
