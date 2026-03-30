import { z } from 'zod'

export const cpfMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

export const cnpjMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    .slice(0, 18)
}

export const cepMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9)
}

export const telefoneMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

export const renavamMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
}

export function validarCPF(cpf: string): boolean {
  const nums = cpf.replace(/\D/g, '')
  if (nums.length !== 11) return false
  if (/^(\d)\1{10}$/.test(nums)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10) resto = 0
  if (resto !== parseInt(nums[9])) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10) resto = 0
  return resto === parseInt(nums[10])
}

export function validarCNPJ(cnpj: string): boolean {
  const nums = cnpj.replace(/\D/g, '')
  if (nums.length !== 14) return false
  if (/^(\d)\1{13}$/.test(nums)) return false
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let soma = 0
  for (let i = 0; i < 12; i++) soma += parseInt(nums[i]) * pesos1[i]
  let resto = soma % 11
  const dig1 = resto < 2 ? 0 : 11 - resto
  if (dig1 !== parseInt(nums[12])) return false
  soma = 0
  for (let i = 0; i < 13; i++) soma += parseInt(nums[i]) * pesos2[i]
  resto = soma % 11
  const dig2 = resto < 2 ? 0 : 11 - resto
  return dig2 === parseInt(nums[13])
}

export function validarRenavam(renavam: string): boolean {
  if (!renavam) return false
  const nums = renavam.replace(/\D/g, '')
  if (nums.length !== 11) return false
  
  const renavamSemDigito = nums.substring(0, 10)
  const renavamReverso = renavamSemDigito.split('').reverse().join('')
  
  let soma = 0
  const multiplicadores = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3]
  for (let i = 0; i < 10; i++) {
    soma += parseInt(renavamReverso[i]) * multiplicadores[i]
  }
  
  const multiplicador = soma * 10
  let digito = multiplicador % 11
  if (digito === 10) digito = 0
  
  return digito === parseInt(nums[10])
}

export function validarIdade(dataNascimento: string, idadeMinima: number = 18): boolean {
  const nascimento = new Date(dataNascimento)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mes = hoje.getMonth() - nascimento.getMonth()
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--
  }
  return idade >= idadeMinima
}

export const cadastroStep1Schema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().min(14, 'CPF inválido'),
  data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  telefone: z.string().min(15, 'Telefone inválido'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmar_senha: z.string(),
}).refine((data) => data.senha === data.confirmar_senha, {
  message: 'As senhas não coincidem',
  path: ['confirmar_senha'],
})

export const cadastroStep2Schema = z.object({
  registro_senatran: z.string().min(1, 'Registro Senatran é obrigatório'),
  categorias: z.array(z.string()).min(1, 'Selecione ao menos uma categoria'),
  anos_experiencia: z.string().min(1, 'Selecione a experiência'),
  alunos_formados: z.number().min(0, 'Valor inválido'),
})

export const cadastroStep3Schema = z.object({
  cep: z.string().min(9, 'CEP inválido'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  raio_km: z.number().min(5).max(50),
  aceita_veiculo_candidato: z.boolean(),
})

export const cadastroStep4Schema = z.object({
  veiculos: z.array(z.object({
    marca: z.string().min(1, 'Marca é obrigatória'),
    modelo: z.string().min(1, 'Modelo é obrigatório'),
    ano: z.number().min(2000).max(2026),
    cambio: z.enum(['manual', 'automatico']),
  })).min(1, 'Adicione pelo menos um veículo'),
})

export const cadastroStep5Schema = z.object({
  preco_hora: z.number().min(30, 'Preço mínimo é R$ 30'),
  descricao: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres').max(500, 'Máximo de 500 caracteres'),
})

export const contatoSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  telefone: z.string().min(15, 'Telefone inválido'),
  mensagem: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
})

export type CadastroStep1 = z.infer<typeof cadastroStep1Schema>
export type CadastroStep2 = z.infer<typeof cadastroStep2Schema>
export type CadastroStep3 = z.infer<typeof cadastroStep3Schema>
export type CadastroStep4 = z.infer<typeof cadastroStep4Schema>
export type CadastroStep5 = z.infer<typeof cadastroStep5Schema>
export type ContatoForm = z.infer<typeof contatoSchema>
