import { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getAllPosts } from '@/lib/blog'
import { Clock, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog — Dicas sobre CNH e Instrutores de Trânsito',
  description: 'Artigos sobre a nova lei CNH, como escolher instrutores, dicas para prova prática e muito mais. Tudo o que você precisa saber para tirar sua habilitação.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <div className="pt-20 md:pt-24 pb-16 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Blog</h1>
            <p className="text-neutral-500">Dicas, guias e novidades sobre CNH e instrutores de trânsito</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white border border-neutral-200 rounded-2xl p-6 hover:border-[#FACC15] hover:shadow-lg hover:shadow-yellow-400/10 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[#FACC15]/15 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Tag size={11} /> {post.categoria}
                  </span>
                </div>
                <h2 className="font-bold text-lg leading-snug mb-2 group-hover:text-[#EAB308] transition-colors">
                  {post.titulo}
                </h2>
                <p className="text-neutral-500 text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.descricao}
                </p>
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {post.tempoLeitura} min de leitura
                  </span>
                  <span>
                    {new Date(post.publicadoEm).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
