import RedefinirSenhaPage from '@/components/pages/RedefinirSenhaPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Redefinir Senha | Voltz',
  description: 'Redefina sua senha de acesso.',
}

export default function RedefinirSenha() {
  return <RedefinirSenhaPage />
}
