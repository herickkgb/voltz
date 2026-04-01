'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { atualizarPerfilInstrutor, atualizarLocalizacao, atualizarFotoPerfil, solicitarNovaAnalise, atualizarDocumento, criarDocumento, atualizarDisponibilidades, aplicarCodigoAtivacao } from '@/lib/db'
import { uploadFoto, uploadDocumento } from '@/lib/storage'
import { telefoneMask, cepMask } from '@/lib/validations'
import { toast } from 'sonner'
import { useViaCep } from '@/hooks/useViaCep'
import type { PlanoTipo } from '@/types'
import {
  User,
  FileText,
  MapPin,
  Car,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Crown,
  Eye,
  TrendingUp,
  MessageSquare,
  MessageCircle,
  LogOut,
  Check,
  Pencil,
  Save,
  X,
  Headphones,
  Plus,
  Trash2,
  Upload,
  Camera,
  Calendar,
  AlertTriangle,
  Scale
} from 'lucide-react'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const TURNOS = [
  { id: 'manha', label: 'Manhã' },
  { id: 'tarde', label: 'Tarde' },
  { id: 'noite', label: 'Noite' }
] as const;

const planos: { tipo: PlanoTipo; nome: string; preco: number; recursos: string[]; destaque: boolean }[] = [
  {
    tipo: 'premium',
    nome: 'Plano Único - Acesso Completo',
    preco: 49.90,
    recursos: [
      'Acesso Mensal total à plataforma',
      'Perfil aprovado e nas buscas',
      'Receber contatos ilimitados de alunos',
      'Selo "Verificado" de Instrutor',
      'Cadastro de veículos e fotos',
      'Estatísticas e contatos no painel',
      'Suporte direto da equipe',
    ],
    destaque: true,
  }
]

const statusConfig = {
  em_analise: { label: 'Em Análise', icon: Clock, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-600' },
  aprovado: { label: 'Aprovado', icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', iconColor: 'text-green-600' },
  recusado: { label: 'Recusado', icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', iconColor: 'text-red-600' },
  suspenso: { label: 'Suspenso', icon: AlertCircle, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', iconColor: 'text-orange-600' },
}

const SUPORTE_WHATSAPP = '5511999990000'

export default function PainelInstrutorPageClient() {
  const { user, logout, isReady, recarregarInstrutor } = useAuth()
  const { buscarCep, loading: cepLoading } = useViaCep()
  const [tab, setTab] = useState<'perfil' | 'planos' | 'estatisticas' | 'avaliacoes' | 'avisos'>('perfil')
  
  // Mensalidade / Código
  const [codigoAtivacao, setCodigoAtivacao] = useState('')
  const [resgatandoCodigo, setResgatandoCodigo] = useState(false)
  
  // States para Tab Avaliacoes
  const [nomeAlunoAvaliacao, setNomeAlunoAvaliacao] = useState('')
  const [linkAvaliacao, setLinkAvaliacao] = useState('')
  const [linkAvaliacaoCopiado, setLinkAvaliacaoCopiado] = useState(false)

  // Editing states
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [editTelefone, setEditTelefone] = useState('')
  const [editPrecoHora, setEditPrecoHora] = useState('')
  const [editDescricao, setEditDescricao] = useState('')
  const [editCep, setEditCep] = useState('')
  const [editCidade, setEditCidade] = useState('')
  const [editEstado, setEditEstado] = useState('')
  const [editBairro, setEditBairro] = useState('')
  const [editRaioKm, setEditRaioKm] = useState('')
  const [editAceitaVeiculo, setEditAceitaVeiculo] = useState(false)
  const [editCategorias, setEditCategorias] = useState<string[]>([])
  const [editDisponibilidades, setEditDisponibilidades] = useState<{dia_semana: number; turno: 'manha' | 'tarde' | 'noite'}[]>([])
  const [editVeiculos, setEditVeiculos] = useState<{ marca: string; modelo: string; ano: string; cambio: string }[]>([])
  const [respondendoId, setRespondendoId] = useState<string | null>(null)
  const [respostaTexto, setRespostaTexto] = useState('')
  const [salvandoResposta, setSalvandoResposta] = useState(false)

  if (!isReady) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <Navbar />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FACC15]" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!user || !user.instrutor) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <Navbar />
        <div className="pt-32 pb-20 flex items-center justify-center px-4">
          <div className="text-center">
            <AlertCircle className="mx-auto text-neutral-400 mb-4" size={48} />
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="text-neutral-500 mb-6">Faça login para acessar o painel do instrutor.</p>
            <a href="/login" className="bg-[#FACC15] text-neutral-900 px-6 py-3 rounded-xl font-bold hover:bg-[#EAB308] transition-all">
              Fazer Login
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const instrutor = user.instrutor
  const status = statusConfig[instrutor.status]
  const StatusIcon = status.icon

  const isExpirado = !instrutor.plano_expira_em || new Date(instrutor.plano_expira_em) < new Date()
  const diasRestantes = instrutor.plano_expira_em ? Math.max(0, Math.ceil((new Date(instrutor.plano_expira_em).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) : 0

  const inputClass = 'w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 md:py-2.5 text-neutral-900 text-[16px] md:text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 transition-all appearance-none'

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const iniciarEdicao = () => {
    setEditTelefone(instrutor.telefone)
    setEditPrecoHora(String(instrutor.preco_hora))
    setEditDescricao(instrutor.descricao)
    setEditCep(instrutor.localizacao.cep)
    setEditCidade(instrutor.localizacao.cidade)
    setEditEstado(instrutor.localizacao.estado)
    setEditBairro(instrutor.localizacao.bairro)
    setEditRaioKm(String(instrutor.localizacao.raio_km))
    setEditAceitaVeiculo(instrutor.aceita_veiculo_candidato)
    setEditCategorias([...instrutor.categorias])
    setEditDisponibilidades(instrutor.disponibilidades.map(d => ({ dia_semana: d.dia_semana, turno: d.turno as 'manha' | 'tarde' | 'noite' })))
    setEditVeiculos(instrutor.veiculos.map(v => ({ marca: v.marca, modelo: v.modelo, ano: String(v.ano), cambio: v.cambio })))
    setEditando(true)
  }

  const cancelarEdicao = () => {
    setEditando(false)
  }

  const salvarEdicao = async () => {
    setSalvando(true)
    try {
      const perfilOk = await atualizarPerfilInstrutor(instrutor.id, {
        telefone: editTelefone,
        preco_hora: Number(editPrecoHora),
        descricao: editDescricao,
        categorias: editCategorias,
        aceita_veiculo_candidato: editAceitaVeiculo,
      })

      if (!perfilOk) {
        toast.error('Erro ao salvar dados do perfil. Tente novamente.')
        setSalvando(false)
        return
      }

      const locOk = await atualizarLocalizacao(instrutor.id, {
        cep: editCep,
        cidade: editCidade,
        estado: editEstado,
        bairro: editBairro,
        raio_km: Number(editRaioKm),
      })

      if (!locOk) {
        toast.error('Erro ao salvar localização. Tente novamente.')
        setSalvando(false)
        return
      }

      const dispOk = await atualizarDisponibilidades(instrutor.id, editDisponibilidades)
      if (!dispOk) {
        toast.error('Erro ao salvar horários de disponibilidade.')
        setSalvando(false)
        return
      }

      await recarregarInstrutor()
      setEditando(false)
      toast.success('Alterações salvas! Seu perfil será revisado pela equipe antes de aparecer publicamente.')
    } catch {
      toast.error('Erro inesperado ao salvar. Verifique sua conexão e tente novamente.')
    }
    setSalvando(false)
  }

  const handleEditCepChange = async (value: string) => {
    const masked = cepMask(value)
    setEditCep(masked)
    if (masked.length === 9) {
      const data = await buscarCep(masked)
      if (data) {
        setEditCidade(data.localidade)
        setEditEstado(data.uf)
        setEditBairro(data.bairro)
      }
    }
  }

  const toggleEditCategoria = (cat: string) => {
    setEditCategorias(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const addEditVeiculo = () => {
    setEditVeiculos([...editVeiculos, { marca: '', modelo: '', ano: '', cambio: 'manual' }])
  }

  const removeEditVeiculo = (index: number) => {
    if (editVeiculos.length === 1) return
    setEditVeiculos(editVeiculos.filter((_, i) => i !== index))
  }

  const updateEditVeiculo = (index: number, field: string, value: string) => {
    const updated = [...editVeiculos]
    updated[index] = { ...updated[index], [field]: value }
    setEditVeiculos(updated)
  }

  const abrirSuporte = () => {
    const msg = encodeURIComponent(`Olá, sou o instrutor ${instrutor.nome} (${instrutor.email}). Preciso de ajuda com minha conta na Buscar Instrutor.`)
    window.open(`https://wa.me/${SUPORTE_WHATSAPP}?text=${msg}`, '_blank')
  }

  const handleAssinar = () => {
    const msg = encodeURIComponent(`Olá! Sou o instrutor ${instrutor.nome} (${instrutor.email}) e gostaria de assinar o plano único da plataforma Buscar Instrutor.`)
    window.open(`https://wa.me/5531995309630?text=${msg}`, '_blank')
  }

  const handleResgatarCodigo = async () => {
    if (!codigoAtivacao.trim()) {
      toast.error('Digite um código válido.')
      return
    }
    setResgatandoCodigo(true)
    try {
      const res = await aplicarCodigoAtivacao(instrutor.id, codigoAtivacao.trim().toUpperCase())
      if (res.success) {
        toast.success(res.message)
        setCodigoAtivacao('')
        setTimeout(() => window.location.reload(), 2000)
      } else {
        toast.error(res.message)
      }
    } catch {
      toast.error('Erro ao resgatar código. Verifique sua conexão.')
    } finally {
      setResgatandoCodigo(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <div className="pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-5 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative group cursor-pointer">
                <img
                  src={instrutor.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(instrutor.nome)}&background=random`}
                  alt={instrutor.nome}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-neutral-200"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                  <Camera size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const tId = toast.loading('Enviando foto...')
                    const url = await uploadFoto(instrutor.user_id || instrutor.id, file)
                    if (url) {
                      const ok = await atualizarFotoPerfil(instrutor.id, url)
                      if (ok) {
                        toast.success('Foto atualizada!', { id: tId })
                        await recarregarInstrutor()
                      } else {
                        toast.error('Erro ao atualizar foto.', { id: tId })
                      }
                    } else {
                      toast.error('Erro no upload.', { id: tId })
                    }
                  }} />
                </label>
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">{instrutor.nome}</h1>
                <p className="text-neutral-500 text-xs md:text-sm">{instrutor.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <div className={`${status.bg} ${status.border} border rounded-full px-3 py-1 md:px-4 md:py-1.5 flex items-center gap-1.5 md:gap-2`}>
                <StatusIcon className={status.iconColor} size={14} />
                <span className={`text-xs md:text-sm font-semibold ${status.text}`}>{status.label}</span>
              </div>
              <button
                onClick={abrirSuporte}
                className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold hover:bg-green-600 transition-colors"
              >
                <Headphones size={12} /> Suporte
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-neutral-400 hover:text-red-500 transition-colors text-sm"
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          </div>

          {/* Status Banner */}
          {instrutor.status === 'em_analise' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl md:rounded-2xl p-4 md:p-5 mb-4 md:mb-6">
              <div className="flex items-start gap-2.5 md:gap-3">
                <Clock className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <h3 className="font-bold text-amber-800 mb-1 text-sm md:text-base">Seu perfil está em análise</h3>
                  <p className="text-amber-700 text-xs md:text-sm leading-relaxed">
                    Nossa equipe está verificando seus documentos e informações. Esse processo pode levar até 48 horas úteis.
                    Você será notificado por e-mail quando a análise for concluída.
                  </p>
                </div>
              </div>
            </div>
          )}

          {instrutor.status === 'recusado' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={22} />
                <div>
                  <h3 className="font-bold text-red-800 mb-1">Cadastro Recusado</h3>
                  <p className="text-red-700 text-sm leading-relaxed mb-3">
                    {instrutor.motivo_recusa || 'Seu cadastro foi recusado. Entre em contato com o suporte para mais informações.'}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={abrirSuporte}
                      className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                    >
                      <MessageCircle size={14} /> Falar com Suporte
                    </button>
                    <button
                      onClick={async () => {
                        const ok = await solicitarNovaAnalise(instrutor.id)
                        if (ok) {
                          toast.success('Perfil enviado para nova análise!')
                          recarregarInstrutor()
                        } else {
                          toast.error('Erro ao enviar.')
                        }
                      }}
                      className="inline-flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                    >
                      <CheckCircle size={14} /> Solicitar Nova Análise
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {instrutor.status === 'suspenso' && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={22} />
                <div>
                  <h3 className="font-bold text-orange-800 mb-1">Perfil Suspenso</h3>
                  <p className="text-orange-700 text-sm leading-relaxed mb-3">
                    Seu perfil foi suspenso temporariamente. Entre em contato com o suporte para mais detalhes.
                  </p>
                  <button
                    onClick={abrirSuporte}
                    className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-200 transition-colors"
                  >
                    <MessageCircle size={14} /> Falar com Suporte
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Banner de Expiração / Mensalidade */}
          {instrutor.status === 'aprovado' && (
            isExpirado ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={22} />
                  <div>
                    <h3 className="font-bold text-red-800 mb-1">Assinatura Expirada</h3>
                    <p className="text-red-700 text-sm leading-relaxed mb-3">
                      Seu perfil <strong>NÃO</strong> está aparecendo nas buscas devido à falta de pagamento. Renove sua assinatura para voltar a receber alunos da sua região.
                    </p>
                    <button
                      onClick={() => setTab('planos')}
                      className="inline-flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                      <Crown size={14} /> Renovar Agora
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <div>
                    <p className="text-green-800 font-bold text-sm">Perfil Ativo nas Buscas</p>
                    <p className="text-green-700 text-xs">Sua assinatura vence em {diasRestantes} dias.</p>
                  </div>
                </div>
                {diasRestantes <= 5 && (
                  <button onClick={() => setTab('planos')} className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors">
                    Renovar
                  </button>
                )}
              </div>
            )
          )}

          {/* Tabs - Mobile Optimized Scroll */}
          <div className="flex gap-1.5 md:gap-2 bg-neutral-100 rounded-xl p-1.5 mb-4 md:mb-6 overflow-x-auto hide-scrollbar snap-x touch-pan-x">
            {[
              { id: 'perfil' as const, label: 'Perfil', icon: User },
              { id: 'planos' as const, label: 'Planos', icon: Crown },
              { id: 'estatisticas' as const, label: 'Stats', icon: TrendingUp },
              { id: 'avaliacoes' as const, label: 'Avaliações', icon: Star },
              { id: 'avisos' as const, label: 'Avisos', icon: AlertTriangle },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`snap-center flex-shrink-0 flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 rounded-lg text-[13px] md:text-sm font-semibold transition-all active:scale-95 touch-manipulation min-w-[100px] md:min-w-[120px] ${
                  tab === t.id
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50'
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content: Perfil */}
          {tab === 'perfil' && (
            <div className="space-y-6">
              {/* Info Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
                <div className="bg-white border border-neutral-200 rounded-xl p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                    <Star className="text-[#EAB308]" size={16} />
                    <span className="text-xs md:text-sm text-neutral-500">Avaliação</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold">
                    {instrutor.avaliacoes.length > 0
                      ? (instrutor.avaliacoes.reduce((a, b) => a + b.nota, 0) / instrutor.avaliacoes.length).toFixed(1)
                      : '—'
                    }
                  </p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                    <User className="text-blue-500" size={16} />
                    <span className="text-xs md:text-sm text-neutral-500">Alunos</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold">{instrutor.alunos_formados}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                    <Eye className="text-purple-500" size={16} />
                    <span className="text-xs md:text-sm text-neutral-500">Views</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold">{instrutor.visualizacoes}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                    <MessageSquare className="text-green-500" size={16} />
                    <span className="text-xs md:text-sm text-neutral-500">Contatos</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold">{instrutor.contatos?.length || 0}</p>
                </div>
              </div>

              {/* Edit button */}
              {!editando && (
                <div className="flex justify-end">
                  <button
                    onClick={iniciarEdicao}
                    className="flex items-center gap-2 bg-[#FACC15] text-neutral-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#EAB308] transition-all active:scale-95 touch-manipulation"
                  >
                    <Pencil size={16} /> Editar Perfil
                  </button>
                </div>
              )}

              {/* Edit mode banner */}
              {editando && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col md:flex-row items-start gap-2 md:gap-3">
                  <div className="flex items-start gap-2 flex-1">
                    <Pencil className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-blue-800 font-semibold text-xs md:text-sm">Modo de edição ativo</p>
                      <p className="text-blue-700 text-[10px] md:text-xs">Alterações serão revisadas pelo admin.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 w-full md:w-auto">
                    <button onClick={cancelarEdicao} className="flex-1 md:flex-none flex items-center justify-center gap-1 border border-neutral-200 text-neutral-600 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold hover:bg-neutral-50 transition-all active:scale-95 touch-manipulation">
                      <X size={12} /> Cancelar
                    </button>
                    <button onClick={salvarEdicao} disabled={salvando} className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-[#FACC15] text-neutral-900 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold hover:bg-[#EAB308] transition-all disabled:opacity-50 active:scale-95 touch-manipulation">
                      <Save size={12} /> {salvando ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Dicas Gerais */}
              {editando && (
                <div className="bg-[#FACC15]/10 border border-[#FACC15]/30 rounded-xl p-4 md:p-5 flex flex-col gap-2">
                  <h4 className="font-bold text-[#92600e] flex items-center gap-2 text-sm md:text-base">
                    <Star size={16} /> Dicas para atrair mais alunos
                  </h4>
                  <ul className="text-xs md:text-sm text-[#92600e] space-y-1.5 ml-5 list-disc">
                    <li><strong className="font-semibold">Sua Foto Vende:</strong> Ao subir sua foto ali em cima, escolha uma imagem clara, sorridente e profissional.</li>
                    <li><strong className="font-semibold">Seja Específico na Descrição:</strong> Fale sobre sua taxa de aprovação, se atende pessoas com traumas ou seu método didático.</li>
                    <li><strong className="font-semibold">Veículos Claros:</strong> Preencha o status do veículo (Manual/Automático). Alunos buscam muito por essa diferença.</li>
                  </ul>
                </div>
              )}

              {/* Profile Details */}
              <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-[#EAB308]" />
                  Informações do Perfil
                </h3>

                {!editando ? (
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-400 block mb-1">CPF</span>
                      <span className="font-medium">{instrutor.cpf}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-1">Telefone</span>
                      <span className="font-medium">{instrutor.telefone}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-1">Registro SENATRAN</span>
                      <span className="font-medium">{instrutor.registro_senatran}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-1">Categorias</span>
                      <div className="flex gap-1">
                        {instrutor.categorias.map((cat) => (
                          <span key={cat} className="bg-[#FACC15]/10 text-[#92600e] px-2 py-0.5 rounded text-xs font-bold">{cat}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-1">Experiência</span>
                      <span className="font-medium">{instrutor.anos_experiencia} anos</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-1">Preço/hora</span>
                      <span className="font-medium">R$ {instrutor.preco_hora}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-neutral-400 block mb-1">Descrição</span>
                      <span className="font-medium leading-relaxed">{instrutor.descricao}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-neutral-500 mb-1 block">CPF (não editável)</label>
                        <input type="text" value={instrutor.cpf} disabled className={`${inputClass} bg-neutral-50 text-neutral-400`} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-500 mb-1 block">Telefone</label>
                        <input type="text" value={editTelefone} onChange={(e) => setEditTelefone(telefoneMask(e.target.value))} className={inputClass} />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-neutral-500 mb-1 block">Registro SENATRAN (não editável)</label>
                        <input type="text" value={instrutor.registro_senatran} disabled className={`${inputClass} bg-neutral-50 text-neutral-400`} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-500 mb-1 block">Preço/hora (R$)</label>
                        <input type="number" value={editPrecoHora} onChange={(e) => setEditPrecoHora(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 mb-2 block">Categorias</label>
                      <div className="flex flex-wrap gap-2">
                        {['A', 'B', 'C', 'D', 'E'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleEditCategoria(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                              editCategorias.includes(cat)
                                ? 'bg-[#FACC15] text-neutral-900 shadow-sm'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between items-end mb-1">
                        <label className="text-xs font-semibold text-neutral-500 block">Descrição ({editDescricao.length}/500)</label>
                        <span className="text-[10px] text-[#EAB308] font-medium hidden sm:block">Seja persuasivo e humano!</span>
                      </div>
                      <textarea
                        value={editDescricao}
                        onChange={(e) => setEditDescricao(e.target.value.slice(0, 500))}
                        rows={4}
                        placeholder="Ex: Instrutor credenciado pelo Senatran com mais de 8 anos de experiência. Especialista em primeira habilitação e em alunos com trauma de direção. Meu método é focado na paciência e em te dar autonomia real no trânsito."
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-[#EAB308]" />
                  Localização
                </h3>
                {!editando ? (
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-400 block mb-1">Cidade</span>
                      <span className="font-medium">{instrutor.localizacao.cidade} - {instrutor.localizacao.estado}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-1">Bairro</span>
                      <span className="font-medium">{instrutor.localizacao.bairro}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-1">CEP</span>
                      <span className="font-medium">{instrutor.localizacao.cep}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-1">Raio de atendimento</span>
                      <span className="font-medium">{instrutor.localizacao.raio_km} km</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 mb-1 block">CEP</label>
                      <input type="text" value={editCep} onChange={(e) => handleEditCepChange(e.target.value)} className={inputClass} />
                      {cepLoading && <p className="text-[#EAB308] text-xs mt-1">Buscando endereço...</p>}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-neutral-500 mb-1 block">Cidade</label>
                        <input type="text" value={editCidade} readOnly className={`${inputClass} bg-neutral-50`} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-500 mb-1 block">Estado</label>
                        <input type="text" value={editEstado} readOnly className={`${inputClass} bg-neutral-50`} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 mb-1 block">Bairro</label>
                      <input type="text" value={editBairro} readOnly className={`${inputClass} bg-neutral-50`} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-neutral-500 mb-1 block">Raio de atendimento: {editRaioKm} km</label>
                      <input type="range" min="5" max="50" value={editRaioKm} onChange={(e) => setEditRaioKm(e.target.value)} className="w-full accent-[#FACC15]" />
                      <div className="flex justify-between text-xs text-neutral-400 mt-1">
                        <span>5 km</span>
                        <span>50 km</span>
                      </div>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={editAceitaVeiculo} onChange={(e) => setEditAceitaVeiculo(e.target.checked)} className="w-5 h-5 rounded border-neutral-300 text-[#FACC15] focus:ring-[#FACC15]/20" />
                      <span className="text-sm text-neutral-700">Aceito veículo do candidato</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Vehicles */}
              <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
                    <Car size={16} className="text-[#EAB308]" />
                    Veículos
                  </h3>
                  {editando && <span className="text-[10px] md:text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md">Alunos filtram pelo câmbio!</span>}
                </div>
                {!editando ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {instrutor.veiculos.map((v) => (
                      <div key={v.id} className="bg-neutral-50 rounded-xl p-4 flex items-center gap-3">
                        <Car className="text-neutral-400 flex-shrink-0" size={20} />
                        <div>
                          <p className="font-semibold text-sm">{v.marca} {v.modelo}</p>
                          <p className="text-xs text-neutral-500">{v.ano} - {v.cambio === 'manual' ? 'Manual' : 'Automático'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editVeiculos.map((v, i) => (
                      <div key={i} className="bg-neutral-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-500">Veículo {i + 1}</span>
                          {editVeiculos.length > 1 && (
                            <button type="button" onClick={() => removeEditVeiculo(i)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="Marca" value={v.marca} onChange={(e) => updateEditVeiculo(i, 'marca', e.target.value)} className={inputClass} />
                          <input type="text" placeholder="Modelo" value={v.modelo} onChange={(e) => updateEditVeiculo(i, 'modelo', e.target.value)} className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" placeholder="Ano" value={v.ano} onChange={(e) => updateEditVeiculo(i, 'ano', e.target.value)} className={inputClass} />
                          <select value={v.cambio} onChange={(e) => updateEditVeiculo(i, 'cambio', e.target.value)} className={inputClass}>
                            <option value="manual">Manual</option>
                            <option value="automatico">Automático</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEditVeiculo}
                      className="w-full border-2 border-dashed border-neutral-200 rounded-xl py-2.5 text-neutral-400 hover:border-[#FACC15] hover:text-[#EAB308] transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Plus size={16} /> Adicionar veículo
                    </button>
                  </div>
                )}
              </div>

              
              {/* Disponibilidade */}
              <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
                    <Calendar size={16} className="text-[#EAB308]" />
                    Horários de Disponibilidade
                  </h3>
                  {editando && <span className="text-[10px] md:text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-md">Alunos valorizam instrutores flexíveis!</span>}
                </div>
                {!editando ? (
                  <div className="flex flex-wrap gap-2">
                    {instrutor.disponibilidades.length === 0 ? (
                      <p className="text-sm text-neutral-400">Nenhum horário cadastrado</p>
                    ) : (
                      instrutor.disponibilidades.map((d) => (
                        <div key={d.id} className="bg-[#FACC15]/10 text-[#92600e] border border-[#FACC15]/20 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1">
                          <Clock size={14} />
                          {DIAS_SEMANA[d.dia_semana]} - {TURNOS.find(t => t.id === d.turno)?.label}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {DIAS_SEMANA.map((dia, dIdx) => (
                          <div key={dia} className="border border-neutral-200 rounded-xl p-3 bg-neutral-50/50">
                            <p className="text-sm font-bold text-neutral-700 mb-2">{dia}</p>
                            <div className="space-y-2">
                              {TURNOS.map(turno => {
                                const checked = editDisponibilidades.some(d => d.dia_semana === dIdx && d.turno === turno.id)
                                return (
                                  <label key={turno.id} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="checkbox"
                                      className="w-4 h-4 rounded border-neutral-300 text-[#FACC15] focus:ring-[#FACC15]/20"
                                      checked={checked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setEditDisponibilidades([...editDisponibilidades, { dia_semana: dIdx, turno: turno.id }])
                                        } else {
                                          setEditDisponibilidades(editDisponibilidades.filter(d => !(d.dia_semana === dIdx && d.turno === turno.id)))
                                        }
                                      }}
                                    />
                                    <span className="text-sm text-neutral-600">{turno.label}</span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
                  <Shield size={16} className="text-[#EAB308]" />
                  Documentos
                </h3>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-amber-800 text-xs leading-relaxed">
                      Ao enviar ou trocar um documento, seu perfil entrará em análise.
                      O suporte precisará validar e aceitar ou rejeitar o documento.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Documentos obrigatórios */}
                  {(() => {
                    const tiposObrigatorios = [
                      { tipo: 'certificado_senatran', nome: 'Certificado SENATRAN' },
                      { tipo: 'comprovante_residencia', nome: 'Comprovante de Residência' },
                      { tipo: 'cnh', nome: 'CNH (frente e verso)' },
                    ] as const

                    return tiposObrigatorios.map((tipoDoc) => {
                      const docExistente = instrutor.documentos.find(d => d.tipo === tipoDoc.tipo)

                      if (docExistente) {
                        // Documento já enviado — mostrar com status e opção de trocar
                        return (
                          <div key={tipoDoc.tipo} className={`rounded-xl px-4 py-3 border transition-colors ${
                            docExistente.status === 'recusado' ? 'bg-red-50 border-red-200' :
                            docExistente.status === 'pendente' ? 'bg-amber-50 border-amber-200' :
                            'bg-neutral-50 border-neutral-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <FileText className={`flex-shrink-0 ${
                                  docExistente.status === 'recusado' ? 'text-red-400' :
                                  docExistente.status === 'pendente' ? 'text-amber-400' :
                                  'text-green-500'
                                }`} size={18} />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{docExistente.nome_arquivo}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-neutral-400">{tipoDoc.nome}</span>
                                    {docExistente.status === 'aprovado' && (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                                        <CheckCircle size={10} /> Aprovado
                                      </span>
                                    )}
                                    {docExistente.status === 'pendente' && (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                                        <Clock size={10} /> Em análise
                                      </span>
                                    )}
                                    {docExistente.status === 'recusado' && (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                        <XCircle size={10} /> Recusado
                                      </span>
                                    )}
                                  </div>
                                  {docExistente.status === 'recusado' && docExistente.motivo_recusa && (
                                    <p className="text-xs text-red-600 mt-1">Motivo: {docExistente.motivo_recusa}</p>
                                  )}
                                </div>
                              </div>
                              <label className="cursor-pointer bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm flex-shrink-0">
                                🔄 Trocar
                                <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (!file) return
                                  const tId = toast.loading('Enviando novo documento...')
                                  const upload = await uploadDocumento(instrutor.user_id || instrutor.id, file, docExistente.tipo)
                                  if (upload) {
                                    const ok = await atualizarDocumento(docExistente.id, { nome_arquivo: upload.nome_arquivo, url: upload.url })
                                    if (ok) {
                                      await solicitarNovaAnalise(instrutor.id)
                                      toast.success('Documento enviado! Seu perfil entrou em análise para validação.', { id: tId, duration: 5000 })
                                      recarregarInstrutor()
                                    } else {
                                      toast.error('Erro ao atualizar!', { id: tId })
                                    }
                                  } else {
                                    toast.error('Erro no upload!', { id: tId })
                                  }
                                }} />
                              </label>
                            </div>
                          </div>
                        )
                      }

                      // Documento NÃO enviado — mostrar upload
                      return (
                        <div key={tipoDoc.tipo} className="rounded-xl px-4 py-3 border-2 border-dashed border-neutral-200 hover:border-[#FACC15] transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Upload className="text-neutral-300" size={18} />
                              <div>
                                <p className="text-sm font-medium text-neutral-500">{tipoDoc.nome}</p>
                                <p className="text-xs text-red-400 font-semibold">Obrigatório — não enviado</p>
                              </div>
                            </div>
                            <label className="cursor-pointer bg-[#FACC15] text-neutral-900 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs font-bold hover:bg-[#EAB308] transition-colors shadow-sm flex-shrink-0">
                              Enviar
                              <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const tId = toast.loading('Enviando documento...')
                                const upload = await uploadDocumento(instrutor.user_id || instrutor.id, file, tipoDoc.tipo)
                                if (upload) {
                                  const ok = await criarDocumento(instrutor.id, {
                                    tipo: tipoDoc.tipo,
                                    nome_arquivo: upload.nome_arquivo,
                                    url: upload.url,
                                  })
                                  if (ok) {
                                    await solicitarNovaAnalise(instrutor.id)
                                    toast.success('Documento enviado! Aguardando validação do suporte.', { id: tId, duration: 5000 })
                                    recarregarInstrutor()
                                  } else {
                                    toast.error('Erro ao salvar documento!', { id: tId })
                                  }
                                } else {
                                  toast.error('Erro no upload!', { id: tId })
                                }
                              }} />
                            </label>
                          </div>
                        </div>
                      )
                    })
                  })()}

                  {/* Documentos extras (foto_veiculo, etc) que não são obrigatórios */}
                  {instrutor.documentos
                    .filter(d => !['certificado_senatran', 'comprovante_residencia', 'cnh'].includes(d.tipo))
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-200">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FileText className="text-neutral-400 flex-shrink-0" size={18} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{doc.nome_arquivo}</p>
                            <p className="text-xs text-neutral-400">
                              {doc.tipo === 'foto_veiculo' ? 'Foto do Veículo' : doc.tipo}
                            </p>
                          </div>
                        </div>
                        {doc.status === 'aprovado' && <CheckCircle className="text-green-500 flex-shrink-0" size={16} />}
                        {doc.status === 'pendente' && <Clock className="text-amber-500 flex-shrink-0" size={16} />}
                        {doc.status === 'recusado' && <XCircle className="text-red-500 flex-shrink-0" size={16} />}
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Save bar at bottom when editing */}
              {editando && (
                <div className="flex justify-end gap-3">
                  <button onClick={cancelarEdicao} className="flex items-center gap-2 border border-neutral-200 text-neutral-600 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-colors">
                    <X size={16} /> Cancelar
                  </button>
                  <button onClick={salvarEdicao} disabled={salvando} className="flex items-center gap-2 bg-[#FACC15] text-neutral-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#EAB308] transition-colors disabled:opacity-50">
                    <Save size={16} /> {salvando ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Planos */}
          {tab === 'planos' && (
            <div>
              <div className="text-center mb-5 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-1.5 md:mb-2">Assinatura Mensal</h2>
                <p className="text-neutral-500 text-sm md:text-base">O nosso plano único oferece acesso completo a todas as ferramentas.</p>
                <p className="text-neutral-400 text-xs md:text-sm mt-1">Mantenha seu perfil ativo e receba alunos da sua região.</p>
              </div>

              <div className="flex justify-center max-w-lg mx-auto">
                {planos.map((plano) => {
                  const isCurrentPlan = instrutor.plano === plano.tipo
                  return (
                    <div
                      key={plano.tipo}
                      className={`relative bg-white border-2 rounded-xl md:rounded-2xl p-4 md:p-6 transition-all w-full ${
                        plano.destaque
                          ? 'border-[#FACC15] shadow-[0_0_40px_-10px_rgba(250,204,21,0.6)] ring-4 ring-[#FACC15]/20 scale-105'
                          : isCurrentPlan
                            ? 'border-green-400'
                            : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {plano.destaque && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FACC15] text-neutral-900 px-3 py-0.5 rounded-full text-xs font-bold">
                          Mais Popular
                        </div>
                      )}
                      {isCurrentPlan && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-0.5 rounded-full text-xs font-bold">
                          Plano Atual
                        </div>
                      )}

                      <div className="text-center mb-5 pt-2">
                        <Crown className="mx-auto text-[#EAB308] mb-2" size={28} />
                        <h3 className="font-bold text-lg">{plano.nome}</h3>
                        <div className="mt-2">
                          <span className="text-sm text-neutral-400">R$</span>
                          <span className="text-3xl font-bold">{plano.preco.toFixed(2).split('.')[0]}</span>
                          <span className="text-sm text-neutral-400">,{plano.preco.toFixed(2).split('.')[1]}/mês</span>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {plano.recursos.map((recurso) => (
                          <li key={recurso} className="flex items-start gap-2 text-sm">
                            <Check className="text-green-500 flex-shrink-0 mt-0.5" size={14} />
                            <span className="text-neutral-600">{recurso}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleAssinar()}
                        disabled={isCurrentPlan}
                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                          isCurrentPlan
                            ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                            : plano.destaque
                              ? 'bg-[#FACC15] text-neutral-900 hover:bg-[#EAB308] shadow-lg shadow-yellow-400/20'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        } disabled:opacity-50`}
                      >
                        {isCurrentPlan ? 'Plano Atual' : (
                          <>
                            <MessageSquare size={16} />
                            Continuar no WhatsApp
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Área de Resgate de Código */}
              <div className="max-w-lg mx-auto mt-8 bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
                <h3 className="font-bold text-neutral-800 mb-2 flex items-center gap-2">
                  <Crown size={18} className="text-[#FACC15]" /> Já tem um código de ativação?
                </h3>
                <p className="text-sm text-neutral-500 mb-4">Insira o código fornecido pelo suporte para liberar seu plano.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codigoAtivacao}
                    onChange={(e) => setCodigoAtivacao(e.target.value)}
                    placeholder="Ex: VOLTZ-XXXX-XXXX"
                    className="flex-1 bg-white border border-neutral-300 rounded-xl px-4 py-2 text-sm uppercase focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20"
                  />
                  <button
                    onClick={handleResgatarCodigo}
                    disabled={resgatandoCodigo || !codigoAtivacao.trim()}
                    className="bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    {resgatandoCodigo ? 'Aguarde...' : 'Resgatar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Estatísticas */}
          {tab === 'estatisticas' && (
            <div className="space-y-4 md:space-y-6">
              <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                <h3 className="font-bold text-base md:text-lg mb-4 md:mb-6">Resumo Total</h3>
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  <div className="text-center">
                    <Eye className="mx-auto text-purple-500 mb-1.5" size={20} />
                    <p className="text-xl md:text-3xl font-bold">{instrutor.visualizacoes}</p>
                    <p className="text-[10px] md:text-sm text-neutral-500">Views</p>
                  </div>
                  <div className="text-center">
                    <MessageSquare className="mx-auto text-green-500 mb-1.5" size={20} />
                    <p className="text-xl md:text-3xl font-bold">{instrutor.contatos?.length || 0}</p>
                    <p className="text-[10px] md:text-sm text-neutral-500">Contatos</p>
                  </div>
                  <div className="text-center">
                    <Star className="mx-auto text-[#EAB308] mb-1.5" size={20} />
                    <p className="text-xl md:text-3xl font-bold">{instrutor.avaliacoes.length}</p>
                    <p className="text-[10px] md:text-sm text-neutral-500">Avaliações</p>
                  </div>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Últimas Avaliações</h3>
                {instrutor.avaliacoes.length === 0 ? (
                  <p className="text-neutral-400 text-sm">Nenhuma avaliação recebida ainda.</p>
                ) : (
                  <div className="space-y-4">
                    {instrutor.avaliacoes.map((av) => (
                      <div key={av.id} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{av.nome_aluno}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < av.nota ? 'text-[#EAB308] fill-[#EAB308]' : 'text-neutral-200'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-neutral-600 mb-1">{av.comentario}</p>
                        {av.resposta_instrutor ? (
                          <div className="bg-neutral-50 rounded-lg px-3 py-2 mt-2 border-l-2 border-[#FACC15]">
                            <p className="text-xs text-neutral-400 font-semibold mb-0.5">Sua resposta:</p>
                            <p className="text-xs text-neutral-600">{av.resposta_instrutor}</p>
                          </div>
                        ) : respondendoId === av.id ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={respostaTexto}
                              onChange={(e) => setRespostaTexto(e.target.value)}
                              placeholder="Escreva sua resposta..."
                              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  if (!respostaTexto.trim()) return
                                  setSalvandoResposta(true)
                                  try {
                                    // Update local state
                                    const avAtualizada = instrutor.avaliacoes.map(a =>
                                      a.id === av.id ? { ...a, resposta_instrutor: respostaTexto.trim() } : a
                                    )
                                    instrutor.avaliacoes = avAtualizada
                                    toast.success('Resposta enviada!')
                                    setRespondendoId(null)
                                    setRespostaTexto('')
                                  } catch {
                                    toast.error('Erro ao enviar resposta')
                                  } finally {
                                    setSalvandoResposta(false)
                                  }
                                }}
                                disabled={salvandoResposta || !respostaTexto.trim()}
                                className="bg-[#FACC15] text-neutral-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#EAB308] transition-all disabled:opacity-50"
                              >
                                {salvandoResposta ? 'Enviando...' : 'Enviar'}
                              </button>
                              <button
                                onClick={() => { setRespondendoId(null); setRespostaTexto('') }}
                                className="text-neutral-400 px-3 py-1.5 rounded-lg text-xs hover:text-neutral-600 transition-all"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setRespondendoId(av.id); setRespostaTexto('') }}
                            className="mt-2 text-xs text-[#EAB308] hover:text-amber-600 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <MessageCircle size={12} /> Responder
                          </button>
                        )}
                        <p className="text-xs text-neutral-400 mt-1">{new Date(av.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: AVALIACOES */}
          {tab === 'avaliacoes' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl md:text-2xl font-bold mb-2">Solicitar Avaliação</h2>
                <p className="text-neutral-500 text-sm md:text-base mb-6">
                  Envie um link único para seus alunos recém-formados avaliarem suas aulas. O depoimento deles ficará visível publicamente no seu perfil!
                </p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-amber-800 text-sm font-bold mb-1">Atenção à Política Antifraude</p>
                      <p className="text-amber-700 text-xs md:text-sm leading-relaxed">
                        Nosso sistema conta com auditoria inteligente. Não crie links para se auto-avaliar de forma fraudulenta. Perfis detectados inflando nota artificialmente são **banidos permanentemente** da plataforma. Mande o link apenas para alunos reais.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                  <div className="flex-1 w-full">
                     <label className="text-sm font-semibold text-neutral-700 block mb-2">Nome Completo do Aluno</label>
                     <input 
                       type="text" 
                       value={nomeAlunoAvaliacao}
                       onChange={(e) => {
                         setNomeAlunoAvaliacao(e.target.value)
                         setLinkAvaliacao('')
                       }}
                       placeholder="Ex: João Marcelo da Silva"
                       className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20"
                     />
                  </div>
                  <button
                    onClick={() => {
                      if (!nomeAlunoAvaliacao.trim() || nomeAlunoAvaliacao.trim().split(' ').length < 2) {
                        toast.error('Digite o nome e sobrenome do aluno para gerar o link profissional!')
                        return
                      }
                      const payload = btoa(JSON.stringify({ i: instrutor.id, n: nomeAlunoAvaliacao.trim() }))
                      const url = `${window.location.origin}/avaliar/${payload}`
                      setLinkAvaliacao(url)
                    }}
                    className="bg-[#FACC15] text-neutral-900 px-6 py-3 rounded-xl font-bold whitespace-nowrap hover:bg-[#EAB308] w-full md:w-auto shadow-sm transition-all"
                  >
                     Criar Link Único
                  </button>
                </div>

                {linkAvaliacao && (
                  <div className="mt-6 p-4 md:p-5 border border-green-200 bg-green-50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                     <p className="text-green-800 text-sm font-bold mb-2">Link gerado com sucesso!</p>
                     <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                       <input type="text" readOnly value={linkAvaliacao} className="w-full bg-white border border-green-200 rounded-lg md:rounded-xl px-4 py-2.5 text-sm md:text-base text-neutral-600 outline-none truncate" />
                       <button 
                         onClick={() => {
                           navigator.clipboard.writeText(linkAvaliacao)
                           setLinkAvaliacaoCopiado(true)
                           toast.success('Link copiado para área de transferência!')
                           setTimeout(() => setLinkAvaliacaoCopiado(false), 2000)
                         }}
                         className="bg-green-600 text-white px-6 py-2.5 rounded-lg md:rounded-xl text-sm font-bold hover:bg-green-700 transition shadow-sm w-full sm:w-auto"
                       >
                         {linkAvaliacaoCopiado ? 'Copiado!' : 'Copiar'}
                       </button>
                     </div>
                     <p className="text-green-700/90 mt-3 text-xs md:text-sm">
                       Envie este link no WhatsApp do <strong>{nomeAlunoAvaliacao}</strong>. Quando preenchido, a nota aparecerá abaixo em tempo real!
                     </p>
                  </div>
                )}
              </div>

              {/* Lista de Avaliacoes Existentes na Plataforma */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm mt-6">
                <h2 className="text-lg md:text-xl font-bold mb-4">Minhas Avaliações Recebidas ({instrutor.avaliacoes.length})</h2>
                {instrutor.avaliacoes.length === 0 ? (
                  <div className="text-center py-12 px-4 border-2 border-dashed border-neutral-100 rounded-xl">
                    <Star size={32} className="mx-auto text-neutral-300 mb-3" />
                    <p className="text-neutral-500 text-sm md:text-base mb-1">Você ainda não recebeu nenhuma avaliação.</p>
                    <p className="text-neutral-400 text-xs">Crie um link de avaliação acima e comece a construir sua reputação!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {instrutor.avaliacoes.map(av => (
                      <div key={av.id} className="border border-neutral-100 rounded-xl p-4 md:p-5 bg-neutral-50/50">
                        <div className="flex items-start md:items-center justify-between mb-3 flex-col md:flex-row gap-2">
                           <div className="flex gap-3 items-center">
                             <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                               {av.nome_aluno.charAt(0).toUpperCase()}
                             </div>
                             <div>
                               <span className="font-bold text-sm block">{av.nome_aluno}</span>
                               <span className="text-neutral-400 text-xs block">{new Date(av.created_at).toLocaleDateString('pt-BR')}</span>
                             </div>
                           </div>
                           <div className="flex text-[#FACC15] items-center bg-white px-3 py-1.5 rounded-full border border-neutral-100 shadow-sm">
                             <Star size={14} className="fill-[#FACC15]" /> 
                             <span className="text-neutral-900 ml-1.5 text-xs font-bold">Nota {av.nota}.0</span>
                           </div>
                        </div>
                        <p className="text-neutral-600 text-sm leading-relaxed pb-1">{av.comentario}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: AVISOS E REGRAS */}
          {tab === 'avisos' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                    <Scale size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">Penalidades e Regras da Buscar Instrutor</h2>
                    <p className="text-neutral-500 text-sm">Política de boa conduta no uso da plataforma.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 md:p-6">
                    <h3 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                      <AlertTriangle size={18} /> Divergência de Preços
                    </h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      É <strong>estritamente proibido</strong> anunciar um valor por hora no seu perfil da Buscar Instrutor (ex: R$ 40) e, quando o aluno entrar em contato via WhatsApp, cobrar um valor maior (ex: R$ 70).
                      <br/><br/>
                      <strong>Punição:</strong> Bloqueio temporário (15 dias). Em caso de reincidência, banimento permanente.
                    </p>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 md:p-6">
                    <h3 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                      <Star size={18} /> Avaliações Falsas e Spam
                    </h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      O uso da ferramenta &quot;Solicitar Avaliação&quot; para inflar a própria nota (gerar links e mandar para perfis fakes ou preencher de casa) será detectado por nossa auditoria de IP e dispositivo geolocalizado.
                      <br/><br/>
                      <strong>Punição:</strong> Reset de avaliações a 0 e banimento imediato sem aviso prévio.
                    </p>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 md:p-6">
                    <h3 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                      <Shield size={18} /> Assédio e Má Conduta
                    </h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      Denúncias realizadas por alunos referentes a assédio moral/sexual, comportamentos agressivos ou discriminatórios durante as aulas ou prospecção no WhatsApp.
                      <br/><br/>
                      <strong>Punição:</strong> Encerramento da conta e banimento eterno, com possível denúncia das informações cadastradas (CPF/Registro) aos órgãos legais.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
