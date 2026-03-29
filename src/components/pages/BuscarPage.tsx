'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StarRating } from '@/components/shared/StarRating'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { useInstrutores } from '@/hooks/useInstrutores'
import { getMediaAvaliacao } from '@/lib/db'
import { MapPin, Car, Clock, Users, SlidersHorizontal, X } from 'lucide-react'

export default function BuscarPageClient() {
  const searchParams = useSearchParams()
  const cidadeInicial = searchParams.get('cidade') || ''
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const { instrutores, loading, filtros, setFiltros } = useInstrutores({
    cidade: cidadeInicial,
  })

  const categorias = ['A', 'B', 'C', 'D', 'E']

  const filtrosAtivos = [
    filtros.categorias?.length,
    filtros.precoMin,
    filtros.precoMax,
    filtros.aceitaVeiculoCandidato,
    filtros.anosExperienciaMin,
    filtros.genero,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <div className="pt-20 md:pt-24 pb-12 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold mb-1">Buscar Instrutores</h1>
            <p className="text-neutral-500 text-sm md:text-base">
              {loading
                ? 'Buscando...'
                : `${instrutores.length} instrutor${instrutores.length !== 1 ? 'es' : ''} encontrado${instrutores.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Digite a cidade... ex: Belo Horizonte"
                value={filtros.cidade || ''}
                onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
                className="w-full bg-white border border-neutral-200 rounded-xl pl-10 md:pl-12 pr-4 py-2.5 md:py-3.5 text-sm md:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 transition-all shadow-sm"
              />
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center justify-center gap-2 border rounded-xl px-5 py-2.5 md:px-6 md:py-3.5 font-medium text-sm md:text-base transition-all shadow-sm ${
                mostrarFiltros
                  ? 'bg-[#FACC15] border-[#FACC15] text-neutral-900'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-[#FACC15]'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filtros
              {filtrosAtivos > 0 && (
                <span className="bg-neutral-900 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {filtrosAtivos}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {mostrarFiltros && (
            <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-8 shadow-sm space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Filtros</h3>
                <button
                  onClick={() => {
                    setFiltros({ cidade: filtros.cidade })
                  }}
                  className="text-neutral-400 text-sm hover:text-neutral-900 transition-colors"
                >
                  Limpar filtros
                </button>
              </div>

              {/* Categorias */}
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-3 block">Categoria da CNH</label>
                <div className="flex flex-wrap gap-2">
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        const current = filtros.categorias || []
                        const updated = current.includes(cat)
                          ? current.filter((c) => c !== cat)
                          : [...current, cat]
                        setFiltros({ ...filtros, categorias: updated.length ? updated : undefined })
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        filtros.categorias?.includes(cat)
                          ? 'bg-[#FACC15] text-neutral-900 shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      Categoria {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preço */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">Preço mín. (R$)</label>
                  <input
                    type="number"
                    placeholder="Ex: 50"
                    value={filtros.precoMin || ''}
                    onChange={(e) => setFiltros({ ...filtros, precoMin: Number(e.target.value) || undefined })}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">Preço máx. (R$)</label>
                  <input
                    type="number"
                    placeholder="Ex: 150"
                    value={filtros.precoMax || ''}
                    onChange={(e) => setFiltros({ ...filtros, precoMax: Number(e.target.value) || undefined })}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] transition-all"
                  />
                </div>
              </div>

              {/* Experiência */}
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-2 block">Experiência mínima</label>
                <select
                  value={filtros.anosExperienciaMin || ''}
                  onChange={(e) =>
                    setFiltros({ ...filtros, anosExperienciaMin: Number(e.target.value) || undefined })
                  }
                  className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-neutral-900 focus:outline-none focus:border-[#FACC15] transition-all"
                >
                  <option value="">Qualquer experiência</option>
                  <option value="3">3+ anos</option>
                  <option value="5">5+ anos</option>
                  <option value="10">10+ anos</option>
                  <option value="15">15+ anos</option>
                </select>
              </div>

              {/* Gênero */}
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-3 block">Instrutor(a)</label>
                <div className="flex gap-2">
                  {[
                    { value: undefined, label: 'Todos' },
                    { value: 'masculino' as const, label: 'Homem' },
                    { value: 'feminino' as const, label: 'Mulher' },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setFiltros({ ...filtros, genero: opt.value })}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        filtros.genero === opt.value
                          ? 'bg-[#FACC15] text-neutral-900 shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aceita veículo */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.aceitaVeiculoCandidato || false}
                  onChange={(e) => setFiltros({ ...filtros, aceitaVeiculoCandidato: e.target.checked || undefined })}
                  className="w-5 h-5 rounded border-neutral-300 text-[#FACC15] focus:ring-[#FACC15]/20"
                />
                <span className="text-sm text-neutral-700">Aceita veículo do candidato</span>
              </label>

              {/* Ordenação */}
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-2 block">Ordenar por</label>
                <select
                  value={filtros.ordenar || ''}
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      ordenar: (e.target.value as 'avaliacao' | 'preco') || undefined,
                    })
                  }
                  className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-neutral-900 focus:outline-none focus:border-[#FACC15] transition-all"
                >
                  <option value="">Relevância</option>
                  <option value="avaliacao">Melhor avaliação</option>
                  <option value="preco">Menor preço</option>
                </select>
              </div>
            </div>
          )}

          {/* Active filter tags */}
          {filtrosAtivos > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filtros.categorias?.map((cat) => (
                <span key={cat} className="bg-[#FACC15]/15 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                  Categoria {cat}
                  <button onClick={() => {
                    const updated = filtros.categorias!.filter(c => c !== cat)
                    setFiltros({ ...filtros, categorias: updated.length ? updated : undefined })
                  }}><X size={12} /></button>
                </span>
              ))}
              {filtros.genero && (
                <span className="bg-[#FACC15]/15 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                  {filtros.genero === 'masculino' ? 'Homem' : 'Mulher'}
                  <button onClick={() => setFiltros({ ...filtros, genero: undefined })}><X size={12} /></button>
                </span>
              )}
              {filtros.anosExperienciaMin && (
                <span className="bg-[#FACC15]/15 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                  {filtros.anosExperienciaMin}+ anos
                  <button onClick={() => setFiltros({ ...filtros, anosExperienciaMin: undefined })}><X size={12} /></button>
                </span>
              )}
              {filtros.precoMax && (
                <span className="bg-[#FACC15]/15 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                  Até R$ {filtros.precoMax}
                  <button onClick={() => setFiltros({ ...filtros, precoMax: undefined })}><X size={12} /></button>
                </span>
              )}
              {filtros.aceitaVeiculoCandidato && (
                <span className="bg-[#FACC15]/15 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                  Aceita seu veículo
                  <button onClick={() => setFiltros({ ...filtros, aceitaVeiculoCandidato: undefined })}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="grid md:grid-cols-2 gap-3 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : instrutores.length === 0 ? (
            <div className="text-center py-12 md:py-20">
              <div className="text-4xl md:text-6xl mb-3">🔍</div>
              <h3 className="text-lg md:text-xl font-bold mb-2">Nenhum instrutor encontrado</h3>
              <p className="text-neutral-500 text-sm md:text-base mb-4 md:mb-6">
                Tente alterar os filtros ou buscar em outra cidade.
              </p>
              <button
                onClick={() => setFiltros({})}
                className="border-2 border-neutral-900 text-neutral-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-neutral-900 hover:text-white transition-all"
              >
                Limpar busca
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3 md:gap-6">
              {instrutores.map((inst) => {
                const media = getMediaAvaliacao(inst.avaliacoes)
                return (
                  <div
                    key={inst.id}
                    className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-[#FACC15] hover:shadow-lg hover:shadow-yellow-400/10 transition-all group"
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      <Link href={`/instrutor/${inst.slug}`}>
                        <img
                          src={inst.foto_url}
                          alt={inst.nome}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover flex-shrink-0"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/instrutor/${inst.slug}`}>
                          <h3 className="font-bold text-sm md:text-lg group-hover:text-[#EAB308] transition-colors truncate">
                            {inst.nome}
                          </h3>
                        </Link>
                        <p className="text-neutral-400 text-xs md:text-sm flex items-center gap-1 mb-1.5 md:mb-2">
                          <MapPin size={12} />
                          <span className="truncate">{inst.localizacao.bairro}, {inst.localizacao.cidade} - {inst.localizacao.estado}</span>
                        </p>
                        <div className="flex items-center gap-2 md:gap-0 md:flex-col md:items-start">
                          <div className="flex gap-1 md:gap-1.5 md:mb-3">
                            {inst.categorias.map((cat) => (
                              <CategoryBadge key={cat} category={cat} />
                            ))}
                          </div>
                          <StarRating rating={media} size="sm" showValue count={inst.avaliacoes.length} />
                        </div>
                      </div>
                    </div>

                    <p className="text-neutral-500 text-xs md:text-sm mt-3 md:mt-4 line-clamp-2 hidden md:block">{inst.descricao}</p>

                    <div className="flex items-center gap-3 md:gap-4 mt-3 md:mt-4 text-[11px] md:text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {inst.anos_experiencia} anos
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {inst.alunos_formados} alunos
                      </span>
                      {inst.aceita_veiculo_candidato && (
                        <span className="hidden md:flex items-center gap-1">
                          <Car size={12} /> Aceita seu veículo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 md:mt-5 md:pt-5 border-t border-neutral-100">
                      <div>
                        <span className="text-[#EAB308] font-bold text-base md:text-xl">R$ {inst.preco_hora}</span>
                        <span className="text-neutral-400 text-xs md:text-sm">/hora</span>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/instrutor/${inst.slug}`}
                          className="border border-neutral-200 text-neutral-700 px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold hover:border-[#FACC15] transition-colors"
                        >
                          Ver perfil
                        </Link>
                        <WhatsAppButton instrutor={inst} variant="icon" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
