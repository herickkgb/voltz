'use client'

import { useState, useEffect, useCallback } from 'react'
import { Instrutor, FiltrosBusca } from '@/types'
import { buscarInstrutores } from '@/lib/db'

export function useInstrutores(filtrosIniciais?: FiltrosBusca) {
  const [instrutores, setInstrutores] = useState<Instrutor[]>([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<FiltrosBusca>(filtrosIniciais || {})

  const buscar = useCallback(async () => {
    setLoading(true)
    const resultado = await buscarInstrutores(filtros)
    setInstrutores(resultado)
    setLoading(false)
  }, [filtros])

  useEffect(() => {
    const handler = setTimeout(() => {
      buscar()
    }, 400) // 400ms debounce
    return () => clearTimeout(handler)
  }, [buscar])

  return { instrutores, loading, filtros, setFiltros, buscar }
}
