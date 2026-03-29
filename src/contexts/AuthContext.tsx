'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { supabase, useMock } from '@/lib/supabase'
import { getInstrutorPorUserId } from '@/lib/db'
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
  logout: () => void
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
      if (useMock) {
        // Mock: restaurar do localStorage
        const saved = localStorage.getItem('voltz_user')
        if (saved) {
          try {
            setUser(JSON.parse(saved))
          } catch {
            localStorage.removeItem('voltz_user')
          }
        }
        setIsReady(true)
        return
      }

      // Supabase: verificar sessão ativa
      const { data: { session } } = await supabase!.auth.getSession()

      if (session?.user) {
        const meta = session.user.user_metadata || {}
        const isEmailAdmin = session.user.email === 'admin@voltz.com.br'
        const role: UserRole = meta.role === 'admin' || isEmailAdmin ? 'admin' : 'instrutor'
        const nome = meta.nome || (isEmailAdmin ? 'Administrador' : session.user.email?.split('@')[0]) || ''
        const authUser = await carregarInstrutor(session.user.id, session.user.email!, nome, role)
        setUser(authUser)
      }

      setIsReady(true)
    }

    restaurarSessao()

    // Escutar mudanças de autenticação (login/logout em outra aba)
    if (!useMock && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const meta = session.user.user_metadata || {}
          const isEmailAdmin = session.user.email === 'admin@voltz.com.br'
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

    if (useMock) {
      // Mock login
      await new Promise((r) => setTimeout(r, 800))

      if (email === 'admin@voltz.com.br') {
        const adminUser: AuthUser = {
          id: 'admin-1',
          nome: 'Administrador',
          email: 'admin@voltz.com.br',
          role: 'admin',
        }
        setUser(adminUser)
        localStorage.setItem('voltz_user', JSON.stringify(adminUser))
        setIsLoading(false)
        return { success: true }
      }

      const { mockInstrutores } = await import('@/lib/mock-instrutores')
      const instrutor = mockInstrutores.find((i) => i.email === email)

      if (instrutor) {
        const instrutorUser: AuthUser = {
          id: instrutor.id,
          nome: instrutor.nome,
          email: instrutor.email,
          role: 'instrutor',
          instrutor,
        }
        setUser(instrutorUser)
        localStorage.setItem('voltz_user', JSON.stringify(instrutorUser))
        setIsLoading(false)
        return { success: true }
      }

      setIsLoading(false)
      return { success: false, error: 'E-mail ou senha inválidos' }
    }

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
      const isEmailAdmin = data.user.email === 'admin@voltz.com.br'
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

    if (useMock) {
      await new Promise((r) => setTimeout(r, 800))
      const mockUser: AuthUser = {
        id: `mock-${Date.now()}`,
        nome,
        email,
        role: 'instrutor',
      }
      setUser(mockUser)
      localStorage.setItem('voltz_user', JSON.stringify(mockUser))
      setIsLoading(false)
      return { success: true, userId: mockUser.id }
    }

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
      if (useMock) localStorage.setItem('voltz_user', JSON.stringify(updated))
    }
  }, [user])

  // Logout
  const logout = useCallback(async () => {
    if (!useMock && supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    localStorage.removeItem('voltz_user')
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
