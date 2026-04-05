import { Suspense } from 'react'
import { Metadata } from 'next'
import CompararPageClient from '@/components/pages/CompararPage'

export const metadata: Metadata = {
  title: 'Comparar Instrutores',
  description: 'Compare instrutores de trânsito lado a lado. Preços, avaliações, categorias e muito mais.',
}

export default function CompararPage() {
  return (
    <Suspense>
      <CompararPageClient />
    </Suspense>
  )
}
