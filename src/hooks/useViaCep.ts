'use client'

import { useState } from 'react'

interface ViaCepResponse {
  cep: string
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export function useViaCep() {
  const [loading, setLoading] = useState(false)

  async function buscarCep(cep: string): Promise<ViaCepResponse | null> {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return null

    setLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await res.json()
      if (data.erro) return null
      return data as ViaCepResponse
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }

  return { buscarCep, loading }
}
