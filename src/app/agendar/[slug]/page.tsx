import { Metadata } from 'next'
import { getInstrutorBySlug } from '@/lib/db'
import AgendarPageClient from '@/components/pages/AgendarPage'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const instrutor = await getInstrutorBySlug(slug)
  if (!instrutor) return { title: 'Instrutor não encontrado' }
  return {
    title: `Agendar aula com ${instrutor.nome}`,
    description: `Agende uma aula prática de direção com ${instrutor.nome} em ${instrutor.localizacao.cidade}/${instrutor.localizacao.estado}.`,
  }
}

export default async function AgendarPage({ params }: Props) {
  const { slug } = await params
  const instrutor = await getInstrutorBySlug(slug)
  if (!instrutor) notFound()
  return <AgendarPageClient instrutor={instrutor} />
}
