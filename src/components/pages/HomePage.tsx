'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StarRating } from '@/components/shared/StarRating'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { getInstrutoresAprovados, getMediaAvaliacao, getEstatisticasGlobais } from '@/lib/db'
import type { CidadeComContagem } from '@/lib/db'
import type { Instrutor } from '@/types'
import { Search, MapPin, Shield, Zap, ChevronDown, ChevronUp, Award, Users } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
}

export default function HomePage() {
  const [cidadeBusca, setCidadeBusca] = useState('')
  const [faqAberto, setFaqAberto] = useState<number | null>(null)
  const [instrutoresDestaque, setInstrutoresDestaque] = useState<Instrutor[]>([])

  const [estatisticas, setEstatisticas] = useState({ instrutores: 0, alunos: 0, media: '0', cidades: 0, listaCidades: [] as CidadeComContagem[] })
  const [regiaoUsuario, setRegiaoUsuario] = useState('')
  const [, setBuscandoLocal] = useState(true)
  const [showSugestoes, setShowSugestoes] = useState(false)

  const sugestoesFiltradas = cidadeBusca.length >= 2
    ? estatisticas.listaCidades.filter(c =>
        c.label.toLowerCase().includes(cidadeBusca.toLowerCase()) ||
        c.cidade.toLowerCase().includes(cidadeBusca.toLowerCase())
      ).slice(0, 8)
    : []

  const cidadeSemResultado = cidadeBusca.length >= 3 && sugestoesFiltradas.length === 0

  useEffect(() => {
    getEstatisticasGlobais().then(setEstatisticas)

    // Pegar localização
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
          const data = await res.json()
          const city = data.address.city || data.address.town || data.address.village
          if (city) {
            setRegiaoUsuario(city)
            setCidadeBusca(city)
          }
        } catch {}
        setBuscandoLocal(false)
      }, () => {
        setBuscandoLocal(false)
      })
    } else {
      setBuscandoLocal(false)
    }
  }, [])

  useEffect(() => {
    getInstrutoresAprovados().then(lista => {
      if (regiaoUsuario) {
        const perto = lista.filter(i => i.localizacao.cidade.toLowerCase() === regiaoUsuario.toLowerCase())
        if (perto.length > 0) {
          setInstrutoresDestaque(perto.slice(0, 4))
          return
        }
      }
      setInstrutoresDestaque(lista.slice(0, 4))
    })
  }, [regiaoUsuario])


  const etapas = [
    { icon: Search, titulo: 'Busque', descricao: 'Pesquise instrutores autônomos credenciados na sua cidade.' },
    { icon: Award, titulo: 'Compare', descricao: 'Veja avaliações, preços e disponibilidade de cada instrutor.' },
    { icon: Zap, titulo: 'Conecte-se', descricao: 'Entre em contato direto via WhatsApp e agende sua aula.' },
  ]

  
  const stats = [
    { valor: `${estatisticas.instrutores}`, label: 'Instrutores Credenciados' },
    { valor: `${estatisticas.alunos.toLocaleString('pt-BR')}`, label: 'Alunos Formados' },
    { valor: `${estatisticas.media}`, label: 'Avaliação Média' },
    { valor: `${estatisticas.cidades}`, label: 'Cidades Atendidas' },
  ]


  const faqs = [
    {
      pergunta: 'O que é a nova lei do instrutor autônomo?',
      resposta: 'A nova legislação permite que instrutores credenciados pelo SENATRAN ofereçam aulas práticas de forma independente, sem vínculo obrigatório com autoescolas. Isso aumenta a concorrência e reduz custos para o candidato.',
    },
    {
      pergunta: 'É seguro contratar um instrutor pela Buscar Instrutor?',
      resposta: 'Sim! Todos os instrutores na plataforma são verificados com registro SENATRAN válido. Além disso, você pode conferir avaliações reais de outros alunos antes de contratar.',
    },
    {
      pergunta: 'Quanto custa uma aula prática?',
      resposta: 'Os preços variam de R$ 60 a R$ 150 por hora, dependendo da experiência do instrutor, região e tipo de veículo. Compare preços diretamente na plataforma.',
    },
    {
      pergunta: 'Posso usar meu próprio veículo?',
      resposta: 'Depende do instrutor. Muitos aceitam que o candidato use seu próprio veículo, desde que atenda aos requisitos legais (duplo comando, etc.). Filtre por essa opção na busca.',
    },
    {
      pergunta: 'A Buscar Instrutor é uma autoescola?',
      resposta: 'Não. A Buscar Instrutor é uma plataforma de conexão. Facilitamos o encontro entre candidatos e instrutores autônomos credenciados. Todo o processo de habilitação segue as regras do DETRAN.',
    },
  ]

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-12 md:pt-44 md:pb-32 overflow-hidden bg-gradient-to-b from-yellow-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block bg-[#FACC15]/15 text-amber-700 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6 border border-[#FACC15]/30">
              Nova Lei CNH em vigor
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 text-neutral-900">
              Acelere sua{' '}
              <span className="text-[#EAB308]">Habilitação</span>
            </h1>
            <p className="text-base md:text-xl text-neutral-500 mb-6 md:mb-10 leading-relaxed px-2">
              Encontre instrutores autônomos credenciados perto de você.
              Com a nova lei, tire sua CNH mais rápido e mais barato.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 z-10" size={18} />
                <input
                  type="text"
                  placeholder="Digite sua cidade..."
                  value={cidadeBusca}
                  onChange={(e) => { setCidadeBusca(e.target.value); setShowSugestoes(true) }}
                  onFocus={() => setShowSugestoes(true)}
                  onBlur={() => setTimeout(() => setShowSugestoes(false), 200)}
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-11 pr-4 py-3 md:py-4 text-sm md:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 transition-all shadow-sm"
                />

                {/* Dropdown de sugestões */}
                {showSugestoes && cidadeBusca.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                    {sugestoesFiltradas.length > 0 ? (
                      sugestoesFiltradas.map((c) => (
                        <button
                          key={c.label}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setCidadeBusca(c.cidade)
                            setShowSugestoes(false)
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-yellow-50 transition-colors text-left border-b border-neutral-100 last:border-0"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin size={14} className="text-neutral-300 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium text-neutral-900">{c.cidade}</span>
                              {c.estado && <span className="text-sm text-neutral-400"> - {c.estado}</span>}
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                            <Users size={10} />
                            {c.instrutores} {c.instrutores === 1 ? 'instrutor' : 'instrutores'}
                          </span>
                        </button>
                      ))
                    ) : cidadeSemResultado ? (
                      <div className="px-4 py-4 text-center">
                        <p className="text-sm text-neutral-500">Nenhum instrutor encontrado em</p>
                        <p className="text-sm font-semibold text-neutral-700">&quot;{cidadeBusca}&quot;</p>
                        <p className="text-xs text-neutral-400 mt-1">Tente outra cidade ou verifique a ortografia</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              <Link
                href={`/buscar${cidadeBusca ? `?cidade=${encodeURIComponent(cidadeBusca)}` : ''}`}
                className="bg-[#FACC15] text-neutral-900 px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-yellow-400/20 hover:bg-[#EAB308] hover:shadow-xl hover:shadow-yellow-400/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Search size={18} />
                Buscar
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instrutores em Destaque */}
      <section className="py-12 md:py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-6 md:mb-16"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Instrutores em Destaque {regiaoUsuario ? `na região de ${regiaoUsuario}` : ""}</h2>
            <p className="text-neutral-500 text-sm md:text-lg max-w-2xl mx-auto">
              Profissionais bem avaliados e prontos para te ajudar.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {instrutoresDestaque.map((inst, i) => {
              const media = getMediaAvaliacao(inst.avaliacoes)
              return (
                <motion.div
                  key={inst.id}
                  custom={i + 1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <Link
                    href={`/instrutor/${inst.slug}`}
                    className="block bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-[#FACC15] hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-400/10 transition-all duration-200 group text-center"
                  >
                    <img
                      src={inst.foto_url}
                      alt={inst.nome}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover mx-auto mb-2.5 md:mb-3 ring-2 ring-neutral-100 group-hover:ring-[#FACC15]/40 transition-all"
                    />
                    <h3 className="font-bold text-sm md:text-base truncate group-hover:text-[#EAB308] transition-colors mb-0.5">
                      {inst.nome.split(' ').slice(0, 2).join(' ')}
                    </h3>
                    <p className="text-neutral-400 text-[11px] md:text-xs flex items-center justify-center gap-0.5 mb-2.5 md:mb-3">
                      <MapPin size={11} />
                      {inst.localizacao.cidade}
                    </p>
                    <div className="flex gap-1 md:gap-1.5 justify-center mb-2.5 md:mb-3">
                      {inst.categorias.map((cat) => (
                        <CategoryBadge key={cat} category={cat} />
                      ))}
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      <StarRating rating={media} size="sm" showValue count={inst.avaliacoes.length} />
                    </div>
                    <div className="text-[#EAB308] font-bold text-sm md:text-base">
                      R$ {inst.preco_hora}<span className="text-neutral-400 font-normal text-[11px] md:text-xs">/h</span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          <div className="text-center mt-8 md:mt-12">
            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 border-2 border-neutral-900 text-neutral-900 px-6 py-2.5 md:px-8 md:py-3 rounded-xl font-bold text-sm md:text-base hover:bg-neutral-900 hover:text-white transition-all duration-200"
            >
              Ver todos os instrutores
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 md:py-12 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-3 md:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-2xl md:text-4xl font-bold text-[#EAB308]">{stat.valor}</div>
                <div className="text-neutral-500 text-[10px] md:text-sm mt-0.5 md:mt-1 leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-12 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Como Funciona</h2>
            <p className="text-neutral-500 text-sm md:text-lg max-w-2xl mx-auto">
              Em 3 passos simples você encontra o instrutor ideal para sua habilitação.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-8">
            {etapas.map((etapa, i) => (
              <motion.div
                key={etapa.titulo}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-8 text-center hover:border-[#FACC15] hover:shadow-lg hover:shadow-yellow-400/10 transition-all group"
              >
                <div className="w-10 h-10 md:w-16 md:h-16 bg-[#FACC15]/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-6 group-hover:bg-[#FACC15]/20 transition-colors">
                  <etapa.icon className="text-[#EAB308]" size={20} />
                </div>
                <div className="text-[10px] md:text-sm font-bold text-[#EAB308] mb-1 md:mb-2">Passo {i + 1}</div>
                <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-3">{etapa.titulo}</h3>
                <p className="text-neutral-500 text-[11px] md:text-base leading-snug md:leading-relaxed">{etapa.descricao}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      

      {/* CTA Nova Lei */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="bg-neutral-900 rounded-2xl md:rounded-3xl p-6 md:p-16 text-center text-white"
          >
            <Shield className="text-[#FACC15] mx-auto mb-4 md:mb-6" size={36} />
            <h2 className="text-xl md:text-4xl font-bold mb-3 md:mb-4">
              Entenda a Nova Lei do Instrutor Autônomo
            </h2>
            <p className="text-neutral-400 text-sm md:text-lg max-w-2xl mx-auto mb-5 md:mb-8 leading-relaxed">
              A legislação brasileira agora permite que instrutores credenciados atuem de forma
              independente. Saiba como isso beneficia você.
            </p>
            <Link
              href="/nova-lei"
              className="inline-flex items-center gap-2 bg-[#FACC15] text-neutral-900 px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-sm md:text-lg shadow-lg shadow-yellow-400/30 hover:bg-[#EAB308] hover:-translate-y-0.5 transition-all duration-200"
            >
              Saiba Mais
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 md:py-20 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-6 md:mb-16"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Perguntas Frequentes</h2>
            <p className="text-neutral-500 text-sm md:text-lg">Tire suas dúvidas sobre a plataforma.</p>
          </motion.div>

          <div className="space-y-2 md:space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white border border-neutral-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setFaqAberto(faqAberto === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-semibold text-sm md:text-base pr-4">{faq.pergunta}</span>
                  {faqAberto === i ? (
                    <ChevronUp className="text-[#EAB308] flex-shrink-0" size={18} />
                  ) : (
                    <ChevronDown className="text-neutral-400 flex-shrink-0" size={18} />
                  )}
                </button>
                {faqAberto === i && (
                  <div className="px-4 pb-4 md:px-5 md:pb-5 text-neutral-500 text-sm md:text-base leading-relaxed">
                    {faq.resposta}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
              Pronto para acelerar sua habilitação?
            </h2>
            <p className="text-neutral-500 text-sm md:text-lg mb-6 md:mb-8 max-w-xl mx-auto">
              Encontre o instrutor ideal na sua cidade agora mesmo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link
                href="/buscar"
                className="bg-[#FACC15] text-neutral-900 px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-sm md:text-lg shadow-lg shadow-yellow-400/20 hover:bg-[#EAB308] hover:-translate-y-0.5 transition-all duration-200"
              >
                Buscar Instrutores
              </Link>
              <Link
                href="/seja-instrutor"
                className="border-2 border-neutral-900 text-neutral-900 px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-sm md:text-lg hover:bg-neutral-900 hover:text-white transition-all duration-200"
              >
                Seja Instrutor
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
