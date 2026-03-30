import { AvaliarInstrutorPageClient } from '@/components/pages/AvaliarInstrutorPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Avaliar Instrutor — Voltz',
  description: 'Deixe sua avaliação pública sobre o seu instrutor.',
}

export default function AvaliarInstrutorPage({ params }: { params: { token: string } }) {
  return <AvaliarInstrutorPageClient token={params.token} />
}
