export type StatusDocumento = 'pendente' | 'aprovado' | 'recusado'

export interface Documento {
  id: string
  instrutor_id: string
  tipo: 'certificado_senatran' | 'comprovante_residencia' | 'cnh' | 'foto_veiculo'
  nome_arquivo: string
  url: string
  uploaded_at: string
  status: StatusDocumento
  motivo_recusa?: string
}

export type StatusInstrutor = 'em_analise' | 'aprovado' | 'recusado' | 'suspenso'

export type PlanoTipo = 'basico' | 'profissional' | 'premium'

export interface PlanoAssinatura {
  id: string
  tipo: PlanoTipo
  nome: string
  preco_mensal: number
  recursos: string[]
  destaque: boolean
}

export interface Instrutor {
  id: string
  user_id?: string
  nome: string
  cpf: string
  cnpj?: string
  data_nascimento: string
  email: string
  telefone: string
  foto_url: string
  registro_senatran: string
  categorias: string[]
  anos_experiencia: number
  alunos_formados: number
  descricao: string
  preco_hora: number
  aceita_veiculo_candidato: boolean
  genero: 'masculino' | 'feminino'
  status: StatusInstrutor
  motivo_recusa?: string
  plano: PlanoTipo
  slug: string
  created_at: string
  documentos: Documento[]
  localizacao: Localizacao
  disponibilidades: Disponibilidade[]
  veiculos: Veiculo[]
  avaliacoes: Avaliacao[]
  contatos: Contato[]
  visualizacoes: number
}

export interface Localizacao {
  id: string
  instrutor_id: string
  cep: string
  cidade: string
  estado: string
  bairro: string
  lat: number
  lng: number
  raio_km: number
}

export interface Disponibilidade {
  id: string
  instrutor_id: string
  dia_semana: number
  turno: 'manha' | 'tarde' | 'noite'
}

export interface Veiculo {
  id: string
  instrutor_id: string
  marca: string
  modelo: string
  ano: number
  cambio: 'manual' | 'automatico'
  foto_url?: string
}

export interface Avaliacao {
  id: string
  instrutor_id: string
  nome_aluno: string
  nota: number
  comentario: string
  resposta_instrutor?: string
  created_at: string
}

export interface Contato {
  id: string
  instrutor_id: string
  nome: string
  telefone: string
  email?: string
  mensagem: string
  lido: boolean
  created_at: string
}

export interface FiltrosBusca {
  cidade?: string
  categorias?: string[]
  precoMin?: number
  precoMax?: number
  avaliacaoMin?: number
  diasDisponiveis?: number[]
  aceitaVeiculoCandidato?: boolean
  anosExperienciaMin?: number
  genero?: 'masculino' | 'feminino'
  ordenar?: 'proximidade' | 'avaliacao' | 'preco'
}
