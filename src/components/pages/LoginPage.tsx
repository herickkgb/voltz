'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPageClient() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const { login, isLoading, user, isReady, isAdmin } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (isReady && user) {
      router.push(isAdmin ? '/admin' : '/painel')
    }
  }, [isReady, user, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !senha) {
      toast.error('Preencha todos os campos')
      return
    }

    const resultado = await login(email, senha)
    if (resultado.success) {
      toast.success('Login realizado com sucesso!')
      if (email === 'admin@voltz.com.br') {
        router.push('/admin')
      } else {
        router.push('/painel')
      }
    } else {
      toast.error(resultado.error || 'E-mail ou senha inválidos')
    }
  }

  if (isReady && user) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <Navbar />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FACC15]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <div className="pt-24 pb-16 md:pt-32 md:pb-20 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-1.5 md:mb-2">Entrar</h1>
            <p className="text-neutral-500 text-sm md:text-base">Acesse sua conta de instrutor</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-8 space-y-4 md:space-y-5 shadow-sm">
            <div>
              <label className="text-sm font-semibold text-neutral-700 mb-2 block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-12 pr-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-neutral-700 mb-2 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-12 pr-12 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-neutral-300 text-[#FACC15] focus:ring-[#FACC15]/20"
                />
                <span className="text-neutral-500">Lembrar de mim</span>
              </label>
              <a href="#" className="text-[#EAB308] font-semibold hover:underline">
                Esqueci a senha
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FACC15] text-neutral-900 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-yellow-400/20 hover:bg-[#EAB308] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>


            <p className="text-center text-neutral-500 text-sm">
              Ainda não tem conta?{' '}
              <Link href="/seja-instrutor" className="text-[#EAB308] font-semibold hover:underline">
                Cadastre-se como instrutor
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
