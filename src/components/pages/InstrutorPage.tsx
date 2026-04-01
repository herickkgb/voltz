'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StarRating } from '@/components/shared/StarRating'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { getInstrutorBySlug, getMediaAvaliacao, registrarVisualizacao } from '@/lib/db'
import { MapPin, Clock, Users, Car, Shield, ChevronLeft, Calendar, Share2, Check } from 'lucide-react'

const diasSemana = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const turnoLabels: Record<string, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
}

export default function InstrutorPageClient() {
  const params = useParams()
  const slug = params.slug as string
  const [instrutor, setInstrutor] = useState<import('@/types').Instrutor | null>(null)
  const [loading, setLoading] = useState(true)
  const [linkCopiado, setLinkCopiado] = useState(false)

  useEffect(() => {
    getInstrutorBySlug(slug).then(data => {
      setInstrutor(data)
      setLoading(false)
      if (data) {
        registrarVisualizacao(data.id)
      }
    })
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">
        <Navbar />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FACC15]" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!instrutor) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Instrutor não encontrado</h1>
          <p className="text-neutral-500 mb-6">Este perfil não existe ou foi removido.</p>
          <Link
            href="/buscar"
            className="bg-[#FACC15] text-neutral-900 px-6 py-3 rounded-xl font-bold hover:bg-[#EAB308] transition-all"
          >
            Buscar Instrutores
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const media = getMediaAvaliacao(instrutor.avaliacoes)

  const disponibilidadePorDia = instrutor.disponibilidades.reduce(
    (acc, d) => {
      if (!acc[d.dia_semana]) acc[d.dia_semana] = []
      acc[d.dia_semana].push(d.turno)
      return acc
    },
    {} as Record<number, string[]>
  )

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <div className="pt-20 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <Link
            href="/buscar"
            className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 text-[13px] md:text-sm font-medium mb-4 md:mb-8 transition-all active:scale-95 touch-manipulation px-2 py-1 -ml-2 rounded-lg hover:bg-neutral-100"
          >
            <ChevronLeft size={14} />
            Voltar para busca
          </Link>

          {/* Profile Header */}
          <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-8 mb-4 md:mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              <img
                src={instrutor.foto_url}
                alt={instrutor.nome}
                className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover flex-shrink-0 mx-auto md:mx-0"
              />
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5 md:mb-2">
                  <h1 className="text-xl md:text-3xl font-bold">{instrutor.nome}</h1>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Shield size={12} /> Verificado
                  </span>
                </div>
                <p className="text-neutral-400 flex items-center justify-center md:justify-start gap-1 mb-2 md:mb-3 text-xs md:text-base">
                  <MapPin size={14} />
                  {instrutor.localizacao.cidade
                    ? `${instrutor.localizacao.bairro ? instrutor.localizacao.bairro + ', ' : ''}${instrutor.localizacao.cidade} - ${instrutor.localizacao.estado}`
                    : 'Localização não informada'}
                </p>
                <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center md:justify-start mb-3 md:mb-4">
                  {instrutor.categorias.map((cat) => (
                    <CategoryBadge key={cat} category={`Categoria ${cat}`} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start text-xs md:text-sm text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-[#EAB308]" /> {instrutor.anos_experiencia} anos exp.
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} className="text-[#EAB308]" /> {instrutor.alunos_formados} alunos
                  </span>
                  {instrutor.aceita_veiculo_candidato && (
                    <span className="flex items-center gap-1">
                      <Car size={14} className="text-[#EAB308]" /> Aceita seu veículo
                    </span>
                  )}
                </div>
              </div>
              <div className="text-center md:text-right flex-shrink-0">
                <div className="mb-1.5 md:mb-2">
                  <span className="text-2xl md:text-3xl font-bold text-[#EAB308]">R$ {instrutor.preco_hora}</span>
                  <span className="text-neutral-400 text-sm md:text-base">/hora</span>
                </div>
                <StarRating rating={media} size="md" showValue count={instrutor.avaliacoes.length} />
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/instrutor/${instrutor.slug}`
                    if (navigator.share) {
                      navigator.share({ title: `${instrutor.nome} — Buscar Instrutor`, url })
                    } else {
                      navigator.clipboard.writeText(url)
                      setLinkCopiado(true)
                      setTimeout(() => setLinkCopiado(false), 2000)
                    }
                  }}
                  className="mt-2 md:mt-3 inline-flex items-center gap-1.5 text-[13px] md:text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-all active:scale-95 touch-manipulation bg-neutral-100 hover:bg-neutral-200 px-3 py-2 rounded-xl"
                >
                  {linkCopiado ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
                  {linkCopiado ? 'Link copiado!' : 'Compartilhar perfil'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {/* Sidebar - appears first on mobile, right column on desktop */}
            <div className="order-first md:order-last space-y-4 md:space-y-6">
              <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 md:sticky md:top-20 lg:top-24 shadow-sm">
                <div className="text-center mb-4 md:mb-6">
                  <span className="text-2xl md:text-3xl font-bold text-[#EAB308]">R$ {instrutor.preco_hora}</span>
                  <span className="text-neutral-400 text-sm md:text-base">/hora</span>
                </div>
                <WhatsAppButton instrutor={instrutor} />
                <div className="mt-4 text-center">
                  <p className="text-neutral-400 text-xs flex items-center justify-center gap-1">
                    <Shield size={12} /> Registro SENATRAN: {instrutor.registro_senatran}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
              {/* Sobre */}
              <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
                <h2 className="text-base md:text-lg font-bold mb-2 md:mb-4">Sobre</h2>
                <p className="text-neutral-500 leading-relaxed text-sm md:text-base">{instrutor.descricao}</p>
              </div>

              {/* Veículos */}
              <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
                <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4">Veículos</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {instrutor.veiculos.map((v) => (
                    <div key={v.id} className="bg-neutral-50 rounded-xl p-4 flex items-center gap-3">
                      <Car className="text-[#EAB308] flex-shrink-0" size={24} />
                      <div>
                        <p className="font-semibold text-sm">
                          {v.marca} {v.modelo}
                        </p>
                        <p className="text-neutral-400 text-xs">
                          {v.ano} · {v.cambio === 'manual' ? 'Manual' : 'Automático'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disponibilidade */}
              <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
                <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-[#EAB308]" />
                  Disponibilidade
                </h2>
                <div className="space-y-3">
                  {Object.entries(disponibilidadePorDia)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([dia, turnos]) => (
                      <div key={dia} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                        <span className="font-medium text-xs md:text-sm">{diasSemana[Number(dia)]}</span>
                        <div className="flex gap-1.5 md:gap-2">
                          {turnos.map((turno) => (
                            <span key={turno} className="bg-[#FACC15]/15 text-amber-700 text-[10px] md:text-xs font-semibold px-2 py-0.5 md:px-3 md:py-1 rounded-full">
                              {turnoLabels[turno]}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Avaliações */}
              <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
                <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4">
                  Avaliações ({instrutor.avaliacoes.length})
                </h2>
                <div className="space-y-4">
                  {instrutor.avaliacoes.map((av) => (
                    <div key={av.id} className="border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{av.nome_aluno}</span>
                        <span className="text-neutral-400 text-xs">{new Date(av.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <StarRating rating={av.nota} size="sm" />
                      <p className="text-neutral-500 text-sm mt-2">{av.comentario}</p>
                      {av.resposta_instrutor && (
                        <div className="bg-neutral-50 rounded-lg p-3 mt-3 ml-4 border-l-2 border-[#FACC15]">
                          <p className="text-xs text-neutral-400 mb-1 font-semibold">Resposta do instrutor</p>
                          <p className="text-neutral-600 text-sm">{av.resposta_instrutor}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <WhatsAppButton instrutor={instrutor} variant="mobile" />

      <Footer />
    </div>
  )
}
