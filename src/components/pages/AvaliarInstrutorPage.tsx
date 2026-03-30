'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Star, CheckCircle2, Shield, AlertCircle } from 'lucide-react'
import { getInstrutorById, enviarAvaliacao } from '@/lib/db'
import { Instrutor } from '@/types'
import { toast } from 'sonner'

export function AvaliarInstrutorPageClient({ token }: { token: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [instrutor, setInstrutor] = useState<Instrutor | null>(null)
  const [nomeAluno, setNomeAluno] = useState('')
  const [nota, setNota] = useState(0)
  const [hoverNota, setHoverNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [erroFatal, setErroFatal] = useState(false)

  useEffect(() => {
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(token)))
      if (!decoded.i || !decoded.n) {
        setErroFatal(true)
        setLoading(false)
        return
      }
      setNomeAluno(decoded.n)
      
      // Busca o instrutor para mostrar a foto/nome no card
      getInstrutorById(decoded.i).then(data => {
        if (!data) setErroFatal(true)
        else setInstrutor(data as Instrutor)
        setLoading(false)
      })
    } catch (e) {
      setErroFatal(true)
      setLoading(false)
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (nota === 0) {
      toast.error('Por favor, defina a quantidade de estrelas.')
      return
    }
    if (comentario.length < 10) {
      toast.error('O comentário deve ter pelo menos 10 caracteres.')
      return
    }
    setSubmitting(true)
    try {
      const decoded = JSON.parse(atob(decodeURIComponent(token)))
      const ok = await enviarAvaliacao(decoded.i, decoded.n, nota, comentario)
      if (ok) {
        setSucesso(true)
      } else {
        toast.error('Ocorreu um erro ao enviar sua avaliação. Tente novamente.')
      }
    } catch (err) {
      toast.error('Link inválido ou expirado.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FACC15]" />
      </div>
    )
  }

  if (erroFatal || !instrutor) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Navbar />
        <div className="pt-32 pb-20 flex flex-col items-center justify-center px-4 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Link Invalido</h1>
          <p className="text-neutral-500 mb-6">Este link de avaliação está corrompido ou é inválido.</p>
          <Link href="/" className="bg-[#FACC15] text-neutral-900 px-6 py-3 rounded-xl font-bold">Voltar ao Início</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar />

      <div className="flex-1 pt-24 pb-16 md:pt-32 md:pb-20 flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          {sucesso ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center shadow-lg">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-3">Avaliação Enviada!</h1>
              <p className="text-neutral-500 mb-8 leading-relaxed">
                Muito obrigado, <strong>{nomeAluno}</strong>! Sua avaliação foi anexada ao perfil de <strong>{instrutor.nome}</strong>. Seu feedback ajuda outros alunos a escolherem o instrutor certo.
              </p>
              <Link href={`/instrutor/${instrutor.slug}`} className="block w-full bg-[#FACC15] text-neutral-900 py-3.5 rounded-xl font-bold text-base hover:bg-[#EAB308] transition-all">
                Ver o perfil de {instrutor.nome}
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Avaliar Instrutor</h1>
                <p className="text-neutral-500 text-sm">Olá, <strong>{nomeAluno}</strong>! Como foram suas aulas?</p>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4 flex items-center gap-4 mb-8 border border-neutral-100">
                <img src={instrutor.foto_url} alt={instrutor.nome} className="w-14 h-14 rounded-full object-cover shadow-sm bg-white" />
                <div>
                  <p className="font-bold text-neutral-900">{instrutor.nome}</p>
                  <p className="text-xs text-neutral-400 mt-0.5 max-w-[200px] truncate">{instrutor.descricao || instrutor.categorias.map(c => `Cat ${c}`).join(', ')}</p>
                </div>
                <Shield className="ml-auto text-[#FACC15]" size={20} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block text-center mb-3">Sua Nota</label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNota(star)}
                        onMouseEnter={() => setHoverNota(star)}
                        onMouseLeave={() => setHoverNota(0)}
                        className="transition-transform hover:scale-110 p-1"
                      >
                        <Star 
                          size={36} 
                          className={`transition-colors ${(hoverNota || nota) >= star ? 'fill-[#FACC15] text-[#FACC15]' : 'fill-transparent text-neutral-300'}`} 
                        />
                      </button>
                    ))}
                  </div>
                  {nota > 0 && <p className="text-center text-[#EAB308] text-sm font-bold mt-2">Você selecionou {nota} estrela{nota > 1 ? 's' : ''}!</p>}
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-2">Seu Comentário Público</label>
                  <textarea 
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    placeholder="Conte como foi sua experiência, o que mais gostou e se recomendaria este instrutor (mínimo 10 caracteres)."
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 min-h-[120px]"
                  />
                  <div className="text-right mt-1">
                    <span className={`text-xs ${comentario.length < 10 ? 'text-red-400' : 'text-green-500'}`}>{comentario.length}/10 caracteres mín.</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-[#FACC15] text-neutral-900 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-yellow-400/20 hover:bg-[#EAB308] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? 'Enviando avaliação...' : 'Enviar Avaliação'}
                </button>
              </form>
              
              <p className="text-center text-xs text-neutral-400 mt-6">
                Sua avaliação será permanentemente visível no perfil público do instrutor.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
