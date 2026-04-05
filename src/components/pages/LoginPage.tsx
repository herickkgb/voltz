'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { checkRateLimit, recordFailedAttempt, clearRateLimit, formatWaitTime } from '@/lib/rateLimit'

export default function LoginPageClient() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [isRecuperandoSenha, setIsRecuperandoSenha] = useState(false)
  const { login, recuperarSenha, isLoading, user, isReady, isAdmin } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (isReady && user) {
      router.push(isAdmin ? '/admin' : '/painel')
    }
  }, [isReady, user, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isRecuperandoSenha) {
      if (!email) {
        toast.error('Preencha o e-mail para recuperar a senha')
        return
      }
      const rl = checkRateLimit(`recover:${email}`)
      if (!rl.allowed) {
        toast.error(`Muitas tentativas. Aguarde ${formatWaitTime(rl.waitSeconds!)} para tentar novamente.`)
        return
      }
      const resultado = await recuperarSenha(email)
      if (resultado.success) {
        toast.success('E-mail de recuperação enviado! Verifique sua caixa de entrada e spam.')
      } else {
        recordFailedAttempt(`recover:${email}`)
        toast.error(resultado.error || 'Erro ao tentar recuperar a senha')
      }
      return
    }

    if (!email || !senha) {
      toast.error('Preencha todos os campos')
      return
    }

    const rl = checkRateLimit(`login:${email}`)
    if (!rl.allowed) {
      toast.error(`Conta temporariamente bloqueada. Aguarde ${formatWaitTime(rl.waitSeconds!)} para tentar novamente.`)
      return
    }

    const resultado = await login(email, senha)
    if (resultado.success) {
      clearRateLimit(`login:${email}`)
      toast.success('Login realizado com sucesso!')
      // Redirect é gerenciado pelo useEffect acima (isAdmin detectado via user_metadata)
    } else {
      const { locked, attemptsLeft } = recordFailedAttempt(`login:${email}`)
      if (locked) {
        toast.error('Muitas tentativas incorretas. Conta bloqueada por 15 minutos.')
      } else {
        toast.error(`${resultado.error || 'E-mail ou senha inválidos'} (${attemptsLeft} tentativa${attemptsLeft !== 1 ? 's' : ''} restante${attemptsLeft !== 1 ? 's' : ''})`)
      }
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-5 mb-6 md:mb-8 text-center shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-red-900 mb-2">⚠️ Login do Instrutor</h1>
            <p className="text-red-700 text-sm md:text-base leading-relaxed">
              Esta área é <strong className="font-bold">exclusiva para profissionais</strong> gerenciarem seus perfis e planos.
            </p>
            <div className="mt-3 bg-white/60 rounded-lg p-2.5">
              <p className="text-red-800 text-xs md:text-sm">
                🎓 <strong className="font-semibold">Você é aluno?</strong> Não é necessário criar conta! Você pode buscar e falar com nossos instrutores livremente pela <Link href="/" className="underline hover:text-red-900 font-bold">página inicial</Link>.
              </p>
            </div>
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

            {!isRecuperandoSenha && (
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
            )}

            {isRecuperandoSenha ? (
              <>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FACC15] text-neutral-900 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-yellow-400/20 hover:bg-[#EAB308] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isLoading ? 'Enviando...' : 'Recuperar Senha'}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setIsRecuperandoSenha(false); }}
                    className="text-neutral-500 font-semibold hover:text-neutral-700 text-sm"
                  >
                    Voltar ao login
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-neutral-300 text-[#FACC15] focus:ring-[#FACC15]/20"
                    />
                    <span className="text-neutral-500">Lembrar de mim</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsRecuperandoSenha(true)}
                    className="text-[#EAB308] font-semibold hover:underline"
                  >
                    Esqueci a senha
                  </button>
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
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
