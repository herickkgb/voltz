import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { Shield, Target, Heart, Zap, CheckCircle, MapPin, Star, MessageCircle, Headphones } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre a Voltz — Quem Somos e Nossa Missão',
  description:
    'Conheça a Voltz, a plataforma que conecta candidatos à CNH com instrutores autônomos de trânsito credenciados pelo SENATRAN. Saiba mais sobre nossa missão, valores e como funcionamos.',
  alternates: {
    canonical: '/sobre',
  },
}

export default function SobrePage() {
  const valores = [
    {
      icon: Shield,
      titulo: 'Segurança',
      descricao: 'Todos os instrutores passam por verificação rigorosa. Documentos, credenciais SENATRAN e veículos são validados pela nossa equipe antes de aparecerem na plataforma.',
    },
    {
      icon: Heart,
      titulo: 'Transparência',
      descricao: 'Preços claros, avaliações reais e informações completas. Acreditamos que a confiança começa com a transparência total.',
    },
    {
      icon: Target,
      titulo: 'Acessibilidade',
      descricao: 'Queremos que tirar a CNH seja mais acessível para todos. Com a concorrência entre instrutores, os preços se tornam mais justos.',
    },
    {
      icon: Zap,
      titulo: 'Praticidade',
      descricao: 'Buscar, comparar e entrar em contato com instrutores em poucos cliques. Sem burocracia, sem complicação.',
    },
  ]

  const comoFunciona = [
    {
      numero: '01',
      titulo: 'Candidato busca instrutores',
      descricao: 'O candidato acessa a Voltz e busca instrutores autônomos na sua cidade. Pode filtrar por categoria, preço e avaliações.',
    },
    {
      numero: '02',
      titulo: 'Compara perfis verificados',
      descricao: 'Cada instrutor tem um perfil completo com avaliações reais, preços, veículos, disponibilidade e selo de verificação.',
    },
    {
      numero: '03',
      titulo: 'Entra em contato direto',
      descricao: 'O candidato entra em contato diretamente com o instrutor via WhatsApp para agendar aulas e combinar detalhes.',
    },
    {
      numero: '04',
      titulo: 'Aulas e avaliação',
      descricao: 'Após as aulas, o candidato pode avaliar o instrutor na plataforma, ajudando outros candidatos a escolherem melhor.',
    },
  ]

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 md:pt-40 md:pb-20 bg-gradient-to-b from-yellow-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-[#FACC15]/15 text-amber-700 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6 border border-[#FACC15]/30">
            Sobre Nós
          </span>
          <h1 className="text-2xl md:text-5xl font-bold mb-3 md:mb-6">
            Conectamos você ao melhor{' '}
            <span className="text-[#EAB308]">instrutor autônomo</span>
          </h1>
          <p className="text-sm md:text-xl text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            A Voltz é uma plataforma de tecnologia que facilita a conexão entre candidatos à CNH
            e instrutores de trânsito autônomos credenciados pelo SENATRAN.
          </p>
        </div>
      </section>

      {/* O que somos */}
      <section className="py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl md:rounded-2xl p-5 md:p-10">
            <div className="flex items-start gap-3 md:gap-4">
              <Zap className="text-[#EAB308] flex-shrink-0 mt-1" size={24} />
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-3">O que é a Voltz?</h2>
                <div className="text-neutral-600 leading-relaxed space-y-3 text-sm md:text-base">
                  <p>
                    A Voltz é uma <strong className="text-neutral-900">plataforma de intermediação tecnológica</strong> que
                    conecta candidatos que desejam tirar ou renovar a CNH com instrutores de trânsito autônomos
                    devidamente credenciados pelo SENATRAN.
                  </p>
                  <p className="bg-white rounded-lg p-3 md:p-4 border border-amber-100 font-semibold text-neutral-900">
                    A Voltz NÃO é uma autoescola e NÃO presta serviços de formação de condutores.
                    Atuamos exclusivamente como intermediários, facilitando o contato entre as partes.
                  </p>
                  <p>
                    Toda negociação, agendamento, pagamento e prestação de serviço acontece diretamente
                    entre o candidato e o instrutor. A Voltz não se responsabiliza pela qualidade das
                    aulas nem pelas obrigações de cada parte.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-10 md:py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Nossa Missão</h2>
          <p className="text-neutral-500 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Democratizar o acesso a aulas práticas de direção, oferecendo uma plataforma segura e transparente
            onde candidatos podem encontrar instrutores verificados com os melhores preços da sua região.
            Queremos que tirar a CNH seja mais simples, acessível e confiável para todos os brasileiros.
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-12">Nossos Valores</h2>
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {valores.map((v) => (
              <div key={v.titulo} className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-[#FACC15] transition-all">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FACC15]/10 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4">
                  <v.icon className="text-[#EAB308]" size={20} />
                </div>
                <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2">{v.titulo}</h3>
                <p className="text-neutral-500 leading-relaxed text-xs md:text-sm">{v.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instrutores Verificados */}
      <section className="py-12 md:py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-xl md:text-3xl font-bold mb-3">Instrutores Verificados</h2>
            <p className="text-neutral-500 text-sm md:text-base max-w-xl mx-auto">
              Levamos a segurança a sério. Todo instrutor passa por um processo rigoroso de verificação antes de aparecer na plataforma.
            </p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-8 shadow-sm">
            <div className="space-y-4">
              {[
                { titulo: 'Verificação do SENATRAN', descricao: 'Conferimos o registro ativo do instrutor junto ao SENATRAN.' },
                { titulo: 'Análise documental', descricao: 'CNH, certificado SENATRAN e comprovante de residência são analisados pela equipe.' },
                { titulo: 'Vistoria do veículo', descricao: 'Verificamos se o veículo possui duplo comando e equipamentos obrigatórios.' },
                { titulo: 'Aprovação manual', descricao: 'Cada perfil é revisado individualmente por um administrador antes de ser publicado.' },
                { titulo: 'Monitoramento contínuo', descricao: 'Avaliações de alunos e denúncias são monitoradas. Perfis podem ser suspensos.' },
              ].map((item) => (
                <div key={item.titulo} className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-semibold text-sm md:text-base">{item.titulo}</p>
                    <p className="text-neutral-500 text-xs md:text-sm">{item.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-12">Como funciona a Voltz</h2>
          <div className="space-y-3 md:space-y-6">
            {comoFunciona.map((etapa) => (
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

      {/* Contato / Suporte */}
      <section className="py-12 md:py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Headphones className="mx-auto text-[#EAB308] mb-4" size={32} />
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Precisa de ajuda?</h2>
          <p className="text-neutral-500 text-sm md:text-lg mb-6 md:mb-8 max-w-xl mx-auto">
            Nossa equipe de suporte está disponível para ajudar candidatos e instrutores.
            Entre em contato por qualquer um dos canais abaixo.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto">
            <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-5">
              <MessageCircle className="mx-auto text-green-500 mb-2" size={24} />
              <p className="font-bold text-sm mb-1">WhatsApp</p>
              <p className="text-neutral-500 text-xs">(11) 99999-0000</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-5">
              <MapPin className="mx-auto text-blue-500 mb-2" size={24} />
              <p className="font-bold text-sm mb-1">E-mail</p>
              <p className="text-neutral-500 text-xs">contato@voltz.com.br</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-5">
              <Star className="mx-auto text-[#EAB308] mb-2" size={24} />
              <p className="font-bold text-sm mb-1">FAQ</p>
              <p className="text-neutral-500 text-xs">Perguntas frequentes</p>
            </div>
          </div>

          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 justify-center">
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
