import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { JsonLd } from '@/components/shared/JsonLd'
import Link from 'next/link'
import { Shield, CheckCircle, Users, DollarSign, Clock, FileText, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Nova Lei do Instrutor Autônomo de Trânsito — CNH',
  description:
    'Entenda a nova lei que permite instrutores de trânsito autônomos no Brasil. Saiba como funciona, benefícios para o candidato, requisitos do instrutor e como tirar CNH mais barato com instrutor particular credenciado pelo SENATRAN.',
  openGraph: {
    title: 'Nova Lei do Instrutor Autônomo — Voltz',
    description:
      'A lei brasileira agora permite instrutores autônomos de trânsito. Entenda como isso reduz custos e melhora sua experiência ao tirar a CNH.',
  },
  alternates: {
    canonical: '/nova-lei',
  },
}

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Nova Lei do Instrutor Autônomo de Trânsito no Brasil',
  description:
    'Entenda como a nova regulamentação permite que instrutores de trânsito atuem de forma independente e como isso beneficia quem quer tirar a CNH.',
  author: { '@type': 'Organization', name: 'Voltz' },
  publisher: { '@type': 'Organization', name: 'Voltz' },
  mainEntityOfPage: 'https://voltz.com.br/nova-lei',
}

export default function NovaLeiPage() {
  const beneficios = [
    {
      icon: DollarSign,
      titulo: 'Preços mais acessíveis',
      descricao: 'Sem intermediários de autoescola, o custo da aula prática pode cair significativamente.',
    },
    {
      icon: Clock,
      titulo: 'Flexibilidade de horários',
      descricao: 'Agende aulas nos horários que funcionam para você, direto com o instrutor.',
    },
    {
      icon: Users,
      titulo: 'Escolha seu instrutor',
      descricao: 'Compare perfis, avaliações e preços antes de decidir com quem aprender.',
    },
    {
      icon: Shield,
      titulo: 'Segurança garantida',
      descricao: 'Instrutores credenciados pelo SENATRAN com veículos regulamentados.',
    },
  ]

  const etapas = [
    {
      numero: '01',
      titulo: 'Matrícula no CFC',
      descricao: 'O candidato continua fazendo matrícula em um Centro de Formação de Condutores (autoescola) para a parte teórica e exames.',
    },
    {
      numero: '02',
      titulo: 'Escolha do instrutor',
      descricao: 'Para as aulas práticas, o candidato pode optar por um instrutor autônomo credenciado pelo SENATRAN, em vez de usar o instrutor da autoescola.',
    },
    {
      numero: '03',
      titulo: 'Aulas práticas',
      descricao: 'As aulas são realizadas em veículos com duplo comando, seguindo o mesmo currículo obrigatório.',
    },
    {
      numero: '04',
      titulo: 'Exame prático',
      descricao: 'O candidato realiza o exame prático normalmente pelo DETRAN, como no processo tradicional.',
    },
  ]

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <JsonLd data={articleJsonLd} />
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 md:pt-40 md:pb-24 bg-gradient-to-b from-yellow-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-[#FACC15]/15 text-amber-700 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6 border border-[#FACC15]/30">
            Legislação
          </span>
          <h1 className="text-2xl md:text-5xl font-bold mb-3 md:mb-6">
            Nova Lei do{' '}
            <span className="text-[#EAB308]">Instrutor Autônomo</span>
          </h1>
          <p className="text-sm md:text-xl text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            Entenda como a nova regulamentação permite que instrutores de trânsito atuem de forma
            independente e como isso beneficia quem quer tirar a CNH.
          </p>
        </div>
      </section>

      {/* O que mudou */}
      <section className="py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-12 shadow-sm">
            <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
              <FileText className="text-[#EAB308] flex-shrink-0 mt-0.5" size={22} />
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">O que mudou?</h2>
                <div className="text-neutral-500 leading-relaxed space-y-3 md:space-y-4 text-sm md:text-base">
                  <p>
                    A nova legislação brasileira regulamenta a figura do <strong className="text-neutral-900">instrutor autônomo de trânsito</strong>.
                    Antes, o candidato à CNH era obrigado a realizar as aulas práticas exclusivamente com instrutores vinculados
                    a Centros de Formação de Condutores (CFCs/autoescolas).
                  </p>
                  <p>
                    Com a mudança, profissionais credenciados pelo SENATRAN podem oferecer aulas práticas de forma independente,
                    dando ao candidato o <strong className="text-neutral-900">direito de escolher</strong> com quem deseja aprender a dirigir.
                  </p>
                  <p>
                    Isso promove maior concorrência, melhora a qualidade do serviço e pode reduzir significativamente
                    o custo total da habilitação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-12 md:py-20 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-12">Benefícios para o candidato</h2>
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {beneficios.map((b) => (
              <div key={b.titulo} className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-[#FACC15] hover:shadow-lg hover:shadow-yellow-400/10 transition-all">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FACC15]/10 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4">
                  <b.icon className="text-[#EAB308]" size={20} />
                </div>
                <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2">{b.titulo}</h3>
                <p className="text-neutral-500 leading-relaxed text-xs md:text-sm">{b.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona agora */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-12">Como funciona o processo agora</h2>
          <div className="space-y-3 md:space-y-6">
            {etapas.map((etapa) => (
              <div key={etapa.numero} className="flex gap-3 md:gap-6 items-start bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
                <span className="text-xl md:text-3xl font-bold text-[#FACC15] flex-shrink-0">{etapa.numero}</span>
                <div>
                  <h3 className="text-sm md:text-lg font-bold mb-0.5 md:mb-1">{etapa.titulo}</h3>
                  <p className="text-neutral-500 text-xs md:text-sm leading-relaxed">{etapa.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requisitos */}
      <section className="py-12 md:py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-12">Requisitos para o instrutor autônomo</h2>
          <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-8 shadow-sm">
            <ul className="space-y-3 md:space-y-4">
              {[
                'Registro ativo no SENATRAN como instrutor de trânsito',
                'Veículo adaptado com duplo comando e demais equipamentos obrigatórios',
                'Certificação e reciclagem em dia conforme normas do CONTRAN',
                'Seguro obrigatório e documentação do veículo regularizada',
                'Cadastro na plataforma do DETRAN estadual como instrutor autônomo',
              ].map((req) => (
                <li key={req} className="flex items-start gap-2 md:gap-3">
                  <CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-neutral-600 text-xs md:text-sm leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Lei Oficial */}
      <section className="py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl md:rounded-2xl p-5 md:p-8">
            <div className="flex items-start gap-3 md:gap-4">
              <FileText className="text-blue-600 flex-shrink-0 mt-0.5" size={22} />
              <div>
                <h2 className="text-lg md:text-xl font-bold text-blue-900 mb-2">Leia a lei oficial completa</h2>
                <p className="text-blue-800/70 text-xs md:text-sm leading-relaxed mb-4">
                  Para conhecer todos os detalhes da regulamentação, consulte o texto oficial
                  da lei publicada no Diário Oficial da União pelo Governo Federal.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <a
                    href="https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/L14723.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 md:px-5 md:py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-blue-700 transition-all"
                  >
                    <ExternalLink size={14} />
                    Lei nº 14.723/2024 — Planalto
                  </a>
                  <a
                    href="https://www.gov.br/senatran/pt-br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 border-2 border-blue-300 text-blue-700 px-4 py-2.5 md:px-5 md:py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-blue-100 transition-all"
                  >
                    <ExternalLink size={14} />
                    Portal do SENATRAN
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Comece agora</h2>
          <p className="text-neutral-500 text-sm md:text-lg mb-6 md:mb-8 max-w-xl mx-auto">
            Aproveite a nova lei e encontre o melhor instrutor autônomo da sua região.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link href="/buscar" className="bg-[#FACC15] text-neutral-900 px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-sm md:text-lg shadow-lg shadow-yellow-400/20 hover:bg-[#EAB308] hover:-translate-y-0.5 transition-all duration-200">
              Buscar Instrutores
            </Link>
            <Link href="/seja-instrutor" className="border-2 border-neutral-900 text-neutral-900 px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-sm md:text-lg hover:bg-neutral-900 hover:text-white transition-all duration-200">
              Seja Instrutor
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
