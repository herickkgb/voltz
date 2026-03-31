'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function RedefinirSenhaPage() {
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Optional check to ensure session
    const checkSession = async () => {
      const { data: { session } } = await supabase!.auth.getSession()
      if (!session) {
        const hash = window.location.hash
        if (!hash || (!hash.includes('access_token') && !hash.includes('recovery'))) {
          // You might not be authenticated yet or no session is found, but let's wait to see if PKCE kicks in.
        }
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!senha || !confirmarSenha) {
      toast.error('Preencha os dois campos de senha.')
      return
    }

    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem.')
      return
    }

    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setIsLoading(true)

    const { error } = await supabase!.auth.updateUser({ password: senha })

    setIsLoading(false)

    if (error) {
      toast.error(error.message || 'Erro ao redefinir a senha.')
    } else {
      toast.success('Senha redefinida com sucesso! Faça login com a nova senha.')
      await supabase!.auth.signOut()
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />

      <div className="pt-24 pb-16 md:pt-32 md:pb-20 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white border border-neutral-200 rounded-xl md:rounded-2xl p-5 md:p-8 space-y-4 md:space-y-5 shadow-sm">
            <h1 className="text-2xl font-bold text-neutral-900 text-center mb-6">Redefinir Senha</h1>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-2 block">Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Sua nova senha"
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

              <div>
                <label className="text-sm font-semibold text-neutral-700 mb-2 block">Confirmar Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Confirme sua nova senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-12 pr-12 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FACC15] text-neutral-900 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-yellow-400/20 hover:bg-[#EAB308] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
