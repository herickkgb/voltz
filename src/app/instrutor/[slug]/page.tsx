import type { Metadata } from 'next'
import InstrutorPageClient from '@/components/pages/InstrutorPage'
import { JsonLd } from '@/components/shared/JsonLd'
import { getInstrutorBySlug, getMediaAvaliacao } from '@/lib/db'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const instrutor = await getInstrutorBySlug(params.slug)

  if (!instrutor || instrutor.status !== 'aprovado') {
    return {
      title: 'Instrutor não encontrado',
      description: 'Este perfil de instrutor não existe ou foi removido.',
    }
  }

  const media = getMediaAvaliacao(instrutor.avaliacoes)
  const cidade = instrutor.localizacao.cidade
  const estado = instrutor.localizacao.estado

  return {
    title: `${instrutor.nome} — Instrutor de Trânsito em ${cidade}`,
    description: `${instrutor.nome} é instrutor de trânsito autônomo credenciado em ${cidade}-${estado}. ${instrutor.anos_experiencia} anos de experiência, ${instrutor.alunos_formados} alunos formados. Avaliação ${media.toFixed(1)}/5. Categoria${instrutor.categorias.length > 1 ? 's' : ''} ${instrutor.categorias.join(', ')}. R$ ${instrutor.preco_hora}/hora.`,
    openGraph: {
      title: `${instrutor.nome} — Instrutor de Trânsito | Voltz`,
      description: `Instrutor autônomo em ${cidade}. ${instrutor.anos_experiencia} anos de experiência. A partir de R$ ${instrutor.preco_hora}/hora.`,
      images: [{ url: instrutor.foto_url, alt: instrutor.nome }],
    },
    alternates: {
      canonical: `/instrutor/${instrutor.slug}`,
    },
  }
}

export default async function Page({ params }: Props) {
  const instrutor = await getInstrutorBySlug(params.slug)

  if (!instrutor || instrutor.status !== 'aprovado') {
    return <InstrutorPageClient />
  }

  const media = getMediaAvaliacao(instrutor.avaliacoes)

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: instrutor.nome,
    description: instrutor.descricao,
    image: instrutor.foto_url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: instrutor.localizacao.cidade,
      addressRegion: instrutor.localizacao.estado,
      addressCountry: 'BR',
      postalCode: instrutor.localizacao.cep,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: instrutor.localizacao.lat,
      longitude: instrutor.localizacao.lng,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: media.toFixed(1),
      reviewCount: instrutor.avaliacoes.length,
      bestRating: 5,
      worstRating: 1,
    },
    priceRange: `R$ ${instrutor.preco_hora}/hora`,
    telephone: instrutor.telefone,
    url: `https://voltz.com.br/instrutor/${instrutor.slug}`,
  }

  return (
    <>
      <JsonLd data={personJsonLd} />
      <InstrutorPageClient />
    </>
  )
}
