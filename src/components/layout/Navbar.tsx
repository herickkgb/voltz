'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User, Shield } from 'lucide-react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isReady, isAdmin, isInstrutor, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    setMobileOpen(false)
    window.location.href = '/'
  }

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-removebg-preview.png" alt="Buscar Instrutor Logo" width={120} height={48} className="h-9 md:h-12 w-auto object-contain drop-shadow-sm" />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#como-funciona"
              className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium"
            >
              Como Funciona
            </Link>
            <Link
              href="/nova-lei"
              className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium"
            >
              Nova Lei
            </Link>
            <Link
              href="/seja-instrutor"
              className="text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium"
            >
              Para Instrutores
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isReady && user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium"
                  >
                    <Shield size={16} />
                    Admin
                  </Link>
                )}
                {isInstrutor && (
                  <Link
                    href="/painel"
                    className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-medium"
                  >
                    <User size={16} />
                    Meu Painel
                  </Link>
                )}
                <span className="text-sm text-neutral-400 hidden lg:inline">
                  {user.nome.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 border-2 border-neutral-200 text-neutral-500 px-3 py-2 rounded-xl font-medium text-sm hover:border-red-300 hover:text-red-500 transition-all duration-200"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </>
            ) : isReady ? (
              <>
                <Link
                  href="/login"
                  className="border-2 border-neutral-900 text-neutral-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-neutral-900 hover:text-white transition-all duration-200"
                >
                  Entrar
                </Link>
                <Link
                  href="/seja-instrutor"
                  className="bg-[#FACC15] text-neutral-900 px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-yellow-400/20 hover:bg-[#EAB308] hover:shadow-xl hover:shadow-yellow-400/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Seja Instrutor
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-neutral-900 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

    </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 top-14 md:top-16 bg-white z-50 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col p-6 gap-6 min-h-full bg-white">
              <Link
                href="/#como-funciona"
                onClick={() => setMobileOpen(false)}
                className="text-neutral-500 hover:text-neutral-900 transition-colors text-lg font-medium"
              >
                Como Funciona
              </Link>
              <Link
                href="/nova-lei"
                onClick={() => setMobileOpen(false)}
                className="text-neutral-500 hover:text-neutral-900 transition-colors text-lg font-medium"
              >
                Nova Lei
              </Link>
              <Link
                href="/seja-instrutor"
                onClick={() => setMobileOpen(false)}
                className="text-neutral-500 hover:text-neutral-900 transition-colors text-lg font-medium"
              >
                Para Instrutores
              </Link>
              <hr className="border-neutral-200" />

              {isReady && user ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900 transition-colors text-lg font-medium"
                    >
                      <Shield size={20} />
                      Painel Admin
                    </Link>
                  )}
                  {isInstrutor && (
                    <Link
                      href="/painel"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-neutral-700 hover:text-neutral-900 transition-colors text-lg font-medium"
                    >
                      <User size={20} />
                      Meu Painel
                    </Link>
                  )}
                  <div className="text-sm text-neutral-400">
                    Logado como <strong className="text-neutral-600">{user.nome.split(' ')[0]}</strong>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 border-2 border-red-200 text-red-500 px-6 py-3 rounded-xl font-bold text-center hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut size={18} />
                    Sair
                  </button>
                </>
              ) : isReady ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="border-2 border-neutral-900 text-neutral-900 px-6 py-3 rounded-xl font-bold text-center hover:bg-neutral-900 hover:text-white transition-all duration-200"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/seja-instrutor"
                    onClick={() => setMobileOpen(false)}
                    className="bg-[#FACC15] text-neutral-900 px-6 py-3 rounded-xl font-bold text-center shadow-lg shadow-yellow-400/20"
                  >
                    Seja Instrutor
                  </Link>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
