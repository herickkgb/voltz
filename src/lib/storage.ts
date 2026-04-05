import { supabase } from './supabase'

/**
 * Faz upload de documento para o Supabase Storage.
 * Retorna a URL pública ou signed URL do arquivo.
 */
export async function uploadDocumento(
  userId: string,
  arquivo: File,
  tipo: string
): Promise<{ url: string; nome_arquivo: string } | null> {

  const extensao = arquivo.name.split('.').pop() || 'pdf'
  const nomeArquivo = `${userId}/${tipo}_${Date.now()}.${extensao}`

  const { error: uploadError } = await supabase.storage
    .from('documentos')
    .upload(nomeArquivo, arquivo, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    console.error('Erro no upload:', uploadError)
    return null
  }

  // Armazenamos o path (não a signed URL) — URLs são geradas on-demand com validade curta
  return {
    url: nomeArquivo,
    nome_arquivo: arquivo.name,
  }
}

/**
 * Faz upload de foto de perfil para o bucket público.
 * Retorna a URL pública do arquivo.
 */
export async function uploadFoto(
  userId: string,
  arquivo: File
): Promise<string | null> {

  const extensao = arquivo.name.split('.').pop() || 'jpg'
  const nomeArquivo = `${userId}/perfil_${Date.now()}.${extensao}`

  const { error: uploadError } = await supabase.storage
    .from('fotos')
    .upload(nomeArquivo, arquivo, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Erro no upload da foto:', uploadError)
    return null
  }

  const { data } = supabase.storage
    .from('fotos')
    .getPublicUrl(nomeArquivo)

  return data.publicUrl
}

/**
 * Gera URL assinada para visualizar documento privado.
 * Aceita path de storage (ex: "userId/cnh_123.pdf") ou signed URL legada (começa com https://).
 * Validade: 2 horas.
 */
export async function getDocumentoUrl(pathOrUrl: string): Promise<string | null> {
  // Backward-compat: se já é uma signed URL completa, retorna diretamente
  if (pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }

  const { data, error } = await supabase.storage
    .from('documentos')
    .createSignedUrl(pathOrUrl, 60 * 60 * 2) // 2 horas

  if (error || !data) return null
  return data.signedUrl
}
