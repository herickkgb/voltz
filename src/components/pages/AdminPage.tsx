'use client'

import { useState, useMemo, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { getTodosInstrutores, atualizarStatusInstrutor, atualizarStatusDocumento, estenderPlanoManualmente } from '@/lib/db'
import { toast } from 'sonner'
import type { Instrutor, StatusInstrutor } from '@/types'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, Legend } from 'recharts'
import {
  Shield,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  MessageCircle,
  Star,
  FileText,
  Car,
  LogOut,
  X,
  Crown,
  MousePointerClick,
  Activity,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react'

const statusConfig: Record<StatusInstrutor, { label: string; color: string; bg: string; border: string; text: string }> = {
  em_analise: { label: 'Em Análise', color: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  aprovado: { label: 'Aprovado', color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  recusado: { label: 'Recusado', color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  suspenso: { label: 'Suspenso', color: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
}

const statusIcons: Record<StatusInstrutor, typeof Clock> = {
  em_analise: Clock,
  aprovado: CheckCircle,
  recusado: XCircle,
  suspenso: AlertCircle,
}

export default function AdminPageClient() {
  const { user, logout, isAdmin, isReady } = useAuth()
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<StatusInstrutor | 'todos'>('todos')
  const [filtroAssinatura, setFiltroAssinatura] = useState<'todos' | 'ativas' | 'expiradas'>('todos')
  const [filtroPlano, setFiltroPlano] = useState<'todos' | 'premium' | 'basico'>('todos')
  const [paginaAtual, setPaginaAtual] = useState(1)
  const itensPorPagina = 10

  const [abaAtiva, setAbaAtiva] = useState<'gerenciamento' | 'estatisticas'>('gerenciamento')
  const [tipoGrafico, setTipoGrafico] = useState<'linha' | 'pizza'>('pizza')

  const [instrutorSelecionado, setInstrutorSelecionado] = useState<Instrutor | null>(null)
  const [motivoRecusa, setMotivoRecusa] = useState('')
  const [showRecusarModal, setShowRecusarModal] = useState(false)
  const [instrutores, setInstrutores] = useState<Instrutor[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregarInstrutores = () => {
    getTodosInstrutores()
      .then(data => {
        setInstrutores(data)
        setCarregando(false)
        // Update selected instructor if viewing one
        if (instrutorSelecionado) {
          const atualizado = data.find(i => i.id === instrutorSelecionado.id)
          if (atualizado) setInstrutorSelecionado(atualizado)
        }
      })
      .catch(() => {
        toast.error('Erro ao carregar instrutores. Verifique sua conexão.')
        setCarregando(false)
      })
  }

  useEffect(() => {
    carregarInstrutores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const instrutoresFiltrados = useMemo(() => {
    return instrutores.filter((i) => {
      const termoBusca = busca.toLowerCase()
      const cnpjOuCpfLimpo = termoBusca.replace(/\D/g, '')

      const matchBusca = !busca || 
        i.nome.toLowerCase().includes(termoBusca) ||
        i.email.toLowerCase().includes(termoBusca) ||
        i.localizacao.cidade.toLowerCase().includes(termoBusca) ||
        (i.cpf && i.cpf.replace(/\D/g, '').includes(cnpjOuCpfLimpo) && cnpjOuCpfLimpo.length > 3) ||
        (i.cnpj && i.cnpj.replace(/\D/g, '').includes(cnpjOuCpfLimpo) && cnpjOuCpfLimpo.length > 3)

      const matchStatus = filtroStatus === 'todos' || i.status === filtroStatus
      
      const isExpirado = !i.plano_expira_em || new Date(i.plano_expira_em) < new Date()
      const matchAssinatura = filtroAssinatura === 'todos' || 
        (filtroAssinatura === 'ativas' && !isExpirado) || 
        (filtroAssinatura === 'expiradas' && isExpirado)

      const matchPlano = filtroPlano === 'todos' || i.plano === filtroPlano

      return matchBusca && matchStatus && matchAssinatura && matchPlano
    })
  }, [instrutores, busca, filtroStatus, filtroAssinatura, filtroPlano])

  // Paginação
  const totalPaginas = Math.ceil(instrutoresFiltrados.length / itensPorPagina)
  const instrutoresPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina
    return instrutoresFiltrados.slice(inicio, inicio + itensPorPagina)
  }, [instrutoresFiltrados, paginaAtual])

  useEffect(() => {
    setPaginaAtual(1)
  }, [busca, filtroStatus, filtroAssinatura, filtroPlano])

  const contadores = useMemo(() => {
    const totalAcessos = instrutores.reduce((acc, i) => acc + (i.visualizacoes || 0), 0)
    const totalWhatsApp = instrutores.reduce((acc, i) => acc + (i.whatsapp_clicks || 0), 0)
    
    // Dados para gráfico de cadastros
    const mesesObj: Record<string, number> = {}
    instrutores.forEach(i => {
      const date = new Date(i.created_at)
      if (!isNaN(date.getTime())) {
        const mesAno = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        mesesObj[mesAno] = (mesesObj[mesAno] || 0) + 1
      }
    })
    const dadosCadastros = Object.entries(mesesObj).map(([name, total]) => ({ name, total }))

    return {
      total: instrutores.length,
      em_analise: instrutores.filter((i) => i.status === 'em_analise').length,
      aprovado: instrutores.filter((i) => i.status === 'aprovado').length,
      recusado: instrutores.filter((i) => i.status === 'recusado').length,
      suspenso: instrutores.filter((i) => i.status === 'suspenso').length,
      totalAcessos,
      totalWhatsApp,
      dadosCadastros,
      dadosPizza: [
        { name: 'Aprovados', value: instrutores.filter((i) => i.status === 'aprovado').length, color: '#22c55e' },
        { name: 'Em Análise', value: instrutores.filter((i) => i.status === 'em_analise').length, color: '#f59e0b' },
        { name: 'Suspensos', value: instrutores.filter((i) => i.status === 'suspenso').length, color: '#f97316' },
        { name: 'Recusados', value: instrutores.filter((i) => i.status === 'recusado').length, color: '#ef4444' }
      ].filter(d => d.value > 0)
    }
  }, [instrutores])

  if (!isReady || carregando) {
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

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <Navbar />
        <div className="pt-32 pb-20 flex items-center justify-center px-4">
          <div className="text-center">
            <Shield className="mx-auto text-neutral-400 mb-4" size={48} />
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="text-neutral-500 mb-6">Área exclusiva para administradores.</p>
            <a href="/login" className="bg-[#FACC15] text-neutral-900 px-6 py-3 rounded-xl font-bold hover:bg-[#EAB308] transition-all">
              Fazer Login
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const handleAprovar = async (id: string) => {
    const nome = instrutores.find(i => i.id === id)?.nome.split(' ')[0] || 'Instrutor'
    try {
      const ok = await atualizarStatusInstrutor(id, 'aprovado')
      if (!ok) {
        toast.error(`Erro ao aprovar ${nome}. Tente novamente.`)
        return
      }
      setInstrutores((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: 'aprovado' as StatusInstrutor, motivo_recusa: undefined } : i))
      )
      if (instrutorSelecionado?.id === id) {
        setInstrutorSelecionado({ ...instrutorSelecionado, status: 'aprovado', motivo_recusa: undefined })
      }
      toast.success(`${nome} foi aprovado com sucesso!`)
    } catch {
      toast.error(`Erro ao aprovar ${nome}. Verifique sua conexão.`)
    }
  }

  const handleRecusar = async (id: string) => {
    if (!motivoRecusa.trim()) {
      toast.error('Informe o motivo da recusa.')
      return
    }
    const nome = instrutores.find(i => i.id === id)?.nome.split(' ')[0] || 'Instrutor'
    try {
      const ok = await atualizarStatusInstrutor(id, 'recusado', motivoRecusa)
      if (!ok) {
        toast.error(`Erro ao recusar ${nome}. Tente novamente.`)
        return
      }
      setInstrutores((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: 'recusado' as StatusInstrutor, motivo_recusa: motivoRecusa } : i))
      )
      if (instrutorSelecionado?.id === id) {
        setInstrutorSelecionado({ ...instrutorSelecionado, status: 'recusado', motivo_recusa: motivoRecusa })
      }
      setShowRecusarModal(false)
      setMotivoRecusa('')
      toast.success(`${nome} foi recusado. O instrutor será notificado.`)
    } catch {
      toast.error(`Erro ao recusar ${nome}. Verifique sua conexão.`)
    }
  }

  const handleSuspender = async (id: string) => {
    const nome = instrutores.find(i => i.id === id)?.nome.split(' ')[0] || 'Instrutor'
    try {
      const ok = await atualizarStatusInstrutor(id, 'suspenso')
      if (!ok) {
        toast.error(`Erro ao suspender ${nome}. Tente novamente.`)
        return
      }
      setInstrutores((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: 'suspenso' as StatusInstrutor } : i))
      )
      if (instrutorSelecionado?.id === id) {
        setInstrutorSelecionado({ ...instrutorSelecionado, status: 'suspenso' })
      }
      toast.success(`${nome} foi suspenso da plataforma.`)
    } catch {
      toast.error(`Erro ao suspender ${nome}. Verifique sua conexão.`)
    }
  }

  const handleEstenderPlano = async (id: string) => {
    try {
      const ok = await estenderPlanoManualmente(id, 30)
      if (!ok) {
        toast.error('Erro ao estender plano.')
        return
      }
      toast.success('+30 dias adicionados com sucesso!')
      carregarInstrutores()
    } catch {
      toast.error('Erro de conexão ao estender plano.')
    }
  }

  const abrirWhatsApp = (telefone: string, nome: string) => {
    const numero = telefone.replace(/\D/g, '')
    const mensagem = encodeURIComponent(`Olá ${nome}, aqui é a equipe Buscar Instrutor. `)
    window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank')
  }

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <div className="pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-5 md:mb-8">
            <div>
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Shield className="text-[#EAB308]" size={20} />
                Painel Administrativo
              </h1>
              <p className="text-neutral-500 text-xs md:text-sm">Gerencie instrutores da plataforma</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-neutral-200 shadow-sm w-full sm:w-auto overflow-x-auto">
               <button
                 onClick={() => setAbaAtiva('gerenciamento')}
                 className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none ${abaAtiva === 'gerenciamento' ? 'bg-[#FACC15] text-neutral-900 shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'}`}
               >
                 Instrutores
               </button>
               <button
                 onClick={() => setAbaAtiva('estatisticas')}
                 className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex-1 sm:flex-none ${abaAtiva === 'estatisticas' ? 'bg-[#FACC15] text-neutral-900 shadow-sm' : 'text-neutral-500 hover:bg-neutral-50'}`}
               >
                 Estatísticas
               </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-neutral-400 hover:text-red-500 transition-colors text-sm ml-auto sm:ml-0"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>

          {abaAtiva === 'gerenciamento' && (
            <>
              {/* Stats Counters */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3 mb-4 md:mb-6">
            <button
              onClick={() => setFiltroStatus('todos')}
              className={`bg-white border rounded-xl p-2.5 md:p-4 text-center transition-all ${
                filtroStatus === 'todos' ? 'border-[#FACC15] shadow-md' : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <Users className="mx-auto text-neutral-400 mb-0.5" size={16} />
              <p className="text-lg md:text-2xl font-bold">{contadores.total}</p>
              <p className="text-[10px] md:text-xs text-neutral-500">Total</p>
            </button>
            {(Object.entries(statusConfig) as [StatusInstrutor, typeof statusConfig.em_analise][]).map(([key, config]) => {
              const Icon = statusIcons[key]
              return (
                <button
                  key={key}
                  onClick={() => setFiltroStatus(key)}
                  className={`bg-white border rounded-xl p-2.5 md:p-4 text-center transition-all ${
                    filtroStatus === key ? `${config.border} shadow-md` : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <Icon className={`mx-auto ${config.text} mb-0.5`} size={16} />
                  <p className="text-lg md:text-2xl font-bold">{contadores[key]}</p>
                  <p className="text-[10px] md:text-xs text-neutral-500">{config.label}</p>
                </button>
              )
            })}
          </div>


          {/* Advanced Search & Filters */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail, CPF, CNPJ ou cidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 transition-all font-medium"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                <select
                  value={filtroAssinatura}
                  onChange={(e) => setFiltroAssinatura(e.target.value as 'todos' | 'ativas' | 'expiradas')}
                  className="w-full sm:w-auto bg-white border border-neutral-200 rounded-xl pl-9 pr-8 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#FACC15] font-medium appearance-none"
                >
                  <option value="todos">Vencimento (Todos)</option>
                  <option value="ativas">Em Dia (Ativas)</option>
                  <option value="expiradas">Expiradas (Vencidas)</option>
                </select>
              </div>
              <div className="relative">
                <Crown className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                <select
                  value={filtroPlano}
                  onChange={(e) => setFiltroPlano(e.target.value as 'todos' | 'premium' | 'basico')}
                  className="w-full sm:w-auto bg-white border border-neutral-200 rounded-xl pl-9 pr-8 py-2.5 md:py-3 text-sm focus:outline-none focus:border-[#FACC15] font-medium appearance-none"
                >
                  <option value="todos">Planos (Todos)</option>
                  <option value="premium">Premium / Acesso Único</option>
                  <option value="basico">Gratuito / Básico</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/50">
                    <th className="text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest px-5 py-3.5">Instrutor</th>
                    <th className="text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest px-4 py-3.5 hidden sm:table-cell">CPF / CNPJ</th>
                    <th className="text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest px-4 py-3.5 hidden md:table-cell">Cidade</th>
                    <th className="text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest px-4 py-3.5">Status</th>
                    <th className="text-left text-[11px] font-bold text-neutral-500 uppercase tracking-widest px-4 py-3.5 hidden lg:table-cell">Validade</th>
                    <th className="text-right text-[11px] font-bold text-neutral-500 uppercase tracking-widest px-5 py-3.5">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {instrutoresPaginados.map((instrutor) => {
                    const stConfig = statusConfig[instrutor.status]
                    const StIcon = statusIcons[instrutor.status]
                    return (
                      <tr key={instrutor.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={instrutor.foto_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{instrutor.nome}</p>
                              <p className="text-xs text-neutral-400 truncate">{instrutor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-sm font-medium text-neutral-600">{instrutor.cnpj || instrutor.cpf || 'Não informado'}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-neutral-600">{instrutor.localizacao.cidade}-{instrutor.localizacao.estado}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 ${stConfig.bg} ${stConfig.border} border rounded-full px-2.5 py-0.5 text-xs font-semibold ${stConfig.text}`}>
                            <StIcon size={12} />
                            {stConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`text-sm font-medium ${!instrutor.plano_expira_em || new Date(instrutor.plano_expira_em) < new Date() ? 'text-red-500' : 'text-green-600'}`}>
                            {instrutor.plano_expira_em ? new Date(instrutor.plano_expira_em).toLocaleDateString('pt-BR') : 'Expirado'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setInstrutorSelecionado(instrutor)}
                              className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalhes"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => abrirWhatsApp(instrutor.telefone, instrutor.nome.split(' ')[0])}
                              className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle size={16} />
                            </button>
                            {(instrutor.status === 'em_analise' || instrutor.status === 'recusado') && (
                              <button
                                onClick={() => handleAprovar(instrutor.id)}
                                className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Aprovar"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            {instrutor.status !== 'recusado' && (
                              <button
                                onClick={() => {
                                  setInstrutorSelecionado(instrutor)
                                  setShowRecusarModal(true)
                                }}
                                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Recusar"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {instrutoresFiltrados.length === 0 && (
              <div className="py-12 text-center">
                <Users className="mx-auto text-neutral-300 mb-3" size={40} />
                <p className="text-neutral-500">Nenhum instrutor encontrado com estes filtros.</p>
              </div>
            )}
            
            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="border-t border-neutral-100 bg-neutral-50/30 px-5 py-4 flex items-center justify-between">
                <span className="text-sm text-neutral-500 hidden sm:block">
                  Mostrando <span className="font-semibold text-neutral-900">{((paginaAtual - 1) * itensPorPagina) + 1}</span> a <span className="font-semibold text-neutral-900">{Math.min(paginaAtual * itensPorPagina, instrutoresFiltrados.length)}</span> de <span className="font-semibold text-neutral-900">{instrutoresFiltrados.length}</span> resultados
                </span>
                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3">
                  <button
                    onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                    disabled={paginaAtual === 1}
                    className="px-3 py-1.5 border border-neutral-200 text-neutral-600 hover:bg-white bg-neutral-50 rounded-lg disabled:opacity-50 transition-all flex items-center shadow-sm"
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <span className="text-sm font-bold px-2">{paginaAtual} / {totalPaginas}</span>
                  <button
                    onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className="px-3 py-1.5 border border-neutral-200 text-neutral-600 hover:bg-white bg-neutral-50 rounded-lg disabled:opacity-50 transition-all flex items-center shadow-sm"
                  >
                    Próxima <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
            </>
          )}

          {abaAtiva === 'estatisticas' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                   <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
                     <Activity className="text-green-500" size={20} /> Total de Acessos
                   </h3>
                   <div className="text-4xl font-black text-neutral-900 mb-2">{contadores.totalAcessos}</div>
                   <p className="text-sm text-neutral-500">Visualizações gerais em todos os perfis ativos na plataforma em tempo real.</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                   <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
                     <MessageCircle className="text-green-600" size={20} /> Cliques de WhatsApp
                   </h3>
                   <div className="text-4xl font-black text-green-600 mb-2">{contadores.totalWhatsApp}</div>
                   <p className="text-sm text-neutral-500">Número de alunos que ativamente tentaram contatar instrutores pelo WhatsApp.</p>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="border-b border-neutral-100 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-lg">Visão Gráfica</h3>
                    <p className="text-sm text-neutral-500">Acompanhamento dos instrutores cadastrados</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-neutral-100 p-1.5 rounded-xl self-stretch md:self-auto">
                    <button
                      onClick={() => setTipoGrafico('pizza')}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tipoGrafico === 'pizza' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                      <PieChartIcon size={16} /> Pizza
                    </button>
                    <button
                      onClick={() => setTipoGrafico('linha')}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tipoGrafico === 'linha' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                      <LineChartIcon size={16} /> Linha
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-8 h-[400px] w-full flex items-center justify-center bg-neutral-50/30">
                  {tipoGrafico === 'pizza' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contadores.dadosPizza}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={130}
                          innerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {contadores.dadosPizza.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} itemStyle={{ color: '#171717' }} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={contadores.dadosCadastros.slice(-12)} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ stroke: '#e5e5e5', strokeWidth: 2, strokeDasharray: '5 5' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                        <Line type="monotone" dataKey="total" name="Cadastros" stroke="#FACC15" strokeWidth={4} dot={{ r: 6, fill: '#FACC15', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal: Detalhes do Instrutor */}
      {instrutorSelecionado && !showRecusarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center md:p-4" onClick={() => setInstrutorSelecionado(null)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl max-w-2xl w-full max-h-[85vh] md:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-base md:text-lg font-bold">Detalhes do Instrutor</h2>
              <button onClick={() => setInstrutorSelecionado(null)} className="text-neutral-400 hover:text-neutral-900">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-3 md:gap-4">
                <img src={instrutorSelecionado.foto_url} alt="" className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-neutral-200" />
                <div>
                  <h3 className="text-lg md:text-xl font-bold">{instrutorSelecionado.nome}</h3>
                  <p className="text-neutral-500 text-sm">{instrutorSelecionado.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const stConfig = statusConfig[instrutorSelecionado.status]
                      const StIcon = statusIcons[instrutorSelecionado.status]
                      return (
                        <span className={`inline-flex items-center gap-1 ${stConfig.bg} ${stConfig.border} border rounded-full px-2.5 py-0.5 text-xs font-semibold ${stConfig.text}`}>
                          <StIcon size={12} />
                          {stConfig.label}
                        </span>
                      )
                    })()}
                    <span className="text-xs text-neutral-400">Cadastrado em {instrutorSelecionado.created_at}</span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-neutral-50 rounded-xl p-3">
                  <span className="text-neutral-400 text-xs block mb-1">CPF</span>
                  <span className="font-medium">{instrutorSelecionado.cpf}</span>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3">
                  <span className="text-neutral-400 text-xs block mb-1">Telefone</span>
                  <span className="font-medium">{instrutorSelecionado.telefone}</span>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3">
                  <span className="text-neutral-400 text-xs block mb-1">Registro SENATRAN</span>
                  <span className="font-medium">{instrutorSelecionado.registro_senatran}</span>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3">
                  <span className="text-neutral-400 text-xs block mb-1">Experiência</span>
                  <span className="font-medium">{instrutorSelecionado.anos_experiencia} anos - {instrutorSelecionado.alunos_formados} alunos</span>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3">
                  <span className="text-neutral-400 text-xs block mb-1">Localização</span>
                  <span className="font-medium">{instrutorSelecionado.localizacao.cidade}-{instrutorSelecionado.localizacao.estado}</span>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3">
                  <span className="text-neutral-400 text-xs block mb-1">Preço/hora</span>
                  <span className="font-medium">R$ {instrutorSelecionado.preco_hora}</span>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3">
                  <span className="text-neutral-400 text-xs block mb-1">Categorias</span>
                  <div className="flex gap-1">
                    {instrutorSelecionado.categorias.map((c) => (
                      <span key={c} className="bg-[#FACC15]/10 text-[#92600e] px-2 py-0.5 rounded text-xs font-bold">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3">
                  <span className="text-neutral-400 text-xs block mb-1">Plano</span>
                  <span className="font-medium capitalize">{instrutorSelecionado.plano}</span>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3">
                  <span className="text-neutral-400 text-xs block mb-1">Validade do Plano</span>
                  <span className={`font-medium ${
                    (!instrutorSelecionado.plano_expira_em || new Date(instrutorSelecionado.plano_expira_em) < new Date())
                      ? 'text-red-500' : 'text-green-600'
                  }`}>
                    {instrutorSelecionado.plano_expira_em 
                      ? new Date(instrutorSelecionado.plano_expira_em).toLocaleDateString('pt-BR') 
                      : 'Expirado'}
                  </span>
                </div>
              </div>

              {/* Analytics Section */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Activity size={96} className="text-[#FACC15]" />
                </div>
                <h4 className="text-[#FACC15] font-bold mb-4 flex items-center gap-2 relative z-10">
                  <TrendingUp size={16} /> Engajamento e Estatísticas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
                  <div className="bg-neutral-800/80 rounded-lg p-3 border border-neutral-700/50">
                    <span className="text-neutral-400 text-xs flex items-center gap-1.5 mb-1"><Eye size={12}/> Vistas do Perfil</span>
                    <span className="text-white text-xl font-bold">{instrutorSelecionado.visualizacoes || 0}</span>
                  </div>
                  <div className="bg-neutral-800/80 rounded-lg p-3 border border-neutral-700/50">
                    <span className="text-neutral-400 text-xs flex items-center gap-1.5 mb-1"><MousePointerClick size={12}/> Cliques (WhatsApp)</span>
                    <span className="text-white text-xl font-bold">{instrutorSelecionado.whatsapp_clicks || 0}</span>
                  </div>
                  <div className="bg-neutral-800/80 rounded-lg p-3 border border-neutral-700/50">
                    <span className="text-neutral-400 text-xs flex items-center gap-1.5 mb-1"><Clock size={12}/> Último Acesso</span>
                    <span className="text-white text-sm font-medium block">
                      {instrutorSelecionado.ultimo_login 
                        ? new Date(instrutorSelecionado.ultimo_login).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' }) 
                        : 'Nunca acessou'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-sm mb-2">Descrição</h4>
                <p className="text-sm text-neutral-600 leading-relaxed">{instrutorSelecionado.descricao}</p>
              </div>

              {/* Vehicles */}
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Car size={16} className="text-neutral-400" /> Veículos
                </h4>
                <div className="space-y-2">
                  {instrutorSelecionado.veiculos.map((v) => (
                    <div key={v.id} className="bg-neutral-50 rounded-lg px-3 py-2 text-sm">
                      {v.marca} {v.modelo} ({v.ano}) - {v.cambio === 'manual' ? 'Manual' : 'Automático'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-neutral-400" /> Documentos Enviados
                </h4>
                <div className="space-y-2">
                  {instrutorSelecionado.documentos.map((doc) => (
                    <div key={doc.id} className={`rounded-lg px-3 py-2 border ${
                      doc.status === 'recusado' ? 'bg-red-50 border-red-200' :
                      doc.status === 'pendente' ? 'bg-amber-50 border-amber-200' :
                      'bg-neutral-50 border-transparent'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText size={14} className={`flex-shrink-0 ${
                            doc.status === 'recusado' ? 'text-red-400' :
                            doc.status === 'pendente' ? 'text-amber-400' :
                            'text-green-500'
                          }`} />
                          <div className="min-w-0">
                            <span className="text-sm block truncate">{doc.nome_arquivo}</span>
                            <span className="text-xs text-neutral-400">
                              {doc.tipo === 'certificado_senatran' && 'Certificado SENATRAN'}
                              {doc.tipo === 'comprovante_residencia' && 'Comprovante de Residência'}
                              {doc.tipo === 'cnh' && 'CNH'}
                              {doc.tipo === 'foto_veiculo' && 'Foto do Veículo'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye size={12} /> Ver
                          </a>
                          {doc.status !== 'aprovado' && (
                            <button
                              onClick={async () => {
                                const ok = await atualizarStatusDocumento(doc.id, 'aprovado')
                                if (ok) {
                                  toast.success('Documento aprovado!')
                                  carregarInstrutores()
                                }
                              }}
                              className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors"
                              title="Aprovar documento"
                            >
                              <CheckCircle size={12} />
                            </button>
                          )}
                          {doc.status !== 'recusado' && (
                            <button
                              onClick={async () => {
                                const motivo = prompt('Motivo da recusa do documento:')
                                if (motivo === null) return
                                const ok = await atualizarStatusDocumento(doc.id, 'recusado', motivo || 'Documento inválido')
                                if (ok) {
                                  toast.success('Documento recusado.')
                                  carregarInstrutores()
                                }
                              }}
                              className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                              title="Recusar documento"
                            >
                              <XCircle size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      {doc.status === 'aprovado' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 mt-1">
                          <CheckCircle size={10} /> Aprovado
                        </span>
                      )}
                      {doc.status === 'pendente' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 mt-1">
                          <Clock size={10} /> Aguardando validação
                        </span>
                      )}
                      {doc.status === 'recusado' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 mt-1">
                          <XCircle size={10} /> Recusado{doc.motivo_recusa ? `: ${doc.motivo_recusa}` : ''}
                        </span>
                      )}
                    </div>
                  ))}
                  {instrutorSelecionado.documentos.length === 0 && (
                    <p className="text-sm text-red-500">Nenhum documento enviado</p>
                  )}
                </div>
              </div>

              {/* Reviews */}
              {instrutorSelecionado.avaliacoes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Star size={16} className="text-[#EAB308]" /> Avaliações ({instrutorSelecionado.avaliacoes.length})
                  </h4>
                  <div className="space-y-2">
                    {instrutorSelecionado.avaliacoes.slice(0, 3).map((av) => (
                      <div key={av.id} className="bg-neutral-50 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{av.nome_aluno}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={10} className={i < av.nota ? 'text-[#EAB308] fill-[#EAB308]' : 'text-neutral-200'} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-neutral-600">{av.comentario}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-neutral-100 pt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => abrirWhatsApp(instrutorSelecionado.telefone, instrutorSelecionado.nome.split(' ')[0])}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors"
                >
                  <MessageCircle size={16} /> WhatsApp
                </button>
                <button
                  onClick={() => handleEstenderPlano(instrutorSelecionado.id)}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors"
                  title="Estender o plano deste instrutor por mais 30 dias"
                >
                  <Crown size={16} /> Renovar +30 Dias
                </button>
                {(instrutorSelecionado.status === 'em_analise' || instrutorSelecionado.status === 'recusado') && (
                  <button
                    onClick={() => handleAprovar(instrutorSelecionado.id)}
                    className="flex items-center gap-2 bg-[#FACC15] text-neutral-900 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#EAB308] transition-colors"
                  >
                    <CheckCircle size={16} /> Aprovar
                  </button>
                )}
                {instrutorSelecionado.status !== 'recusado' && (
                  <button
                    onClick={() => setShowRecusarModal(true)}
                    className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
                  >
                    <XCircle size={16} /> Recusar
                  </button>
                )}
                {instrutorSelecionado.status === 'aprovado' && (
                  <button
                    onClick={() => handleSuspender(instrutorSelecionado.id)}
                    className="flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-100 transition-colors"
                  >
                    <AlertCircle size={16} /> Suspender
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Recusar Instrutor */}
      {showRecusarModal && instrutorSelecionado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRecusarModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-red-600">Recusar Instrutor</h2>
              <button onClick={() => setShowRecusarModal(false)} className="text-neutral-400 hover:text-neutral-900">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-neutral-600 mb-4">
                Você está recusando o cadastro de <strong>{instrutorSelecionado.nome}</strong>.
                Informe o motivo para que o instrutor possa corrigir e reenviar.
              </p>
              <textarea
                placeholder="Descreva o motivo da recusa..."
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
                rows={4}
                className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-300/20 transition-all mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRecusarModal(false)}
                  className="flex-1 border border-neutral-200 text-neutral-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRecusar(instrutorSelecionado.id)}
                  disabled={!motivoRecusa.trim()}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Recusa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
