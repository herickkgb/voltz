import type { Metadata } from 'next'
import LoginPageClient from '@/components/pages/LoginPage'

export const metadata: Metadata = {
  title: 'Entrar — Área do Instrutor',
  description: 'Acesse sua conta de instrutor na Buscar Instrutor. Gerencie seu perfil, acompanhe contatos de alunos e atualize suas informações.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <LoginPageClient />
}
