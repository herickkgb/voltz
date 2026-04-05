'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StarRating } from '@/components/shared/StarRating'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { WhatsAppButton } from '@/components/shared/WhatsAppButton'
import { getInstrutorById } from '@/lib/db'
import type { Instrutor } from '@/types'
import { MapPin, Clock, Users, Car, Check, X, ArrowLeft, Scale } from 'lucide-react'

function getMedia(avaliacoes: Instrutor['avaliacoes']) {
  if (!avaliacoes.length) return 0
  return avaliacoes.reduce((a, b) => a + b.nota, 0) / avaliacoes.length
}

function Row({ label, valores }: { label: string; valores: (string | React.ReactNode)[] }) {
  return (
    <tr className="border-b border-neutral-100">
      <td className="py-3 px-4 text-sm font-semibold text-neutral-500 bg-neutral-50 w-32 md:w-44">{label}</td>
      {valores.map((v, i) => (
        <td key={i} className="py-3 px-4 text-sm text-neutral-900 text-center">{v}</td>
      ))}
    </tr>
  )
}

export default function CompararPageClient() {
  const searchParams = useSearchParams()
  const [instrutores, setInstrutores] = useState<(Instrutor | null)[]>([])
  const [loading, setLoading] = useState(true)

  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || []

  useEffect(() => {
    if (!ids.length) { setLoading(false); return }
    Promise.all(ids.slice(0, 3).map(id => getInstrutorById(id)))
      .then(data => { setInstrutores(data); setLoading(false) })
      .catch(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validos = instrutores.filter(Boolean) as Instrutor[]

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <div className="pt-20 md:pt-24 pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Link
            href="/buscar"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-6 text-sm"
          >
            <ArrowLeft size={16} /> Voltar à busca
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <Scale className="text-[#EAB308]" size={28} />
            <h1 className="text-2xl md:text-3xl font-bold">Comparar Instrutores</h1>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FACC15]" />
            </div>
          )}

          {!loading && validos.length === 0 && (
            <div className="text-center py-20">
              <Scale className="mx-auto text-neutral-300 mb-4" size={48} />
              <h2 className="text-xl font-bold mb-2">Nenhum instrutor selecionado</h2>
              <p className="text-neutral-500 mb-6">Vá para a página de busca e selecione 2 ou 3 instrutores para comparar.</p>
              <Link href="/buscar" className="bg-[#FACC15] text-neutral-900 px-6 py-3 rounded-xl font-bold hover:bg-[#EAB308] transition-colors">
                Buscar Instrutores
              </Link>
            </div>
          )}

          {!loading && validos.length < 2 && validos.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-amber-800 text-sm">
              Selecione pelo menos 2 instrutores para comparar. <Link href="/buscar" className="font-bold underline">Adicionar mais</Link>
            </div>
          )}

          {!loading && validos.length >= 2 && (
            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Cabeçalho com fotos */}
              <div className="grid border-b border-neutral-200" style={{ gridTemplateColumns: `180px repeat(${validos.length}, 1fr)` }}>
                <div className="p-4 bg-neutral-50" />
                {validos.map(inst => {
                  const media = getMedia(inst.avaliacoes)
                  return (
                    <div key={inst.id} className="p-4 text-center border-l border-neutral-100">
                      <div className="relative mx-auto mb-3 w-16 h-16 md:w-20 md:h-20">
                        {inst.foto_url ? (
                          <Image
                            src={inst.foto_url}
                            alt={inst.nome}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-neutral-200 flex items-center justify-center text-neutral-400 font-bold text-lg">
                            {inst.nome.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h2 className="font-bold text-sm md:text-base leading-tight mb-1">{inst.nome}</h2>
                      <p className="text-neutral-500 text-xs flex items-center justify-center gap-1 mb-2">
                        <MapPin size={11} /> {inst.localizacao.cidade}
                      </p>
                      {media > 0 && <StarRating rating={media} size="sm" showValue count={inst.avaliacoes.length} />}
                    </div>
                  )
                })}
              </div>

              {/* Tabela comparativa */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    <Row
                      label="Preço/hora"
                      valores={validos.map(i => (
                        <span key={i.id} className="text-[#EAB308] font-bold text-base">R$ {i.preco_hora}</span>
                      ))}
                    />
                    <Row
                      label="Avaliação"
                      valores={validos.map(i => {
                        const m = getMedia(i.avaliacoes)
                        return m > 0 ? (
                          <span key={i.id} className="font-bold">{m.toFixed(1)} ⭐ ({i.avaliacoes.length})</span>
                        ) : <span key={i.id} className="text-neutral-400">Sem avaliações</span>
                      })}
                    />
                    <Row
                      label="Experiência"
                      valores={validos.map(i => (
                        <span key={i.id} className="flex items-center justify-center gap-1">
                          <Clock size={13} className="text-neutral-400" /> {i.anos_experiencia} anos
                        </span>
                      ))}
                    />
                    <Row
                      label="Alunos"
                      valores={validos.map(i => (
                        <span key={i.id} className="flex items-center justify-center gap-1">
                          <Users size={13} className="text-neutral-400" /> {i.alunos_formados}
                        </span>
                      ))}
                    />
                    <Row
                      label="Categorias"
                      valores={validos.map(i => (
                        <div key={i.id} className="flex flex-wrap gap-1 justify-center">
                          {i.categorias.map(c => <CategoryBadge key={c} category={c} />)}
                        </div>
                      ))}
                    />
                    <Row
                      label="Aceita seu veículo"
                      valores={validos.map(i => i.aceita_veiculo_candidato
                        ? <Check key={i.id} className="mx-auto text-green-600" size={20} />
                        : <X key={i.id} className="mx-auto text-neutral-300" size={20} />
                      )}
                    />
                    <Row
                      label="Câmbio disponível"
                      valores={validos.map(i => {
                        const tipos = [...new Set(i.veiculos.map(v => v.cambio))]
                        return <span key={i.id} className="text-xs capitalize">{tipos.join(' + ') || '—'}</span>
                      })}
                    />
                    <Row
                      label="Cidade"
                      valores={validos.map(i => (
                        <span key={i.id} className="text-xs">{i.localizacao.cidade} - {i.localizacao.estado}</span>
                      ))}
                    />
                    <tr>
                      <td className="py-4 px-4 bg-neutral-50" />
                      {validos.map(i => (
                        <td key={i.id} className="py-4 px-4 border-l border-neutral-100">
                          <div className="flex flex-col gap-2">
                            <Link
                              href={`/instrutor/${i.slug}`}
                              className="block text-center border border-neutral-200 text-neutral-700 px-3 py-2 rounded-xl text-xs font-semibold hover:border-[#FACC15] transition-colors"
                            >
                              Ver perfil
                            </Link>
                            <WhatsAppButton instrutor={i} variant="icon" />
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
