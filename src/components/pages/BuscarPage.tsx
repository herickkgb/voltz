'use client'

import { useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StarRating } from '@/components/shared/StarRating'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { useInstrutores } from '@/hooks/useInstrutores'
import { getMediaAvaliacao } from '@/lib/db'
import { MapPin, Car, Clock, Users, SlidersHorizontal, X, Scale } from 'lucide-react'
import type { FiltrosBusca } from '@/types'

interface Props {
  cidadePreset?: string
}

export default function BuscarPageClient({ cidadePreset }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [comparando, setComparando] = useState<string[]>([])

  // Ler filtros iniciais da URL
  const getFiltrosFromURL = useCallback((): FiltrosBusca => {
    const categorias = searchParams.get('categorias')?.split(',').filter(Boolean)
    const genero = searchParams.get('genero') as 'masculino' | 'feminino' | undefined
    return {
      cidade: cidadePreset || searchParams.get('cidade') || '',
      categorias: categorias?.length ? categorias : undefined,
      precoMin: searchParams.get('precoMin') ? Number(searchParams.get('precoMin')) : undefined,
      precoMax: searchParams.get('precoMax') ? Number(searchParams.get('precoMax')) : undefined,
      anosExperienciaMin: searchParams.get('exp') ? Number(searchParams.get('exp')) : undefined,
      genero: genero || undefined,
      aceitaVeiculoCandidato: searchParams.get('veiculo') === '1' ? true : undefined,
      ordenar: (searchParams.get('ord') as FiltrosBusca['ordenar']) || undefined,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { instrutores, loading, filtros, setFiltros } = useInstrutores(getFiltrosFromURL())

  // Sincronizar filtros com a URL ao mudar
  const handleFiltros = (novos: FiltrosBusca) => {
    setFiltros(novos)
    const params = new URLSearchParams()
    if (novos.cidade) params.set('cidade', novos.cidade)
    if (novos.categorias?.length) params.set('categorias', novos.categorias.join(','))
    if (novos.precoMin) params.set('precoMin', String(novos.precoMin))
    if (novos.precoMax) params.set('precoMax', String(novos.precoMax))
    if (novos.anosExperienciaMin) params.set('exp', String(novos.anosExperienciaMin))
    if (novos.genero) params.set('genero', novos.genero)
    if (novos.aceitaVeiculoCandidato) params.set('veiculo', '1')
    if (novos.ordenar) params.set('ord', novos.ordenar)
    const qs = params.toString()
    router.replace(qs ? `/buscar?${qs}` : '/buscar', { scroll: false })
  }

  const toggleComparar = (id: string) => {
    setComparando(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length < 3 ? [...prev, id] : prev
    )
  }

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
                onChange={(e) => handleFiltros({ ...filtros, cidade: e.target.value })}
                className="w-full bg-white border border-neutral-200 rounded-xl pl-10 md:pl-12 pr-4 py-2.5 md:py-3.5 text-[16px] md:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 transition-all shadow-sm appearance-none"
              />
            </div>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center justify-center gap-2 border rounded-xl px-5 py-2.5 md:px-6 md:py-3.5 font-medium text-sm md:text-base transition-all active:scale-95 touch-manipulation shadow-sm ${
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
                    handleFiltros({ cidade: filtros.cidade })
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
                        handleFiltros({ ...filtros, categorias: updated.length ? updated : undefined })
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
                    onChange={(e) => handleFiltros({ ...filtros, precoMin: Number(e.target.value) || undefined })}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-neutral-900 text-[16px] md:text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] transition-all appearance-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">Preço máx. (R$)</label>
                  <input
                    type="number"
                    placeholder="Ex: 150"
                    value={filtros.precoMax || ''}
                    onChange={(e) => handleFiltros({ ...filtros, precoMax: Number(e.target.value) || undefined })}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-neutral-900 text-[16px] md:text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] transition-all appearance-none"
                  />
                </div>
              </div>

              {/* Experiência */}
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-2 block">Experiência mínima</label>
                <select
                  value={filtros.anosExperienciaMin || ''}
                  onChange={(e) =>
                    handleFiltros({ ...filtros, anosExperienciaMin: Number(e.target.value) || undefined })
                  }
                  className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-[16px] md:text-sm text-neutral-900 focus:outline-none focus:border-[#FACC15] transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNhMGEwYTAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==')] bg-[length:16px] bg-[position:calc(100%-12px)_center] bg-no-repeat pr-10"
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
                      onClick={() => handleFiltros({ ...filtros, genero: opt.value })}
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
                  onChange={(e) => handleFiltros({ ...filtros, aceitaVeiculoCandidato: e.target.checked || undefined })}
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
                    handleFiltros({ ...filtros, ordenar: (e.target.value as 'avaliacao' | 'preco') || undefined })
                  }
                  className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-[16px] md:text-sm text-neutral-900 focus:outline-none focus:border-[#FACC15] transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNhMGEwYTAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==')] bg-[length:16px] bg-[position:calc(100%-12px)_center] bg-no-repeat pr-10"
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
                    handleFiltros({ ...filtros, categorias: updated.length ? updated : undefined })
                  }}><X size={12} /></button>
                </span>
              ))}
              {filtros.genero && (
                <span className="bg-[#FACC15]/15 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                  {filtros.genero === 'masculino' ? 'Homem' : 'Mulher'}
                  <button onClick={() => handleFiltros({ ...filtros, genero: undefined })}><X size={12} /></button>
                </span>
              )}
              {filtros.anosExperienciaMin && (
                <span className="bg-[#FACC15]/15 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                  {filtros.anosExperienciaMin}+ anos
                  <button onClick={() => handleFiltros({ ...filtros, anosExperienciaMin: undefined })}><X size={12} /></button>
                </span>
              )}
              {filtros.precoMax && (
                <span className="bg-[#FACC15]/15 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                  Até R$ {filtros.precoMax}
                  <button onClick={() => handleFiltros({ ...filtros, precoMax: undefined })}><X size={12} /></button>
                </span>
              )}
              {filtros.aceitaVeiculoCandidato && (
                <span className="bg-[#FACC15]/15 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                  Aceita seu veículo
                  <button onClick={() => handleFiltros({ ...filtros, aceitaVeiculoCandidato: undefined })}><X size={12} /></button>
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
                onClick={() => handleFiltros({})}
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
                        <button
                          onClick={() => toggleComparar(inst.id)}
                          title="Adicionar à comparação"
                          className={`px-2 py-2 md:px-3 rounded-lg md:rounded-xl text-xs font-semibold border transition-colors ${
                            comparando.includes(inst.id)
                              ? 'bg-[#FACC15] border-[#FACC15] text-neutral-900'
                              : 'border-neutral-200 text-neutral-500 hover:border-[#FACC15]'
                          }`}
                        >
                          <Scale size={15} />
                        </button>
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

      {/* Barra flutuante de comparação */}
      {comparando.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4">
          <Scale size={18} className="text-[#FACC15]" />
          <span className="text-sm font-semibold">{comparando.length} instrutor{comparando.length !== 1 ? 'es' : ''} selecionado{comparando.length !== 1 ? 's' : ''}</span>
          {comparando.length >= 2 && (
            <Link
              href={`/comparar?ids=${comparando.join(',')}`}
              className="bg-[#FACC15] text-neutral-900 px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-[#EAB308] transition-colors"
            >
              Comparar
            </Link>
          )}
          <button
            onClick={() => setComparando([])}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <Footer />
    </div>
  )
}
