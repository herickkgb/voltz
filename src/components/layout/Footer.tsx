import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white pt-10 md:pt-16 pb-6 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="text-xl md:text-2xl">⚡</span>
              <span className="text-lg md:text-xl font-bold text-[#FACC15]">Voltz</span>
            </Link>
            <p className="text-neutral-400 text-xs md:text-sm leading-relaxed">
              Acelere sua habilitação. Conectamos você ao melhor instrutor autônomo da sua região.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-3 md:mb-4 text-white">Plataforma</h4>
            <ul className="space-y-2 md:space-y-3">
              <li><Link href="/buscar" className="text-neutral-400 hover:text-white text-xs md:text-sm transition-colors">Buscar Instrutores</Link></li>
              <li><Link href="/seja-instrutor" className="text-neutral-400 hover:text-white text-xs md:text-sm transition-colors">Seja Instrutor</Link></li>
              <li><Link href="/nova-lei" className="text-neutral-400 hover:text-white text-xs md:text-sm transition-colors">Nova Lei CNH</Link></li>
              <li><Link href="/sobre" className="text-neutral-400 hover:text-white text-xs md:text-sm transition-colors">Sobre a Voltz</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-3 md:mb-4 text-white">Legal</h4>
            <ul className="space-y-2 md:space-y-3">
              <li><Link href="/termos-de-uso" className="text-neutral-400 hover:text-white text-xs md:text-sm transition-colors">Termos de Uso</Link></li>
              <li><Link href="/politica-de-privacidade" className="text-neutral-400 hover:text-white text-xs md:text-sm transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/politica-de-utilizacao" className="text-neutral-400 hover:text-white text-xs md:text-sm transition-colors">Política de Utilização</Link></li>
              <li><Link href="/lgpd" className="text-neutral-400 hover:text-white text-xs md:text-sm transition-colors">LGPD</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs md:text-sm mb-3 md:mb-4 text-white">Contato</h4>
            <ul className="space-y-2 md:space-y-3">
              <li><span className="text-neutral-400 text-xs md:text-sm">contato@voltz.com.br</span></li>
              <li><span className="text-neutral-400 text-xs md:text-sm">(11) 99999-0000</span></li>
              <li><Link href="/#faq" className="text-neutral-400 hover:text-white text-xs md:text-sm transition-colors">Perguntas Frequentes</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
          <p className="text-neutral-400 text-xs md:text-sm">
            © 2025 Voltz. Todos os direitos reservados.
          </p>
          <p className="text-neutral-500 text-[10px] md:text-xs text-center">
            Voltz não é uma autoescola. Conectamos candidatos a instrutores autônomos credenciados.
          </p>
        </div>
      </div>
    </footer>
  )
}
