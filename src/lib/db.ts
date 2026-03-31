import { supabase } from './supabase'

import type { Instrutor, FiltrosBusca, StatusInstrutor } from '@/types'

// Re-export para manter compatibilidade
export function getMediaAvaliacao(avaliacoes: { nota: number }[]): number {
  if (!avaliacoes.length) return 0
  return avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length
}

// ============================================
// Helpers para mapear dados do Supabase → tipos do app
// ============================================

function mapInstrutorFromDB(row: Record<string, unknown>): Instrutor {
  const loc = row.localizacoes as Record<string, unknown> | Record<string, unknown>[] | null
  const locData = Array.isArray(loc) ? loc[0] : loc
  const privados = (Array.isArray(row.instrutores_dados_privados) ? row.instrutores_dados_privados[0] : (row.instrutores_dados_privados || {})) as Record<string, string | undefined>

  return {
    id: row.id as string,
    user_id: row.user_id as string | undefined,
    nome: row.nome as string,
    cpf: (row.cpf as string) || privados.cpf || '',
    cnpj: (row.cnpj as string) || privados.cnpj || undefined,
    data_nascimento: (row.data_nascimento as string) || privados.data_nascimento || '',
    email: (row.email as string) || privados.email || '',
    telefone: (row.telefone as string) || privados.telefone || '',
    foto_url: row.foto_url as string,
    registro_senatran: (row.registro_senatran as string) || privados.registro_senatran || '',
    categorias: row.categorias as string[],
    anos_experiencia: row.anos_experiencia as number,
    alunos_formados: row.alunos_formados as number,
    descricao: row.descricao as string,
    preco_hora: Number(row.preco_hora),
    aceita_veiculo_candidato: row.aceita_veiculo_candidato as boolean,
    genero: row.genero as 'masculino' | 'feminino',
    status: row.status as StatusInstrutor,
    motivo_recusa: (row.motivo_recusa as string) || undefined,
    plano: row.plano as Instrutor['plano'],
    slug: row.slug as string,
    created_at: (row.criado_em as string) || (row.created_at as string),
    localizacao: locData ? {
      id: locData.id as string,
      instrutor_id: locData.instrutor_id as string,
      cep: locData.cep as string,
      cidade: locData.cidade as string,
      estado: locData.estado as string,
      bairro: locData.bairro as string,
      lat: Number(locData.lat),
      lng: Number(locData.lng),
      raio_km: locData.raio_km as number,
    } : {
      id: '', instrutor_id: '', cep: '', cidade: '', estado: '', bairro: '', lat: 0, lng: 0, raio_km: 10,
    },
    veiculos: ((row.veiculos as Record<string, unknown>[]) || []).map(v => ({
      id: v.id as string,
      instrutor_id: v.instrutor_id as string,
      marca: v.marca as string,
      modelo: v.modelo as string,
      ano: v.ano as number,
      cambio: v.cambio as 'manual' | 'automatico',
      foto_url: (v.foto_url as string) || undefined,
    })),
    disponibilidades: ((row.disponibilidades as Record<string, unknown>[]) || []).map(d => ({
      id: d.id as string,
      instrutor_id: d.instrutor_id as string,
      dia_semana: d.dia_semana as number,
      turno: d.turno as 'manha' | 'tarde' | 'noite',
    })),
    avaliacoes: ((row.avaliacoes as Record<string, unknown>[]) || []).map(a => ({
      id: a.id as string,
      instrutor_id: a.instrutor_id as string,
      nome_aluno: a.nome_aluno as string,
      nota: a.nota as number,
      comentario: a.comentario as string,
      resposta_instrutor: (a.resposta_instrutor as string) || undefined,
      created_at: (a.criado_em as string) || (a.created_at as string),
    })),
    documentos: ((row.documentos as Record<string, unknown>[]) || []).map(d => ({
      id: d.id as string,
      instrutor_id: d.instrutor_id as string,
      tipo: d.tipo as 'certificado_senatran' | 'comprovante_residencia' | 'cnh' | 'foto_veiculo',
      nome_arquivo: d.nome_arquivo as string,
      url: d.url as string,
      uploaded_at: (d.enviado_em as string) || (d.uploaded_at as string),
      status: (d.status as 'pendente' | 'aprovado' | 'recusado') || 'aprovado',
      motivo_recusa: (d.motivo_recusa as string) || undefined,
    })),
    visualizacoes: (row.visualizacoes as number) || 0,
    contatos: ((row.contatos as Record<string, unknown>[]) || []).map(c => ({
      id: c.id as string,
      instrutor_id: c.instrutor_id as string,
      nome: c.nome as string,
      telefone: c.telefone as string,
      email: (c.email as string) || undefined,
      mensagem: c.mensagem as string,
      lido: c.lido as boolean,
      created_at: (c.criado_em as string) || (c.created_at as string),
    })),
  }
}

const INSTRUTOR_SELECT = `
  *,
  instrutores_dados_privados(*),
  localizacoes(*),
  veiculos(*),
  disponibilidades(*),
  avaliacoes(*),
  documentos(*),
  contatos(*)
`

// ============================================
// Consultas públicas
// ============================================

export async function getInstrutoresAprovados(): Promise<Instrutor[]> {
  const { data, error } = await supabase!
    .from('instrutores')
    .select(INSTRUTOR_SELECT)
    .eq('status', 'aprovado')
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar instrutores:', error)
    return []
  }

  return (data || []).map(mapInstrutorFromDB)
}

export async function getInstrutorBySlug(slug: string): Promise<Instrutor | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('instrutores')
    .select(INSTRUTOR_SELECT)
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return mapInstrutorFromDB(data)
}

export async function getInstrutorById(id: string): Promise<Instrutor | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('instrutores')
    .select(INSTRUTOR_SELECT)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return mapInstrutorFromDB(data)
}

export async function buscarInstrutores(filtros: FiltrosBusca): Promise<Instrutor[]> {
  // Supabase query
  let query = supabase!
    .from('instrutores')
    .select(INSTRUTOR_SELECT)
    .eq('status', 'aprovado')

  if (filtros.categorias?.length) {
    query = query.overlaps('categorias', filtros.categorias)
  }
  if (filtros.precoMin) query = query.gte('preco_hora', filtros.precoMin)
  if (filtros.precoMax) query = query.lte('preco_hora', filtros.precoMax)
  if (filtros.anosExperienciaMin) query = query.gte('anos_experiencia', filtros.anosExperienciaMin)
  if (filtros.genero) query = query.eq('genero', filtros.genero)
  if (filtros.aceitaVeiculoCandidato) query = query.eq('aceita_veiculo_candidato', true)

  if (filtros.ordenar === 'preco') {
    query = query.order('preco_hora', { ascending: true })
  } else {
    query = query.order('criado_em', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar instrutores:', error)
    return []
  }

  let resultado = (data || []).map(mapInstrutorFromDB)

  // Filtros que precisam de join (cidade) — filtrar no client
  if (filtros.cidade) {
    const termo = filtros.cidade.toLowerCase()
    resultado = resultado.filter(i =>
      i.localizacao.cidade.toLowerCase().includes(termo) ||
      i.localizacao.bairro.toLowerCase().includes(termo) ||
      i.localizacao.estado.toLowerCase().includes(termo)
    )
  }

  if (filtros.avaliacaoMin) {
    resultado = resultado.filter(i => {
      const media = i.avaliacoes.reduce((acc, a) => acc + a.nota, 0) / (i.avaliacoes.length || 1)
      return media >= filtros.avaliacaoMin!
    })
  }

  return resultado
}

// ============================================
// Admin
// ============================================

export async function getTodosInstrutores(): Promise<Instrutor[]> {
  const { data, error } = await supabase!
    .from('instrutores')
    .select(INSTRUTOR_SELECT)
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar todos instrutores:', error)
    return []
  }

  return (data || []).map(mapInstrutorFromDB)
}

export async function atualizarStatusInstrutor(
  id: string,
  status: StatusInstrutor,
  motivo_recusa?: string
): Promise<boolean> {
  const updateData: Record<string, unknown> = { status }
  if (motivo_recusa !== undefined) updateData.motivo_recusa = motivo_recusa
  if (status === 'aprovado') updateData.motivo_recusa = null

  const { error } = await supabase!
    .from('instrutores')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar status:', error)
    return false
  }
  return true
}

// ============================================
// Instrutor (próprio perfil)
// ============================================

export async function getInstrutorPorUserId(userId: string): Promise<Instrutor | null> {
  const { data, error } = await supabase!
    .from('instrutores')
    .select(INSTRUTOR_SELECT)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('ERRO FATAL EM getInstrutorPorUserId:', error)
  }

  if (error || !data) return null

  return mapInstrutorFromDB(data)
}

export async function atualizarPerfilInstrutor(
  id: string,
  dados: {
    telefone?: string
    preco_hora?: number
    descricao?: string
    categorias?: string[]
    aceita_veiculo_candidato?: boolean
  }
): Promise<boolean> {
  const { telefone, ...resto } = dados
  const { error } = await supabase!
    .from('instrutores')
    .update({ ...resto, status: 'em_analise' })
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar perfil:', error)
    return false
  }

  if (telefone) {
    await supabase!
      .from('instrutores_dados_privados')
      .update({ telefone })
      .eq('instrutor_id', id)
  }

  return true
}

export async function atualizarFotoPerfil(id: string, foto_url: string): Promise<boolean> {
  const { error } = await supabase!
    .from('instrutores')
    .update({ foto_url })
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar foto:', error)
    return false
  }
  return true
}

export async function atualizarLocalizacao(
  instrutorId: string,
  dados: { cep: string; cidade: string; estado: string; bairro: string; raio_km: number }
): Promise<boolean> {
  const { error } = await supabase!
    .from('localizacoes')
    .upsert({ instrutor_id: instrutorId, ...dados }, { onConflict: 'instrutor_id' })

  if (error) {
    console.error('Erro ao atualizar localização:', error)
    return false
  }
  return true
}

// ============================================
// Cadastro de novo instrutor
// ============================================

export async function criarInstrutor(
  userId: string,
  dados: {
    nome: string
    cpf: string
    cnpj?: string
    data_nascimento: string
    email: string
    telefone: string
    foto_url?: string
    registro_senatran: string
    categorias: string[]
    anos_experiencia: number
    descricao: string
    preco_hora: number
    aceita_veiculo_candidato: boolean
    genero: 'masculino' | 'feminino'
    slug: string
  }
): Promise<{ id: string } | null> {
  const { cpf, cnpj, data_nascimento, telefone, email, registro_senatran, ...publicDados } = dados

  const { data, error } = await supabase!
    .from('instrutores')
    .insert({
      user_id: userId,
      ...publicDados,
      status: 'em_analise',
      plano: 'basico',
    })
    .select('id')
    .single()

  if (error) {
    console.error('Erro ao criar instrutor:', error)
    return null
  }

  if (data) {
    await supabase!
      .from('instrutores_dados_privados')
      .insert({
        instrutor_id: data.id,
        cpf,
        cnpj,
        data_nascimento,
        telefone,
        email,
        registro_senatran,
      })
  }

  return data
}

export async function verificarDocumentoUnico(documento: string): Promise<boolean> {
  if (!supabase) return true
  const nums = documento.replace(/\D/g, '')
  
  // Usar uma função RPC no supabase para burlar o RLS privado e checar existencia
  const { data, error } = await supabase.rpc('check_documento_existe', { doc_num: nums })
  
  if (error) {
    // Se a função não existir ainda, tentamos via select (pode esbarrar no RLS)
    const { data: fallbackData } = await supabase
      .from('instrutores_dados_privados')
      .select('cpf')
      .or(`cpf.eq.${nums},cnpj.eq.${nums}`)
      .limit(1)
      
    if (fallbackData && fallbackData.length > 0) return false
    return true
  }
  
  return data === false // Se check_documento_existe retornar TRUE, o doc existe (então único = false)
}

export async function criarLocalizacao(
  instrutorId: string,
  dados: { cep: string; cidade: string; estado: string; bairro: string }
): Promise<boolean> {
  const { error } = await supabase!
    .from('localizacoes')
    .insert({ instrutor_id: instrutorId, ...dados })

  if (error) {
    console.error('Erro ao criar localização:', error)
    return false
  }
  return true
}

export async function criarVeiculo(
  instrutorId: string,
  dados: { marca: string; modelo: string; ano: number; cambio: 'manual' | 'automatico', renavam: string }
): Promise<boolean> {
  const { error } = await supabase!
    .from('veiculos')
    .insert({ instrutor_id: instrutorId, ...dados })

  if (error) {
    console.error('Erro ao criar veículo:', error)
    return false
  }
  return true
}

export async function criarDocumento(
  instrutorId: string,
  dados: { tipo: string; nome_arquivo: string; url: string }
): Promise<boolean> {
  const { error } = await supabase!
    .from('documentos')
    .insert({ instrutor_id: instrutorId, ...dados, status: 'pendente' })

  if (error) {
    console.error('Erro ao criar documento:', error)
    return false
  }
  return true
}

export async function atualizarDocumento(
  docId: string,
  dados: { nome_arquivo: string; url: string }
): Promise<boolean> {
  const { error } = await supabase!
    .from('documentos')
    .update({ ...dados, status: 'pendente', enviado_em: new Date().toISOString() })
    .eq('id', docId)

  if (error) {
    console.error('Erro ao atualizar documento:', error)
    return false
  }
  return true
}

export async function atualizarStatusDocumento(
  docId: string,
  status: 'pendente' | 'aprovado' | 'recusado',
  motivo_recusa?: string
): Promise<boolean> {
  const { error } = await supabase!
    .from('documentos')
    .update({ status, motivo_recusa: motivo_recusa || null })
    .eq('id', docId)

  if (error) {
    console.error('Erro ao atualizar status do documento:', error)
    return false
  }
  return true
}

export async function solicitarNovaAnalise(id: string): Promise<boolean> {
  const { error } = await supabase!
    .from('instrutores')
    .update({ status: 'em_analise', motivo_recusa: null })
    .eq('id', id)

  if (error) return false
  return true
}

export async function atualizarDisponibilidades(
  instrutorId: string,
  disponibilidades: { dia_semana: number; turno: 'manha' | 'tarde' | 'noite' }[]
) {
  // Limpa as antigas
  await supabase!.from('disponibilidades').delete().eq('instrutor_id', instrutorId)
  
  // Insere as novas
  if (disponibilidades.length > 0) {
    const { error } = await supabase!.from('disponibilidades').insert(
      disponibilidades.map(d => ({
        instrutor_id: instrutorId,
        dia_semana: d.dia_semana,
        turno: d.turno
      }))
    )
    return !error
  }
  return true
}

export async function enviarAvaliacao(instrutorId: string, nomeAluno: string, nota: number, comentario: string) {
  const { error } = await supabase!.from('avaliacoes').insert({
    instrutor_id: instrutorId,
    nome_aluno: nomeAluno,
    nota,
    comentario
  })
  return !error
}

export async function registrarVisualizacao(instrutorId: string) {
  if (!supabase) return
  await supabase.rpc('incrementar_visualizacao', { p_instrutor_id: instrutorId })
}

export async function registrarClickWhatsApp(instrutorId: string) {
  if (!supabase) return
  await supabase.rpc('incrementar_whatsapp', { p_instrutor_id: instrutorId })
}

// ============================================
// Sitemap
// ============================================

export async function getSlugsAprovados(): Promise<string[]> {
  const { data, error } = await supabase!
    .from('instrutores')
    .select('slug')
    .eq('status', 'aprovado')

  if (error) return []
  return (data || []).map((d: { slug: string }) => d.slug)
}


export interface CidadeComContagem {
  cidade: string
  estado: string
  label: string // "Cidade - UF"
  instrutores: number
}

export async function getEstatisticasGlobais() {
  const { data, error } = await supabase!
    .from('instrutores')
    .select('alunos_formados, localizacoes(cidade, estado), avaliacoes(nota)')
    .eq('status', 'aprovado')

  if (error || !data) {
    return { instrutores: 0, alunos: 0, media: '0', cidades: 0, listaCidades: [] as CidadeComContagem[] }
  }

  const instrutores = data.length
  let alunos = 0
  let totalNotas = 0
  let qtdNotas = 0
  const cityMap = new Map<string, { cidade: string; estado: string; count: number }>()

  data.forEach((inst: Record<string, unknown>) => {
    alunos += ((inst.alunos_formados as number) || 0)

    if (inst.avaliacoes) {
      const avaliacoes = Array.isArray(inst.avaliacoes) ? inst.avaliacoes : [inst.avaliacoes]
      avaliacoes.forEach((av: Record<string, unknown>) => {
        totalNotas += (av.nota as number)
        qtdNotas++
      })
    }

    if (inst.localizacoes) {
      const locs = inst.localizacoes as Record<string, unknown>[] | Record<string, unknown>
      const loc = Array.isArray(locs) ? locs[0] : locs
      if (loc && loc.cidade) {
        const cidade = loc.cidade as string
        const estado = (loc.estado as string) || ''
        const key = `${cidade}-${estado}`.toLowerCase()
        const existing = cityMap.get(key)
        if (existing) {
          existing.count++
        } else {
          cityMap.set(key, { cidade, estado, count: 1 })
        }
      }
    }
  })

  const media = qtdNotas > 0 ? (totalNotas / qtdNotas).toFixed(1) : '5.0'

  const listaCidades: CidadeComContagem[] = Array.from(cityMap.values())
    .map(c => ({
      cidade: c.cidade,
      estado: c.estado,
      label: c.estado ? `${c.cidade} - ${c.estado}` : c.cidade,
      instrutores: c.count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return {
    instrutores,
    alunos,
    media,
    cidades: cityMap.size,
    listaCidades,
  }
}
