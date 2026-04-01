'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { getInstrutorPorUserId, atualizarUltimoLogin } from '@/lib/db'
import type { Instrutor } from '@/types'

type UserRole = 'instrutor' | 'admin'

interface AuthUser {
  id: string
  nome: string
  email: string
  role: UserRole
  instrutor?: Instrutor
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isReady: boolean
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>
  registrar: (email: string, senha: string, nome: string) => Promise<{ success: boolean; error?: string; userId?: string }>
  logout: () => Promise<void>
  recuperarSenha: (email: string) => Promise<{ success: boolean; error?: string }>
  recarregarInstrutor: () => Promise<void>
  isAdmin: boolean
  isInstrutor: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar dados do instrutor a partir do user_id
  const carregarInstrutor = useCallback(async (userId: string, email: string, nome: string, role: UserRole): Promise<AuthUser> => {
    if (role === 'admin') {
      return { id: userId, nome, email, role: 'admin' }
    }

    const instrutor = await getInstrutorPorUserId(userId)
    if (instrutor) {
      atualizarUltimoLogin(instrutor.id).catch(console.error)
    }
    
    return {
      id: userId,
      nome: instrutor?.nome || nome,
      email,
      role: 'instrutor',
      instrutor: instrutor || undefined,
    }
  }, [])

  // Restaurar sessão
  useEffect(() => {
    const restaurarSessao = async () => {
      // Supabase: verificar sessão ativa
      const { data: { session } } = await supabase!.auth.getSession()

      if (session?.user) {
        const meta = session.user.user_metadata || {}
        const isEmailAdmin = session.user.email === 'admin@buscarinstrutor.com.br'
        const role: UserRole = meta.role === 'admin' || isEmailAdmin ? 'admin' : 'instrutor'
        const nome = meta.nome || (isEmailAdmin ? 'Administrador' : session.user.email?.split('@')[0]) || ''
        const authUser = await carregarInstrutor(session.user.id, session.user.email!, nome, role)
        setUser(authUser)
      }

      setIsReady(true)
    }

    restaurarSessao()

    // Escutar mudanças de autenticação (login/logout em outra aba)
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const meta = session.user.user_metadata || {}
          const isEmailAdmin = session.user.email === 'admin@buscarinstrutor.com.br'
          const role: UserRole = meta.role === 'admin' || isEmailAdmin ? 'admin' : 'instrutor'
          const nome = meta.nome || (isEmailAdmin ? 'Administrador' : session.user.email?.split('@')[0]) || ''
          const authUser = await carregarInstrutor(session.user.id, session.user.email!, nome, role)
          setUser(authUser)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [carregarInstrutor])

  // Login
  const login = useCallback(async (email: string, senha: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    // Supabase Auth
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setIsLoading(false)
      const mensagem = error.message === 'Invalid login credentials'
        ? 'E-mail ou senha inválidos'
        : error.message
      return { success: false, error: mensagem }
    }

    if (data.user) {
      const meta = data.user.user_metadata || {}
      const isEmailAdmin = data.user.email === 'admin@buscarinstrutor.com.br'
      const role: UserRole = meta.role === 'admin' || isEmailAdmin ? 'admin' : 'instrutor'
      const nome = meta.nome || (isEmailAdmin ? 'Administrador' : data.user.email?.split('@')[0]) || ''
      const authUser = await carregarInstrutor(data.user.id, data.user.email!, nome, role)
      setUser(authUser)
    }

    setIsLoading(false)
    return { success: true }
  }, [carregarInstrutor])

  // Registrar novo usuário
  const registrar = useCallback(async (email: string, senha: string, nome: string): Promise<{ success: boolean; error?: string; userId?: string }> => {
    setIsLoading(true)

    const { data, error } = await supabase!.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, role: 'instrutor' },
      },
    })

    if (error) {
      setIsLoading(false)
      const mensagem = error.message === 'User already registered'
        ? 'Este e-mail já está cadastrado'
        : error.message
      return { success: false, error: mensagem }
    }

    if (data.user) {
      const authUser: AuthUser = {
        id: data.user.id,
        nome,
        email,
        role: 'instrutor',
      }
      setUser(authUser)
    }

    setIsLoading(false)
    return { success: true, userId: data.user?.id }
  }, [])

  // Recarregar dados do instrutor (após editar perfil, etc)
  const recarregarInstrutor = useCallback(async () => {
    if (!user) return
    if (user.role === 'admin') return

    const instrutor = await getInstrutorPorUserId(user.id)
    if (instrutor) {
      const updated = { ...user, instrutor, nome: instrutor.nome }
      setUser(updated)
    }
  }, [user])

  // Recuperar senha
  const recuperarSenha = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    const resetUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/redefinir-senha`
      : 'https://buscarinstrutor.com.br/redefinir-senha'

    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    })

    setIsLoading(false)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    setUser(null)
    localStorage.removeItem('buscarinstrutor_user')
    if (supabase) {
      await supabase.auth.signOut({ scope: 'local' })
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isReady,
        login,
        registrar,
        logout,
        recuperarSenha,
        recarregarInstrutor,
        isAdmin: user?.role === 'admin',
        isInstrutor: user?.role === 'instrutor',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
