import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Voltz',
  description:
    'Saiba como a Voltz coleta, utiliza e protege seus dados pessoais. Nossa política está em conformidade com a LGPD.',
  alternates: {
    canonical: '/politica-de-privacidade',
  },
}

export default function PoliticaDePrivacidadePage() {
  const ultimaAtualizacao = '28 de março de 2026'

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar />

      <div className="pt-24 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Política de Privacidade</h1>
          <p className="text-neutral-400 text-xs md:text-sm mb-8 md:mb-12">
            Última atualização: {ultimaAtualizacao}
          </p>

          <div className="space-y-8 md:space-y-10 text-sm md:text-base text-neutral-600 leading-relaxed">
            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">1. Introdução</h2>
              <p>
                A Voltz está comprometida com a proteção da privacidade dos seus usuários.
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e
                protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de
                Dados Pessoais (LGPD — Lei nº 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">2. Dados que Coletamos</h2>
              <p className="mb-3">Podemos coletar os seguintes tipos de dados pessoais:</p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Dados de identificação</h3>
                  <p>Nome completo, CPF/CNPJ, data de nascimento, gênero, e-mail, telefone e foto de perfil.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Dados profissionais (instrutores)</h3>
                  <p>Registro SENATRAN, categorias de habilitação, anos de experiência, veículos, documentos profissionais e localização de atendimento.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Dados de uso</h3>
                  <p>Informações sobre como você utiliza a plataforma, incluindo páginas acessadas, tempo de navegação, dispositivo utilizado e endereço IP.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Dados de avaliações</h3>
                  <p>Notas, comentários e respostas publicados na plataforma.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">3. Como Utilizamos seus Dados</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Criar e gerenciar sua conta na plataforma.</li>
                <li>Conectar candidatos a instrutores autônomos credenciados.</li>
                <li>Exibir perfis de instrutores nas buscas e páginas públicas.</li>
                <li>Verificar credenciais e documentos de instrutores.</li>
                <li>Enviar comunicações sobre sua conta, atualizações e novidades da plataforma.</li>
                <li>Melhorar e personalizar a experiência do usuário.</li>
                <li>Cumprir obrigações legais e regulatórias.</li>
                <li>Prevenir fraudes e garantir a segurança da plataforma.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">4. Compartilhamento de Dados</h2>
              <p className="mb-3">Seus dados pessoais podem ser compartilhados com:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Outros usuários da plataforma:</strong> informações do perfil público de instrutores são visíveis para candidatos que utilizam a busca.</li>
                <li><strong>Prestadores de serviços:</strong> empresas que nos auxiliam na operação da plataforma (hospedagem, envio de e-mails, análise de dados).</li>
                <li><strong>Autoridades competentes:</strong> quando exigido por lei, ordem judicial ou regulamentação aplicável.</li>
              </ul>
              <p className="mt-3 font-semibold text-neutral-900">
                A Voltz nunca vende seus dados pessoais a terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">5. Armazenamento e Segurança</h2>
              <p>
                Seus dados são armazenados em servidores seguros com criptografia e protocolos de
                segurança atualizados. Adotamos medidas técnicas e organizacionais adequadas para
                proteger seus dados contra acesso não autorizado, perda, alteração ou destruição.
                Os dados são retidos pelo tempo necessário para cumprir as finalidades descritas
                nesta política ou conforme exigido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">6. Seus Direitos (LGPD)</h2>
              <p className="mb-3">De acordo com a LGPD, você tem direito a:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e acessar as informações.</li>
                <li><strong>Correção:</strong> solicitar a correção de dados incompletos, inexatos ou desatualizados.</li>
                <li><strong>Anonimização ou eliminação:</strong> solicitar a anonimização ou exclusão de dados desnecessários.</li>
                <li><strong>Portabilidade:</strong> solicitar a transferência de seus dados a outro fornecedor.</li>
                <li><strong>Revogação do consentimento:</strong> retirar seu consentimento a qualquer momento.</li>
                <li><strong>Oposição:</strong> opor-se ao tratamento de dados em determinadas circunstâncias.</li>
              </ul>
              <p className="mt-3">
                Para exercer qualquer desses direitos, entre em contato pelo e-mail{' '}
                <span className="font-semibold text-neutral-900">privacidade@voltz.com.br</span>.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">7. Cookies</h2>
              <p>
                Utilizamos cookies e tecnologias similares para melhorar sua experiência na
                plataforma, lembrar suas preferências e analisar o tráfego do site. Você pode
                gerenciar as preferências de cookies nas configurações do seu navegador. A desativação
                de alguns cookies pode afetar a funcionalidade da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">8. Menores de Idade</h2>
              <p>
                A plataforma Voltz não é direcionada a menores de 18 anos. Não coletamos
                intencionalmente dados pessoais de menores. Caso identifiquemos que dados de um
                menor foram coletados, eles serão prontamente eliminados.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">9. Alterações nesta Política</h2>
              <p>
                Esta Política de Privacidade pode ser atualizada periodicamente. Notificaremos
                sobre mudanças significativas por meio da plataforma ou por e-mail. Recomendamos
                que você revise esta página regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">10. Contato e Encarregado de Dados (DPO)</h2>
              <p className="mb-2">
                Para questões relacionadas à privacidade e proteção de dados, entre em contato:
              </p>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 md:p-5 space-y-1 text-sm">
                <p><strong>E-mail:</strong> privacidade@voltz.com.br</p>
                <p><strong>E-mail geral:</strong> contato@voltz.com.br</p>
                <p><strong>Telefone:</strong> (11) 99999-0000</p>
              </div>
            </section>
          </div>

          <div className="mt-10 md:mt-14 pt-6 border-t border-neutral-200">
            <Link
              href="/"
              className="text-[#EAB308] font-semibold text-sm hover:underline"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
