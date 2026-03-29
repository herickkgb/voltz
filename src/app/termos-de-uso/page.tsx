import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso — Voltz',
  description:
    'Leia os Termos de Uso da plataforma Voltz. Saiba as condições de uso para candidatos e instrutores autônomos de trânsito.',
  alternates: {
    canonical: '/termos-de-uso',
  },
}

export default function TermosDeUsoPage() {
  const ultimaAtualizacao = '28 de março de 2026'

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar />

      <div className="pt-24 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Termos de Uso</h1>
          <p className="text-neutral-400 text-xs md:text-sm mb-8 md:mb-12">
            Última atualização: {ultimaAtualizacao}
          </p>

          <div className="space-y-8 md:space-y-10 text-sm md:text-base text-neutral-600 leading-relaxed">
            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar a plataforma Voltz, você concorda com estes Termos de Uso.
                Caso não concorde com algum dos termos aqui descritos, solicitamos que não utilize
                nossos serviços. O uso continuado da plataforma constitui aceitação integral destes termos.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">2. Sobre a Plataforma</h2>
              <p className="mb-3">
                A Voltz é uma plataforma de tecnologia que conecta candidatos à Carteira Nacional de
                Habilitação (CNH) com instrutores de trânsito autônomos credenciados pelo SENATRAN.
              </p>
              <p className="font-semibold text-neutral-900">
                A Voltz não é uma autoescola e não presta serviços de formação de condutores.
                Atuamos exclusivamente como intermediários tecnológicos, facilitando o contato entre
                candidatos e instrutores autônomos.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">3. Cadastro e Conta</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Para utilizar os serviços da plataforma, é necessário criar uma conta com informações verdadeiras e atualizadas.</li>
                <li>Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.</li>
                <li>A Voltz reserva-se o direito de suspender ou encerrar contas que violem estes termos ou apresentem informações falsas.</li>
                <li>Instrutores devem fornecer documentação válida e manter credenciais atualizadas junto ao SENATRAN.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">4. Responsabilidades do Candidato</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Verificar as credenciais e avaliações do instrutor antes de contratar.</li>
                <li>Comparecer pontualmente às aulas agendadas.</li>
                <li>Tratar o instrutor e seu veículo com respeito.</li>
                <li>Realizar o pagamento diretamente ao instrutor conforme acordado.</li>
                <li>Manter matrícula ativa em um Centro de Formação de Condutores (CFC) conforme exigido pela legislação.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">5. Responsabilidades do Instrutor</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Manter registro ativo e válido junto ao SENATRAN.</li>
                <li>Utilizar veículo adaptado com duplo comando e em conformidade com as normas do CONTRAN.</li>
                <li>Manter seguro obrigatório e documentação do veículo em dia.</li>
                <li>Prestar serviços com profissionalismo, pontualidade e respeito ao candidato.</li>
                <li>Manter informações do perfil atualizadas e verídicas na plataforma.</li>
                <li>Cumprir com os planos de assinatura contratados junto à Voltz.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">6. Pagamentos e Assinaturas</h2>
              <p className="mb-3">
                Os pagamentos pelas aulas práticas são realizados diretamente entre o candidato e o
                instrutor, sem intermediação da Voltz. A plataforma não se responsabiliza por disputas
                financeiras entre as partes.
              </p>
              <p>
                Instrutores pagam uma assinatura mensal para manter seu perfil ativo na plataforma.
                Os valores e benefícios de cada plano estão disponíveis na área do instrutor.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">7. Avaliações e Comentários</h2>
              <p>
                Os candidatos podem avaliar e comentar sobre os instrutores após as aulas.
                As avaliações devem ser honestas, respeitosas e baseadas em experiências reais.
                A Voltz reserva-se o direito de remover avaliações que contenham conteúdo ofensivo,
                difamatório, spam ou que não correspondam a uma experiência real.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">8. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo da plataforma Voltz, incluindo marca, logotipo, design, textos e
                código-fonte, são de propriedade exclusiva da Voltz e protegidos pela legislação
                brasileira de propriedade intelectual. É proibida a reprodução, distribuição ou
                modificação sem autorização prévia.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">9. Limitação de Responsabilidade</h2>
              <p>
                A Voltz não se responsabiliza por danos diretos, indiretos, incidentais ou consequenciais
                decorrentes do uso da plataforma ou da relação entre candidatos e instrutores. A
                plataforma é fornecida &quot;como está&quot;, sem garantias de qualquer natureza, expressas
                ou implícitas.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">10. Alterações nos Termos</h2>
              <p>
                A Voltz pode atualizar estes Termos de Uso a qualquer momento. As alterações serão
                comunicadas por meio da plataforma e entrarão em vigor na data de publicação.
                O uso continuado da plataforma após alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">11. Foro e Legislação Aplicável</h2>
              <p>
                Estes Termos de Uso são regidos pela legislação brasileira. Para dirimir quaisquer
                controvérsias, fica eleito o foro da Comarca de São Paulo/SP, com exclusão de
                qualquer outro, por mais privilegiado que seja.
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-neutral-900 mb-3 md:mb-4">12. Contato</h2>
              <p>
                Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail{' '}
                <span className="font-semibold text-neutral-900">contato@voltz.com.br</span> ou
                pelo telefone <span className="font-semibold text-neutral-900">(11) 99999-0000</span>.
              </p>
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
