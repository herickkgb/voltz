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

  // Documentos são privados — gerar signed URL (válida por 1 ano)
  const { data: signedData, error: signedError } = await supabase.storage
    .from('documentos')
    .createSignedUrl(nomeArquivo, 60 * 60 * 24 * 365)

  if (signedError || !signedData) {
    console.error('Erro ao gerar URL:', signedError)
    return null
  }

  return {
    url: signedData.signedUrl,
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
 * Gera URL assinada para visualizar documento privado (admin).
 */
export async function getDocumentoUrl(path: string): Promise<string | null> {

  const { data, error } = await supabase.storage
    .from('documentos')
    .createSignedUrl(path, 60 * 60) // 1 hora

  if (error || !data) return null
  return data.signedUrl
}
