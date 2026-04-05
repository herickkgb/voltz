'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StarRating } from '@/components/shared/StarRating'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Instrutor } from '@/types'
import { MapPin, Clock, Calendar, Phone, User, CheckCircle, ArrowLeft } from 'lucide-react'

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const TURNOS = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }

interface Props {
  instrutor: Instrutor
}

export default function AgendarPageClient({ instrutor }: Props) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null)
  const [turnoSelecionado, setTurnoSelecionado] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const media = instrutor.avaliacoes.length
    ? instrutor.avaliacoes.reduce((a, b) => a + b.nota, 0) / instrutor.avaliacoes.length
    : 0

  // Agrupar disponibilidades por dia
  const disponibilidadesPorDia = instrutor.disponibilidades.reduce<Record<number, string[]>>((acc, d) => {
    if (!acc[d.dia_semana]) acc[d.dia_semana] = []
    acc[d.dia_semana].push(d.turno)
    return acc
  }, {})

  const diasDisponiveis = Object.keys(disponibilidadesPorDia).map(Number).sort()

  const turnosDoDia = diaSelecionado !== null ? disponibilidadesPorDia[diaSelecionado] || [] : []

  const telefoneMask = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 11)
    if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    return n.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
  }

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !telefone.trim()) {
      toast.error('Preencha nome e telefone')
      return
    }
    if (diaSelecionado === null || !turnoSelecionado) {
      toast.error('Selecione um dia e turno de preferência')
      return
    }

    setEnviando(true)
    try {
      const diaNome = DIAS_SEMANA[diaSelecionado]
      const turnoNome = TURNOS[turnoSelecionado as keyof typeof TURNOS]
      const msgCompleta = `Agendamento solicitado para ${diaNome} (${turnoNome})${mensagem ? `. Mensagem: ${mensagem}` : ''}`

      const { error } = await supabase!.from('contatos').insert({
        instrutor_id: instrutor.id,
        nome: nome.trim(),
        telefone: telefone.replace(/\D/g, ''),
        mensagem: msgCompleta,
        lido: false,
      })

      if (error) throw error
      setSucesso(true)
    } catch {
      toast.error('Erro ao enviar solicitação. Tente novamente.')
    }
    setEnviando(false)
  }

  if (sucesso) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <Navbar />
        <div className="pt-32 pb-20 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Solicitação enviada!</h1>
            <p className="text-neutral-500 mb-2">
              <strong>{instrutor.nome}</strong> recebeu sua solicitação e entrará em contato em breve.
            </p>
            <p className="text-neutral-400 text-sm mb-8">
              Enquanto isso, você também pode contatar diretamente via WhatsApp.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/55${instrutor.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${instrutor.nome}, acabei de solicitar um agendamento pelo Buscar Instrutor!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
              >
                Contatar no WhatsApp
              </a>
              <Link
                href={`/instrutor/${instrutor.slug}`}
                className="border border-neutral-200 text-neutral-700 py-3 rounded-xl font-semibold hover:border-[#FACC15] transition-colors"
              >
                Ver perfil do instrutor
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <div className="pt-20 md:pt-24 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href={`/instrutor/${instrutor.slug}`}
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-6 text-sm"
          >
            <ArrowLeft size={16} /> Voltar ao perfil
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold mb-6">Solicitar Agendamento</h1>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card do instrutor */}
            <div className="md:col-span-1">
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 sticky top-24">
                <div className="flex flex-col items-center text-center">
                  {instrutor.foto_url ? (
                    <Image
                      src={instrutor.foto_url}
                      alt={instrutor.nome}
                      width={80}
                      height={80}
                      className="rounded-full object-cover mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-neutral-200 flex items-center justify-center mb-3">
                      <User size={32} className="text-neutral-400" />
                    </div>
                  )}
                  <h2 className="font-bold text-lg mb-1">{instrutor.nome}</h2>
                  <div className="flex items-center gap-1 text-neutral-500 text-sm mb-2">
                    <MapPin size={13} />
                    {instrutor.localizacao.cidade} - {instrutor.localizacao.estado}
                  </div>
                  {media > 0 && <StarRating rating={media} size="sm" showValue count={instrutor.avaliacoes.length} />}
                  <div className="flex flex-wrap gap-1 justify-center mt-3">
                    {instrutor.categorias.map(cat => <CategoryBadge key={cat} category={cat} />)}
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-100 w-full">
                    <p className="text-[#EAB308] font-bold text-xl">R$ {instrutor.preco_hora}<span className="text-neutral-400 text-sm font-normal">/hora</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <div className="md:col-span-2">
              <form onSubmit={handleEnviar} className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 space-y-5">
                {/* Dados pessoais */}
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">Seu nome *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
                      type="text"
                      placeholder="Como você se chama"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-11 pr-4 py-3 text-neutral-900 text-[16px] md:text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">Seu WhatsApp/Telefone *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={telefone}
                      onChange={e => setTelefone(telefoneMask(e.target.value))}
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-11 pr-4 py-3 text-neutral-900 text-[16px] md:text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Dias disponíveis */}
                {diasDisponiveis.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-3 block flex items-center gap-2">
                      <Calendar size={15} /> Dia de preferência *
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {diasDisponiveis.map(dia => (
                        <button
                          key={dia}
                          type="button"
                          onClick={() => { setDiaSelecionado(dia); setTurnoSelecionado(null) }}
                          className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                            diaSelecionado === dia
                              ? 'bg-[#FACC15] border-[#FACC15] text-neutral-900'
                              : 'border-neutral-200 text-neutral-600 hover:border-[#FACC15] bg-white'
                          }`}
                        >
                          {DIAS_SEMANA[dia].slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Turnos */}
                {diaSelecionado !== null && turnosDoDia.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-3 block flex items-center gap-2">
                      <Clock size={15} /> Turno preferido *
                    </label>
                    <div className="flex gap-3">
                      {turnosDoDia.map(turno => (
                        <button
                          key={turno}
                          type="button"
                          onClick={() => setTurnoSelecionado(turno)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                            turnoSelecionado === turno
                              ? 'bg-[#FACC15] border-[#FACC15] text-neutral-900'
                              : 'border-neutral-200 text-neutral-600 hover:border-[#FACC15] bg-white'
                          }`}
                        >
                          {TURNOS[turno as keyof typeof TURNOS]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mensagem */}
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">Mensagem (opcional)</label>
                  <textarea
                    placeholder="Ex: Sou iniciante, tenho CNH suspensa, prefiro automático..."
                    value={mensagem}
                    onChange={e => setMensagem(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 text-[16px] md:text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-[#FACC15] text-neutral-900 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-yellow-400/20 hover:bg-[#EAB308] transition-all disabled:opacity-50"
                >
                  {enviando ? 'Enviando...' : 'Enviar Solicitação'}
                </button>

                <p className="text-center text-neutral-400 text-xs">
                  Ao enviar, o instrutor verá sua solicitação no painel e entrará em contato pelo WhatsApp.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
