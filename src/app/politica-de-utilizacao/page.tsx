import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { Shield, AlertTriangle, CheckCircle, XCircle, MessageCircle, Headphones } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Utilização — Voltz',
  description:
    'Conheça as regras de uso da plataforma Voltz. Saiba como funcionamos como intermediários entre candidatos e instrutores autônomos de trânsito.',
  alternates: {
    canonical: '/politica-de-utilizacao',
  },
}

export default function PoliticaDeUtilizacaoPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 md:pt-40 md:pb-20 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-neutral-100 text-neutral-700 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-6 border border-neutral-200">
            Regras da Plataforma
          </span>
          <h1 className="text-2xl md:text-5xl font-bold mb-3 md:mb-6">
            Política de <span className="text-[#EAB308]">Utilização</span>
          </h1>
          <p className="text-sm md:text-xl text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            Entenda como a Voltz funciona, nosso papel como intermediário e as regras de uso
            para candidatos e instrutores.
          </p>
        </div>
      </section>

      {/* Nosso Papel */}
      <section className="py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FACC15]/5 border border-[#FACC15]/30 rounded-xl md:rounded-2xl p-5 md:p-10">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="text-[#EAB308]" size={24} />
              O papel da Voltz
            </h2>
            <div className="text-neutral-600 leading-relaxed space-y-3 text-sm md:text-base">
              <p>
                A Voltz atua <strong className="text-neutral-900">exclusivamente como intermediário tecnológico</strong>,
                conectando candidatos à CNH com instrutores de trânsito autônomos credenciados pelo SENATRAN.
              </p>
              <div className="bg-white rounded-xl p-4 md:p-5 border border-neutral-200 space-y-2">
                <p className="font-bold text-neutral-900">O que a Voltz FAZ:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2 text-sm"><CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} /> Verifica credenciais e documentos dos instrutores</li>
                  <li className="flex items-start gap-2 text-sm"><CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} /> Exibe perfis verificados para busca pelos candidatos</li>
                  <li className="flex items-start gap-2 text-sm"><CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} /> Permite avaliações e comentários para transparência</li>
                  <li className="flex items-start gap-2 text-sm"><CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} /> Oferece suporte para dúvidas e problemas na plataforma</li>
                  <li className="flex items-start gap-2 text-sm"><CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} /> Suspende ou remove instrutores que violam as regras</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-5 border border-red-100 space-y-2">
                <p className="font-bold text-neutral-900">O que a Voltz NÃO faz:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2 text-sm"><XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> Não é autoescola e não presta formação de condutores</li>
                  <li className="flex items-start gap-2 text-sm"><XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> Não intermedia pagamentos entre candidatos e instrutores</li>
                  <li className="flex items-start gap-2 text-sm"><XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> Não se responsabiliza pela qualidade individual das aulas</li>
                  <li className="flex items-start gap-2 text-sm"><XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> Não emprega os instrutores — eles são profissionais autônomos</li>
                  <li className="flex items-start gap-2 text-sm"><XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> Não garante aprovação no exame prático do DETRAN</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instrutores Verificados */}
      <section className="py-10 md:py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-10">Instrutores verificados</h2>

          <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-8 shadow-sm mb-4 md:mb-6">
            <p className="text-neutral-600 text-sm md:text-base mb-4 leading-relaxed">
              Todos os instrutores cadastrados na Voltz passam por um <strong className="text-neutral-900">processo
              de verificação manual</strong> realizado pela nossa equipe antes de terem seus perfis publicados.
              Esse processo inclui:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Validação do registro SENATRAN ativo',
                'Conferência de CNH e certificados',
                'Verificação de comprovante de residência',
                'Análise do veículo (duplo comando obrigatório)',
                'Aprovação manual por administrador',
                'Monitoramento contínuo de avaliações',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 bg-green-50 rounded-lg p-3">
                  <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                  <span className="text-sm text-neutral-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-amber-800 text-xs md:text-sm leading-relaxed">
                <strong>Importante:</strong> Apesar da verificação, recomendamos que o candidato também confira
                as avaliações de outros alunos, converse com o instrutor antes de fechar e verifique
                pessoalmente as condições do veículo na primeira aula. A verificação da Voltz não substitui
                o bom senso do candidato.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Regras para Candidatos */}
      <section className="py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-10">Regras de utilização</h2>

          <div className="space-y-4 md:space-y-6">
            <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-8">
              <h3 className="text-base md:text-lg font-bold mb-4">Para candidatos</h3>
              <ul className="space-y-3 text-sm md:text-base text-neutral-600">
                <li className="flex items-start gap-2"><CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={16} /> Utilize a plataforma apenas para buscar instrutores para aulas práticas de habilitação</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={16} /> Verifique as avaliações e informações do instrutor antes de contratar</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={16} /> Mantenha matrícula ativa em um CFC (autoescola) conforme exigido por lei</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={16} /> Trate o instrutor com respeito e compareça nos horários combinados</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={16} /> Deixe avaliações honestas baseadas na sua experiência real</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={16} /> Reporte qualquer problema ou comportamento inadequado ao suporte</li>
              </ul>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-8">
              <h3 className="text-base md:text-lg font-bold mb-4">Para instrutores</h3>
              <ul className="space-y-3 text-sm md:text-base text-neutral-600">
                <li className="flex items-start gap-2"><CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={16} /> Mantenha o registro SENATRAN e todos os documentos sempre atualizados</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={16} /> Forneça informações verdadeiras e precisas no perfil</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={16} /> Utilize veículo com duplo comando e em perfeitas condições</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={16} /> Pratique preços justos e transparentes (sem cobranças ocultas)</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={16} /> Trate os candidatos com profissionalismo e paciência</li>
                <li className="flex items-start gap-2"><CheckCircle className="text-[#EAB308] flex-shrink-0 mt-0.5" size={16} /> Mantenha o plano de assinatura ativo para permanecer na plataforma</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Condutas Proibidas */}
      <section className="py-10 md:py-16 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-10">Condutas proibidas</h2>
          <div className="bg-white border border-red-100 rounded-xl md:rounded-2xl p-5 md:p-8">
            <p className="text-neutral-600 text-sm md:text-base mb-4">
              As seguintes condutas podem resultar em suspensão ou banimento permanente da plataforma:
            </p>
            <ul className="space-y-3 text-sm md:text-base text-neutral-600">
              <li className="flex items-start gap-2"><XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> Fornecer documentos falsos ou informações inverídicas</li>
              <li className="flex items-start gap-2"><XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> Criar avaliações falsas ou manipular o sistema de avaliações</li>
              <li className="flex items-start gap-2"><XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> Utilizar linguagem ofensiva, discriminatória ou ameaçadora</li>
              <li className="flex items-start gap-2"><XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> Lecionar sem registro ativo no SENATRAN</li>
              <li className="flex items-start gap-2"><XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> Utilizar veículo sem duplo comando ou em condições irregulares</li>
              <li className="flex items-start gap-2"><XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> Spam, phishing ou qualquer forma de uso malicioso da plataforma</li>
              <li className="flex items-start gap-2"><XCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} /> Praticar preços abusivos ou cobranças não informadas previamente</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Suporte e Contato */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Headphones className="mx-auto text-[#EAB308] mb-4" size={32} />
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">Suporte e Contato</h2>
          <p className="text-neutral-500 text-sm md:text-lg mb-6 md:mb-8 max-w-xl mx-auto">
            Tanto candidatos quanto instrutores podem entrar em contato com nosso suporte
            a qualquer momento para esclarecer dúvidas, reportar problemas ou fazer denúncias.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 md:gap-4 max-w-lg mx-auto mb-8">
            <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-5">
              <MessageCircle className="mx-auto text-green-500 mb-2" size={24} />
              <p className="font-bold text-sm mb-1">WhatsApp</p>
              <p className="text-neutral-500 text-xs">(11) 99999-0000</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl p-4 md:p-5">
              <Headphones className="mx-auto text-blue-500 mb-2" size={24} />
              <p className="font-bold text-sm mb-1">E-mail</p>
              <p className="text-neutral-500 text-xs">suporte@voltz.com.br</p>
            </div>
          </div>

          <p className="text-neutral-400 text-xs md:text-sm max-w-md mx-auto">
            Nosso compromisso é responder todas as solicitações em até 48 horas úteis.
            Denúncias graves são tratadas com prioridade máxima.
          </p>
        </div>
      </section>

      {/* Links */}
      <section className="py-10 md:py-14 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-bold text-base md:text-lg mb-4 text-center">Documentos relacionados</h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/termos-de-uso" className="bg-white border border-neutral-200 rounded-xl px-5 py-3 text-sm font-semibold text-center hover:border-[#FACC15] hover:shadow-sm transition-all">
              Termos de Uso
            </Link>
            <Link href="/politica-de-privacidade" className="bg-white border border-neutral-200 rounded-xl px-5 py-3 text-sm font-semibold text-center hover:border-[#FACC15] hover:shadow-sm transition-all">
              Política de Privacidade
            </Link>
            <Link href="/lgpd" className="bg-white border border-neutral-200 rounded-xl px-5 py-3 text-sm font-semibold text-center hover:border-[#FACC15] hover:shadow-sm transition-all">
              LGPD
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
