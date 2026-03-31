import type { Metadata } from 'next'
import AdminPageClient from '@/components/pages/AdminPage'

export const metadata: Metadata = {
  title: 'Administração',
  description: 'Painel administrativo da plataforma Buscar Instrutor.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AdminPageClient />
}
