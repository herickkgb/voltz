import type { Metadata } from 'next'
import HomePage from '@/components/pages/HomePage'
import { JsonLd } from '@/components/shared/JsonLd'

export const metadata: Metadata = {
  title: 'Voltz — Encontre Instrutores de Trânsito Autônomos Credenciados',
  description:
    'Encontre instrutores de trânsito autônomos credenciados pelo SENATRAN perto de você. Compare preços, avaliações e agende aulas práticas de direção. Tire sua habilitação mais rápido e mais barato com a nova lei CNH.',
  alternates: {
    canonical: '/',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Voltz',
  url: 'https://voltz.com.br',
  logo: 'https://voltz.com.br/logo.png',
  description:
    'Plataforma que conecta candidatos a instrutores de trânsito autônomos credenciados pelo SENATRAN.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+55-11-99999-0000',
    contactType: 'customer service',
    areaServed: 'BR',
    availableLanguage: 'Portuguese',
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Voltz',
  url: 'https://voltz.com.br',
  description:
    'Encontre instrutores de trânsito autônomos credenciados pelo SENATRAN.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://voltz.com.br/buscar?cidade={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'O que é a nova lei do instrutor autônomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A nova legislação permite que instrutores credenciados pelo SENATRAN ofereçam aulas práticas de forma independente, sem vínculo obrigatório com autoescolas. Isso aumenta a concorrência e reduz custos para o candidato.',
      },
    },
    {
      '@type': 'Question',
      name: 'É seguro contratar um instrutor pela Voltz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim! Todos os instrutores na plataforma são verificados com registro SENATRAN válido. Além disso, você pode conferir avaliações reais de outros alunos antes de contratar.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quanto custa uma aula prática de direção?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Os preços variam de R$ 60 a R$ 150 por hora, dependendo da experiência do instrutor, região e tipo de veículo. Compare preços diretamente na plataforma Voltz.',
      },
    },
    {
      '@type': 'Question',
      name: 'Posso usar meu próprio veículo nas aulas práticas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende do instrutor. Muitos aceitam que o candidato use seu próprio veículo, desde que atenda aos requisitos legais (duplo comando, etc.). Filtre por essa opção na busca da Voltz.',
      },
    },
    {
      '@type': 'Question',
      name: 'A Voltz é uma autoescola?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Não. A Voltz é uma plataforma de conexão. Facilitamos o encontro entre candidatos e instrutores autônomos credenciados. Todo o processo de habilitação segue as regras do DETRAN.',
      },
    },
  ],
}

export default function Page() {
  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={faqJsonLd} />
      <HomePage />
    </>
  )
}
