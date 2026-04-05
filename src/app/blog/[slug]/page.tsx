import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getPost, getAllPosts } from '@/lib/blog'
import { Clock, Tag, ArrowLeft, Search } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Post não encontrado' }
  return {
    title: post.titulo,
    description: post.descricao,
    openGraph: {
      title: post.titulo,
      description: post.descricao,
      type: 'article',
      publishedTime: post.publicadoEm,
    },
  }
}

// Conversor simples de Markdown para HTML (sem dependência)
function renderMarkdown(md: string): string {
  return md
    .trim()
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 text-neutral-900">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2 text-neutral-900">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc text-neutral-700">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-5 list-decimal text-neutral-700">$2</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#EAB308] font-semibold hover:underline">$1</a>')
    .replace(/\|(.+)\|/g, (line) => {
      if (line.includes('---')) return ''
      const cells = line.split('|').filter(c => c.trim())
      const isHeader = cells.every(() => true)
      const tag = isHeader ? 'td' : 'td'
      return `<tr class="border-b border-neutral-100">${cells.map(c => `<${tag} class="px-3 py-2 text-sm text-neutral-700">${c.trim()}</${tag}>`).join('')}</tr>`
    })
    .replace(/(<tr.*<\/tr>)/gs, (match) => `<table class="w-full border border-neutral-200 rounded-lg overflow-hidden my-4">${match}</table>`)
    .replace(/^(?!<[h|l|t|u|o]).+$/gm, (line) => line.trim() ? `<p class="text-neutral-700 leading-relaxed mb-3">${line}</p>` : '')
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const outrosPosts = getAllPosts().filter(p => p.slug !== slug).slice(0, 3)

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <div className="pt-20 md:pt-24 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-6 text-sm"
          >
            <ArrowLeft size={16} /> Voltar ao blog
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <span className="bg-[#FACC15]/15 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Tag size={11} /> {post.categoria}
            </span>
            <span className="text-neutral-400 text-xs flex items-center gap-1">
              <Clock size={11} /> {post.tempoLeitura} min de leitura
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">{post.titulo}</h1>
          <p className="text-neutral-500 text-base mb-2">{post.descricao}</p>
          <p className="text-neutral-400 text-sm mb-8">
            Publicado em {new Date(post.publicadoEm).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div
            className="prose-content bg-white border border-neutral-200 rounded-2xl p-6 md:p-8"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.conteudo) }}
          />

          {/* CTA */}
          <div className="mt-10 bg-[#FACC15] rounded-2xl p-6 md:p-8 text-center">
            <h3 className="font-bold text-xl mb-2">Pronto para encontrar seu instrutor?</h3>
            <p className="text-neutral-700 text-sm mb-4">Compare instrutores verificados pelo SENATRAN perto de você.</p>
            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors"
            >
              <Search size={16} /> Buscar Instrutores
            </Link>
          </div>

          {/* Outros posts */}
          {outrosPosts.length > 0 && (
            <div className="mt-10">
              <h3 className="font-bold text-lg mb-4">Leia também</h3>
              <div className="space-y-3">
                {outrosPosts.map(p => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="flex items-start gap-3 bg-white border border-neutral-200 rounded-xl p-4 hover:border-[#FACC15] transition-colors group"
                  >
                    <span className="bg-[#FACC15]/15 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">{p.categoria}</span>
                    <span className="text-sm font-semibold group-hover:text-[#EAB308] transition-colors leading-snug">{p.titulo}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
