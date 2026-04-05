import { Metadata } from 'next'
import { Suspense } from 'react'
import BuscarPageClient from '@/components/pages/BuscarPage'

interface Props {
  params: Promise<{ cidade: string }>
}

function decodeCidade(raw: string): string {
  return decodeURIComponent(raw)
    .replace(/-/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cidade } = await params
  const nomeCidade = decodeCidade(cidade)
  return {
    title: `Instrutores de Trânsito em ${nomeCidade} — Buscar Instrutor`,
    description: `Encontre instrutores de trânsito autônomos credenciados pelo SENATRAN em ${nomeCidade}. Compare preços, avaliações e agende aulas práticas de direção.`,
    alternates: {
      canonical: `https://buscarinstrutor.com.br/buscar/${cidade}`,
    },
  }
}

export default async function CidadePage({ params }: Props) {
  const { cidade } = await params
  const nomeCidade = decodeCidade(cidade)

  return (
    <Suspense>
      <BuscarPageClient cidadePreset={nomeCidade} />
    </Suspense>
  )
}
