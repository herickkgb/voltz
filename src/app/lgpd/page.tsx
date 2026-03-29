import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { Shield, Lock, Eye, FileText, UserCheck, Trash2, AlertTriangle, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'LGPD — Proteção de Dados Pessoais — Voltz',
  description:
    'Saiba como a Voltz trata seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). Transparência e segurança para candidatos e instrutores.',
  alternates: {
    canonical: '/lgpd',
  },
}

export default function LGPDPage() {
  const direitos = [
    {
      icon: Eye,
      titulo: 'Acesso e Confirmação',
      descricao: 'Você pode solicitar a confirmação da existência de tratamento de seus dados pessoais e ter acesso a todas as informações que mantemos sobre você.',
    },
    {
      icon: FileText,
      titulo: 'Correção',
      descricao: 'Caso seus dados estejam incompletos, inexatos ou desatualizados, você pode solicitar a correção a qualquer momento.',
    },
    {
      icon: Trash2,
      titulo: 'Eliminação',
      descricao: 'Você pode solicitar a exclusão de seus dados pessoais tratados com base no consentimento, salvo quando houver obrigação legal de retenção.',
    },
    {
      icon: Lock,
      titulo: 'Anonimização e Bloqueio',
      descricao: 'Dados desnecessários, excessivos ou tratados em desconformidade com a LGPD podem ser anonimizados, bloqueados ou eliminados.',
    },
    {
      icon: UserCheck,
      titulo: 'Portabilidade',
      descricao: 'Você pode solicitar a portabilidade de seus dados a outro fornecedor de serviço ou produto, mediante requisição expressa.',
    },
    {
      icon: AlertTriangle,
      titulo: 'Revogação do Consentimento',
      descricao: 'Você pode revogar seu consentimento para o tratamento de dados a qualquer momento, sem comprometer tratamentos já realizados.',
    },
  ]

  const basesLegais = [
    {
      base: 'Consentimento',
      descricao: 'Quando você se cadastra e aceita nossos termos.',
      exemplo: 'Criação de conta, envio de comunicações de marketing.',
    },
    {
      base: 'Execução de Contrato',
      descricao: 'Para prestar os serviços contratados.',
      exemplo: 'Conexão entre candidatos e instrutores, exibição de perfis.',
    },
    {
      base: 'Legítimo Interesse',
      descricao: 'Para melhorar nossos serviços e segurança.',
      exemplo: 'Prevenção a fraudes, análise de uso da plataforma.',
    },
    {
      base: 'Obrigação Legal',
      descricao: 'Para cumprir obrigações legais e regulatórias.',
      exemplo: 'Retenção de dados fiscais, atendimento a ordens judiciais.',
    },
  ]

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 md:pt-40 md:pb-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 md:w-20 md:h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
            <Shield className="text-blue-600" size={32} />
          </div>
          <h1 className="text-2xl md:text-5xl font-bold mb-3 md:mb-6">
            LGPD — <span className="text-blue-600">Proteção de Dados</span>
          </h1>
          <p className="text-sm md:text-xl text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            A Voltz está comprometida com a transparência e a proteção dos seus dados pessoais,
            em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
        </div>
      </section>

      {/* O que é a LGPD */}
      <section className="py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl md:rounded-2xl p-5 md:p-10">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">O que é a LGPD?</h2>
            <div className="text-neutral-600 leading-relaxed space-y-3 text-sm md:text-base">
              <p>
                A <strong className="text-neutral-900">Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)</strong> é
                a legislação brasileira que regulamenta o tratamento de dados pessoais por empresas e organizações.
                Ela garante direitos fundamentais de privacidade e proteção de dados aos cidadãos brasileiros.
              </p>
              <p>
                A LGPD se aplica a qualquer operação de tratamento de dados pessoais realizada por pessoa natural
                ou jurídica, de direito público ou privado, independentemente do meio, do país de sua sede ou do
                país onde estejam localizados os dados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como a Voltz trata seus dados */}
      <section className="py-10 md:py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-10">Como a Voltz trata seus dados</h2>

          <div className="space-y-4 md:space-y-6">
            <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-8">
              <h3 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2">
                <Lock className="text-blue-600" size={20} />
                Dados que coletamos
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                <div className="bg-neutral-50 rounded-xl p-3 md:p-4">
                  <p className="font-semibold text-neutral-900 mb-1">Candidatos</p>
                  <p className="text-neutral-500 text-xs md:text-sm">Cidade de busca e dados de navegação. Nenhum cadastro é necessário para buscar instrutores.</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 md:p-4">
                  <p className="font-semibold text-neutral-900 mb-1">Instrutores</p>
                  <p className="text-neutral-500 text-xs md:text-sm">Nome, CPF/CNPJ, e-mail, telefone, endereço, registro SENATRAN, documentos profissionais e dados do veículo.</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 md:p-4">
                  <p className="font-semibold text-neutral-900 mb-1">Dados de uso</p>
                  <p className="text-neutral-500 text-xs md:text-sm">Páginas acessadas, tempo de navegação, dispositivo, navegador e endereço IP (anonimizado).</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 md:p-4">
                  <p className="font-semibold text-neutral-900 mb-1">Avaliações</p>
                  <p className="text-neutral-500 text-xs md:text-sm">Notas, comentários e respostas publicadas pelos usuários na plataforma.</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-8">
              <h3 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2">
                <Shield className="text-blue-600" size={20} />
                Finalidade do tratamento
              </h3>
              <ul className="space-y-2 text-sm md:text-base text-neutral-600">
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Criar e gerenciar contas de instrutores na plataforma</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Conectar candidatos a instrutores autônomos credenciados</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Verificar credenciais e documentos dos instrutores</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Exibir perfis públicos dos instrutores nas buscas</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Melhorar a experiência e segurança da plataforma</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Cumprir obrigações legais e regulatórias</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Prevenir fraudes e atividades ilícitas</li>
              </ul>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-8">
              <h3 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                Compartilhamento de dados
              </h3>
              <div className="text-sm md:text-base text-neutral-600 space-y-2">
                <p>A Voltz <strong className="text-neutral-900">nunca vende seus dados pessoais</strong>. Compartilhamos dados apenas nas seguintes situações:</p>
                <ul className="space-y-2 mt-3">
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> <strong>Perfis públicos:</strong> informações do perfil de instrutores são visíveis para candidatos nas buscas</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> <strong>Prestadores de serviço:</strong> empresas que nos auxiliam na operação (hospedagem, e-mails), sob contrato de confidencialidade</li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> <strong>Autoridades:</strong> quando exigido por lei, ordem judicial ou requisição da ANPD</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bases Legais */}
      <section className="py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-10">Bases legais para tratamento</h2>
          <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
            {basesLegais.map((item) => (
              <div key={item.base} className="bg-white border border-neutral-200 rounded-xl p-4 md:p-5">
                <h3 className="font-bold text-sm md:text-base mb-1">{item.base}</h3>
                <p className="text-neutral-500 text-xs md:text-sm mb-2">{item.descricao}</p>
                <p className="text-neutral-400 text-[11px] md:text-xs italic">Ex: {item.exemplo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seus Direitos */}
      <section className="py-12 md:py-20 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-12">Seus direitos como titular</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {direitos.map((d) => (
              <div key={d.titulo} className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                  <d.icon className="text-blue-600" size={20} />
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1.5">{d.titulo}</h3>
                <p className="text-neutral-500 text-xs md:text-sm leading-relaxed">{d.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segurança */}
      <section className="py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-10 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="text-blue-600" size={22} />
              Segurança dos Dados
            </h2>
            <div className="text-neutral-600 leading-relaxed space-y-3 text-sm md:text-base">
              <p>
                A Voltz implementa medidas técnicas e organizacionais adequadas para proteger seus dados pessoais,
                incluindo:
              </p>
              <ul className="space-y-2 ml-1">
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Criptografia de dados em trânsito (HTTPS/TLS) e em repouso</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Controle de acesso baseado em função (RBAC)</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Monitoramento contínuo de segurança</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Backups regulares e planos de recuperação de desastres</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Treinamento de equipe sobre proteção de dados</li>
                <li className="flex items-start gap-2"><span className="text-blue-600 font-bold mt-0.5">•</span> Política de retenção com prazos definidos para cada categoria de dados</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Incidentes */}
      <section className="py-10 md:py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={22} />
              Incidentes de Segurança
            </h2>
            <div className="text-neutral-600 leading-relaxed space-y-3 text-sm md:text-base">
              <p>
                Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares,
                a Voltz se compromete a:
              </p>
              <ul className="space-y-2 ml-1">
                <li className="flex items-start gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> Comunicar a Autoridade Nacional de Proteção de Dados (ANPD) em prazo razoável</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> Notificar os titulares afetados sobre o incidente e medidas adotadas</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> Adotar medidas para reverter ou mitigar os efeitos do incidente</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 font-bold mt-0.5">•</span> Documentar o ocorrido e as providências tomadas</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Como exercer seus direitos */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="mx-auto text-blue-600 mb-4" size={32} />
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Como exercer seus direitos</h2>
          <p className="text-neutral-500 text-sm md:text-lg mb-6 md:mb-8 max-w-xl mx-auto">
            Para exercer qualquer um dos seus direitos como titular de dados, entre em contato
            com nosso Encarregado de Proteção de Dados (DPO).
          </p>

          <div className="bg-neutral-50 border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-8 max-w-md mx-auto text-left space-y-3 text-sm md:text-base">
            <div>
              <span className="text-neutral-400 text-xs block mb-0.5">E-mail do DPO</span>
              <span className="font-semibold">privacidade@voltz.com.br</span>
            </div>
            <div>
              <span className="text-neutral-400 text-xs block mb-0.5">E-mail geral</span>
              <span className="font-semibold">contato@voltz.com.br</span>
            </div>
            <div>
              <span className="text-neutral-400 text-xs block mb-0.5">Telefone</span>
              <span className="font-semibold">(11) 99999-0000</span>
            </div>
            <div>
              <span className="text-neutral-400 text-xs block mb-0.5">Prazo de resposta</span>
              <span className="font-semibold">Até 15 dias úteis</span>
            </div>
          </div>

          <p className="text-neutral-400 text-xs md:text-sm mt-6 max-w-lg mx-auto">
            A Voltz poderá solicitar informações adicionais para confirmar sua identidade
            antes de atender à requisição, garantindo a segurança dos seus dados.
          </p>
        </div>
      </section>

      {/* Links Relacionados */}
      <section className="py-10 md:py-14 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-bold text-base md:text-lg mb-4 text-center">Documentos relacionados</h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/politica-de-privacidade" className="bg-white border border-neutral-200 rounded-xl px-5 py-3 text-sm font-semibold text-center hover:border-blue-300 hover:shadow-sm transition-all">
              Política de Privacidade
            </Link>
            <Link href="/termos-de-uso" className="bg-white border border-neutral-200 rounded-xl px-5 py-3 text-sm font-semibold text-center hover:border-blue-300 hover:shadow-sm transition-all">
              Termos de Uso
            </Link>
            <Link href="/politica-de-utilizacao" className="bg-white border border-neutral-200 rounded-xl px-5 py-3 text-sm font-semibold text-center hover:border-blue-300 hover:shadow-sm transition-all">
              Política de Utilização
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
