'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useViaCep } from '@/hooks/useViaCep'
import { criarInstrutor, criarLocalizacao, criarVeiculo, criarDocumento } from '@/lib/db'
import { uploadDocumento } from '@/lib/storage'
import { cpfMask, cnpjMask, cepMask, telefoneMask, validarCPF, validarCNPJ, validarIdade } from '@/lib/validations'
import { toast } from 'sonner'
import {
  User,
  FileText,
  MapPin,
  Car,
  DollarSign,
  Upload,
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  AlertCircle,
  Shield,
  Clock,
} from 'lucide-react'

const steps = [
  { icon: User, label: 'Dados Pessoais' },
  { icon: FileText, label: 'Credenciais' },
  { icon: Upload, label: 'Documentos' },
  { icon: MapPin, label: 'Localização' },
  { icon: Car, label: 'Veículos' },
  { icon: DollarSign, label: 'Perfil' },
]

interface Veiculo {
  marca: string
  modelo: string
  ano: string
  cambio: 'manual' | 'automatico'
}

interface DocumentoUpload {
  tipo: string
  nome: string
  arquivo: File | null
}

export default function SejaInstrutorPageClient() {
  const { registrar } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [cadastroConcluido, setCadastroConcluido] = useState(false)
  const { buscarCep, loading: cepLoading } = useViaCep()

  // Step 1 - Dados Pessoais
  const [nome, setNome] = useState('')
  const [tipoPessoa, setTipoPessoa] = useState<'cpf' | 'cnpj'>('cpf')
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [genero, setGenero] = useState<'masculino' | 'feminino'>('masculino')

  // Validation states
  const [cpfError, setCpfError] = useState('')
  const [cnpjError, setCnpjError] = useState('')
  const [idadeError, setIdadeError] = useState('')

  // Step 2 - Credenciais
  const [registroSenatran, setRegistroSenatran] = useState('')
  const [categorias, setCategorias] = useState<string[]>([])
  const [anosExperiencia, setAnosExperiencia] = useState('')
  const [alunosFormados, setAlunosFormados] = useState('')

  // Step 3 - Documentos
  const [documentos, setDocumentos] = useState<DocumentoUpload[]>([
    { tipo: 'certificado_senatran', nome: 'Certificado SENATRAN', arquivo: null },
    { tipo: 'comprovante_residencia', nome: 'Comprovante de Residência', arquivo: null },
    { tipo: 'cnh', nome: 'CNH (frente e verso)', arquivo: null },
  ])

  // Step 4 - Localização
  const [cep, setCep] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [bairro, setBairro] = useState('')
  const [raioKm, setRaioKm] = useState('15')
  const [aceitaVeiculoCandidato, setAceitaVeiculoCandidato] = useState(false)

  // Step 5 - Veículos
  const [veiculos, setVeiculos] = useState<Veiculo[]>([
    { marca: '', modelo: '', ano: '', cambio: 'manual' },
  ])

  // Step 6 - Perfil
  const [precoHora, setPrecoHora] = useState('')
  const [descricao, setDescricao] = useState('')

  const handleCpfChange = (value: string) => {
    const masked = cpfMask(value)
    setCpf(masked)
    if (masked.length === 14) {
      if (!validarCPF(masked)) {
        setCpfError('CPF inválido')
      } else {
        setCpfError('')
      }
    } else {
      setCpfError('')
    }
  }

  const handleCnpjChange = (value: string) => {
    const masked = cnpjMask(value)
    setCnpj(masked)
    if (masked.length === 18) {
      if (!validarCNPJ(masked)) {
        setCnpjError('CNPJ inválido')
      } else {
        setCnpjError('')
      }
    } else {
      setCnpjError('')
    }
  }

  const handleDataNascimentoChange = (value: string) => {
    setDataNascimento(value)
    if (value) {
      if (!validarIdade(value, 18)) {
        setIdadeError('Você deve ter pelo menos 18 anos')
      } else {
        setIdadeError('')
      }
    } else {
      setIdadeError('')
    }
  }

  const handleCepChange = async (value: string) => {
    const masked = cepMask(value)
    setCep(masked)
    if (masked.length === 9) {
      const data = await buscarCep(masked)
      if (data) {
        setCidade(data.localidade)
        setEstado(data.uf)
        setBairro(data.bairro)
      }
    }
  }

  const handleDocumentoChange = (index: number, file: File | null) => {
    const updated = [...documentos]
    updated[index] = { ...updated[index], arquivo: file }
    setDocumentos(updated)
  }

  const addVeiculo = () => {
    setVeiculos([...veiculos, { marca: '', modelo: '', ano: '', cambio: 'manual' }])
  }

  const removeVeiculo = (index: number) => {
    if (veiculos.length === 1) return
    setVeiculos(veiculos.filter((_, i) => i !== index))
  }

  const updateVeiculo = (index: number, field: keyof Veiculo, value: string) => {
    const updated = [...veiculos]
    updated[index] = { ...updated[index], [field]: value }
    setVeiculos(updated)
  }

  const toggleCategoria = (cat: string) => {
    setCategorias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const canAdvance = () => {
    switch (currentStep) {
      case 0: {
        const docValid = tipoPessoa === 'cpf'
          ? cpf.length === 14 && !cpfError
          : cnpj.length === 18 && !cnpjError
        return nome && docValid && dataNascimento && !idadeError && telefone.length === 15 && email && senha.length >= 6 && senha === confirmarSenha
      }
      case 1:
        return registroSenatran && categorias.length > 0 && anosExperiencia
      case 2:
        return documentos[0].arquivo && documentos[1].arquivo && documentos[2].arquivo
      case 3:
        return cep.length === 9 && cidade && estado && bairro
      case 4:
        return veiculos.every((v) => v.marca && v.modelo && v.ano)
      case 5:
        return Number(precoHora) >= 30 && descricao.length >= 20
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // 1. Registrar usuário (Supabase Auth)
      const resultado = await registrar(email, senha, nome)
      if (!resultado.success) {
        toast.error(resultado.error || 'Erro ao criar conta. Verifique seus dados.')
        setLoading(false)
        return
      }

      // Gerar slug a partir do nome
      const slug = nome
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now().toString(36)

      // 2. Criar perfil do instrutor
      const instrutor = await criarInstrutor(resultado.success ? email : '', {
        nome,
        cpf: cpf.replace(/\D/g, ''),
        cnpj: tipoPessoa === 'cnpj' ? cnpj.replace(/\D/g, '') : undefined,
        data_nascimento: dataNascimento,
        email,
        telefone,
        registro_senatran: registroSenatran,
        categorias,
        anos_experiencia: Number(anosExperiencia),
        descricao,
        preco_hora: Number(precoHora),
        aceita_veiculo_candidato: aceitaVeiculoCandidato,
        genero,
        slug,
      })

      if (!instrutor) {
        toast.error('Erro ao criar perfil do instrutor. Tente novamente.')
        setLoading(false)
        return
      }

      // 3. Criar localização
      const locOk = await criarLocalizacao(instrutor.id, { cep, cidade, estado, bairro })
      if (!locOk) toast.error('Aviso: erro ao salvar localização. Você poderá atualizar depois no painel.')

      // 4. Criar veículos
      for (const v of veiculos) {
        if (v.marca && v.modelo && v.ano) {
          const vOk = await criarVeiculo(instrutor.id, {
            marca: v.marca,
            modelo: v.modelo,
            ano: Number(v.ano),
            cambio: v.cambio,
          })
          if (!vOk) toast.error(`Aviso: erro ao salvar veículo ${v.marca} ${v.modelo}.`)
        }
      }

      // 5. Upload e registrar documentos
      let docsComErro = 0
      for (const doc of documentos) {
        if (doc.arquivo) {
          const uploadResult = await uploadDocumento(instrutor.id, doc.arquivo, doc.tipo)
          if (uploadResult) {
            const docOk = await criarDocumento(instrutor.id, {
              tipo: doc.tipo,
              nome_arquivo: uploadResult.nome_arquivo,
              url: uploadResult.url,
            })
            if (!docOk) docsComErro++
          } else {
            docsComErro++
          }
        }
      }
      if (docsComErro > 0) {
        toast.error(`${docsComErro} documento(s) não foram enviados. Você poderá reenviar pelo painel.`)
      }

      toast.success('Cadastro realizado com sucesso!')
      setCadastroConcluido(true)
    } catch (err) {
      console.error('Erro no cadastro:', err)
      toast.error('Erro inesperado ao realizar cadastro. Verifique sua conexão e tente novamente.')
    }
    setLoading(false)
  }

  const inputClass =
    'w-full bg-white border border-neutral-200 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 transition-all'

  if (cadastroConcluido) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <Navbar />
        <div className="pt-32 pb-20 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 md:p-12 shadow-sm">
              <div className="w-20 h-20 bg-[#FACC15]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="text-[#EAB308]" size={40} />
              </div>
              <h1 className="text-2xl font-bold mb-3">Cadastro Enviado!</h1>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-left">
                    <p className="text-amber-800 font-semibold text-sm mb-1">Perfil em Análise</p>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      Seus documentos e informações estão sendo verificados pela nossa equipe.
                      Esse processo pode levar até 48 horas úteis.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-neutral-500 text-sm mb-6">
                Você receberá um e-mail em <strong className="text-neutral-900">{email}</strong> quando seu perfil for aprovado.
                Enquanto isso, você já pode acessar seu painel.
              </p>
              <div className="space-y-3">
                <a
                  href="/login"
                  className="block w-full bg-[#FACC15] text-neutral-900 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-yellow-400/20 hover:bg-[#EAB308] transition-all"
                >
                  Acessar Meu Painel
                </a>
                <a
                  href="/"
                  className="block w-full border border-neutral-200 text-neutral-700 py-3.5 rounded-xl font-semibold hover:bg-neutral-50 transition-all"
                >
                  Voltar ao Início
                </a>
              </div>
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

      <div className="pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-10">
            <h1 className="text-2xl md:text-4xl font-bold mb-1.5 md:mb-2">Seja Instrutor</h1>
            <p className="text-neutral-500 text-sm md:text-base">
              Cadastre-se na plataforma e comece a receber alunos.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-0.5 sm:gap-2 mb-6 md:mb-10 overflow-x-auto px-1">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    i < currentStep
                      ? 'bg-[#FACC15] text-neutral-900'
                      : i === currentStep
                        ? 'bg-white text-[#EAB308] border-2 border-[#FACC15] shadow-sm'
                        : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                  }`}
                >
                  {i < currentStep ? <Check size={16} /> : <step.icon size={16} />}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-3 sm:w-8 h-0.5 mx-0.5 sm:mx-1 ${
                      i < currentStep ? 'bg-[#FACC15]' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-8 shadow-sm">
            <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2">
              {(() => {
                const StepIcon = steps[currentStep].icon
                return <StepIcon size={20} className="text-[#EAB308]" />
              })()}
              {steps[currentStep].label}
            </h2>

            {/* Step 1: Dados Pessoais */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">Nome completo</label>
                  <input type="text" placeholder="Seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
                </div>

                {/* CPF ou CNPJ */}
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">Tipo de cadastro</label>
                  <div className="flex gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setTipoPessoa('cpf')}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        tipoPessoa === 'cpf'
                          ? 'bg-[#FACC15] text-neutral-900 shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      Pessoa Física (CPF)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoPessoa('cnpj')}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        tipoPessoa === 'cnpj'
                          ? 'bg-[#FACC15] text-neutral-900 shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      Pessoa Jurídica (CNPJ)
                    </button>
                  </div>

                  {tipoPessoa === 'cpf' ? (
                    <div>
                      <input type="text" placeholder="000.000.000-00" value={cpf} onChange={(e) => handleCpfChange(e.target.value)} className={`${inputClass} ${cpfError ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`} />
                      {cpfError && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {cpfError}
                        </p>
                      )}
                      {cpf.length === 14 && !cpfError && (
                        <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                          <Check size={12} /> CPF válido
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input type="text" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => handleCnpjChange(e.target.value)} className={`${inputClass} ${cnpjError ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`} />
                      {cnpjError && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {cnpjError}
                        </p>
                      )}
                      {cnpj.length === 18 && !cnpjError && (
                        <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                          <Check size={12} /> CNPJ válido
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-2 block">Data de nascimento</label>
                    <input type="date" value={dataNascimento} onChange={(e) => handleDataNascimentoChange(e.target.value)} className={`${inputClass} ${idadeError ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`} />
                    {idadeError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {idadeError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-2 block">Gênero</label>
                    <select value={genero} onChange={(e) => setGenero(e.target.value as 'masculino' | 'feminino')} className={inputClass}>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-2 block">Telefone</label>
                    <input type="text" placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(telefoneMask(e.target.value))} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-2 block">E-mail</label>
                    <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-2 block">Senha</label>
                    <input type="password" placeholder="Mínimo 6 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-2 block">Confirmar senha</label>
                    <input type="password" placeholder="Repita a senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className={inputClass} />
                    {confirmarSenha && senha !== confirmarSenha && (
                      <p className="text-red-500 text-xs mt-1">As senhas não coincidem</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Credenciais */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">Registro SENATRAN</label>
                  <input type="text" placeholder="Ex: SEN-2024-001234" value={registroSenatran} onChange={(e) => setRegistroSenatran(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-3 block">Categorias que leciona</label>
                  <div className="flex flex-wrap gap-2">
                    {['A', 'B', 'C', 'D', 'E'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategoria(cat)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          categorias.includes(cat)
                            ? 'bg-[#FACC15] text-neutral-900 shadow-sm'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        Categoria {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-2 block">Anos de experiência</label>
                    <select value={anosExperiencia} onChange={(e) => setAnosExperiencia(e.target.value)} className={inputClass}>
                      <option value="">Selecione</option>
                      <option value="1">1-2 anos</option>
                      <option value="3">3-5 anos</option>
                      <option value="6">6-10 anos</option>
                      <option value="10">10-15 anos</option>
                      <option value="15">15+ anos</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-2 block">Alunos formados (aprox.)</label>
                    <input type="number" placeholder="Ex: 200" value={alunosFormados} onChange={(e) => setAlunosFormados(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Documentos */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-2">
                  <div className="flex items-start gap-3">
                    <Shield className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-amber-800 text-sm leading-relaxed">
                      Seus documentos serão analisados pela nossa equipe para garantir a segurança da plataforma.
                      Envie arquivos em <strong>PDF, JPG ou PNG</strong> com boa qualidade.
                    </p>
                  </div>
                </div>

                {documentos.map((doc, index) => (
                  <div key={doc.tipo} className="border border-neutral-200 rounded-xl p-4">
                    <label className="text-sm font-semibold text-neutral-700 mb-3 block">
                      {doc.nome} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentoChange(index, e.target.files?.[0] || null)}
                        className="hidden"
                        id={`doc-${doc.tipo}`}
                      />
                      <label
                        htmlFor={`doc-${doc.tipo}`}
                        className={`flex items-center gap-3 w-full border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition-all ${
                          doc.arquivo
                            ? 'border-green-300 bg-green-50'
                            : 'border-neutral-200 hover:border-[#FACC15] hover:bg-yellow-50/30'
                        }`}
                      >
                        {doc.arquivo ? (
                          <>
                            <Check className="text-green-600 flex-shrink-0" size={20} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-700 truncate">{doc.arquivo.name}</p>
                              <p className="text-xs text-green-600">{(doc.arquivo.size / 1024).toFixed(0)} KB</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                handleDocumentoChange(index, null)
                              }}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <Upload className="text-neutral-400" size={20} />
                            <div>
                              <p className="text-sm text-neutral-600">Clique para enviar</p>
                              <p className="text-xs text-neutral-400">PDF, JPG ou PNG (máx. 5MB)</p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Localização */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">CEP</label>
                  <input type="text" placeholder="00000-000" value={cep} onChange={(e) => handleCepChange(e.target.value)} className={inputClass} />
                  {cepLoading && <p className="text-[#EAB308] text-xs mt-1">Buscando endereço...</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-2 block">Cidade</label>
                    <input type="text" value={cidade} readOnly className={`${inputClass} bg-neutral-50`} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-neutral-700 mb-2 block">Estado</label>
                    <input type="text" value={estado} readOnly className={`${inputClass} bg-neutral-50`} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">Bairro</label>
                  <input type="text" value={bairro} readOnly className={`${inputClass} bg-neutral-50`} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">
                    Raio de atendimento: {raioKm} km
                  </label>
                  <input type="range" min="5" max="50" value={raioKm} onChange={(e) => setRaioKm(e.target.value)} className="w-full accent-[#FACC15]" />
                  <div className="flex justify-between text-xs text-neutral-400 mt-1">
                    <span>5 km</span>
                    <span>50 km</span>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={aceitaVeiculoCandidato} onChange={(e) => setAceitaVeiculoCandidato(e.target.checked)} className="w-5 h-5 rounded border-neutral-300 text-[#FACC15] focus:ring-[#FACC15]/20" />
                  <span className="text-sm text-neutral-700">Aceito veículo do candidato</span>
                </label>
              </div>
            )}

            {/* Step 5: Veículos */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {veiculos.map((v, i) => (
                  <div key={i} className="bg-neutral-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-neutral-700">Veículo {i + 1}</span>
                      {veiculos.length > 1 && (
                        <button type="button" onClick={() => removeVeiculo(i)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Marca" value={v.marca} onChange={(e) => updateVeiculo(i, 'marca', e.target.value)} className={inputClass} />
                      <input type="text" placeholder="Modelo" value={v.modelo} onChange={(e) => updateVeiculo(i, 'modelo', e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" placeholder="Ano" value={v.ano} onChange={(e) => updateVeiculo(i, 'ano', e.target.value)} className={inputClass} />
                      <select value={v.cambio} onChange={(e) => updateVeiculo(i, 'cambio', e.target.value)} className={inputClass}>
                        <option value="manual">Manual</option>
                        <option value="automatico">Automático</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVeiculo}
                  className="w-full border-2 border-dashed border-neutral-200 rounded-xl py-3 text-neutral-400 hover:border-[#FACC15] hover:text-[#EAB308] transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Adicionar veículo
                </button>
              </div>
            )}

            {/* Step 6: Perfil */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">Valor por hora (R$)</label>
                  <input type="number" placeholder="Ex: 80" value={precoHora} onChange={(e) => setPrecoHora(e.target.value)} className={inputClass} />
                  {Number(precoHora) > 0 && Number(precoHora) < 30 && (
                    <p className="text-red-500 text-xs mt-1">Valor mínimo: R$ 30</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">Descrição do perfil ({descricao.length}/500)</label>
                  <textarea
                    placeholder="Fale sobre sua experiência, método de ensino, diferenciais..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value.slice(0, 500))}
                    rows={5}
                    className={inputClass}
                  />
                  {descricao.length > 0 && descricao.length < 20 && (
                    <p className="text-red-500 text-xs mt-1">Mínimo de 20 caracteres</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 md:mt-8 pt-4 md:pt-6 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-1 text-neutral-400 hover:text-neutral-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm md:text-base"
              >
                <ChevronLeft size={16} /> Voltar
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canAdvance()}
                  className="flex items-center gap-1 bg-[#FACC15] text-neutral-900 px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-bold text-sm md:text-base hover:bg-[#EAB308] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#FACC15]"
                >
                  Próximo <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canAdvance() || loading}
                  className="flex items-center gap-2 bg-[#FACC15] text-neutral-900 px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-bold text-sm md:text-base hover:bg-[#EAB308] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Finalizar cadastro'}
                  <Check size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
