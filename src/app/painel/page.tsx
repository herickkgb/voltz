import type { Metadata } from 'next'
import PainelInstrutorPageClient from '@/components/pages/PainelInstrutorPage'

export const metadata: Metadata = {
  title: 'Painel do Instrutor',
  description: 'Gerencie seu perfil de instrutor, acompanhe estatísticas e contatos de alunos.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <PainelInstrutorPageClient />
}
