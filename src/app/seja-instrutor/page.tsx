import type { Metadata } from 'next'
import SejaInstrutorPageClient from '@/components/pages/SejaInstrutorPage'
import { JsonLd } from '@/components/shared/JsonLd'

export const metadata: Metadata = {
  title: 'Seja Instrutor de Trânsito Autônomo — Cadastre-se',
  description:
    'Cadastre-se como instrutor de trânsito autônomo na Voltz. Receba alunos na sua região, defina seus horários e preços. Plataforma gratuita para instrutores credenciados pelo SENATRAN.',
  openGraph: {
    title: 'Seja Instrutor de Trânsito — Voltz',
    description:
      'Cadastre-se gratuitamente e comece a receber alunos na sua região. Defina seus horários e preços.',
  },
  alternates: {
    canonical: '/seja-instrutor',
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Início',
      item: 'https://voltz.com.br',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Seja Instrutor',
      item: 'https://voltz.com.br/seja-instrutor',
    },
  ],
}

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <SejaInstrutorPageClient />
    </>
  )
}
