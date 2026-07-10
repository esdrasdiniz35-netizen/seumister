// src/lib/fotoJogador.js
// As fotos de jogador ficam no Supabase Storage em tamanho original
// (12-32KB cada) mas aparecem em círculos de 34-60px nas listas. O plano
// atual do Supabase tem transformação de imagem habilitada (verificado em
// 07/07/2026: /render/image responde 200 e devolve ~metade do peso), então
// dá pra pedir o tamanho certo direto na URL, sem reprocessar o bucket.

/**
 * Converte a URL pública de uma foto do Storage na URL transformada
 * (redimensionada server-side). URLs que não são do Storage (null,
 * ui-avatars, etc.) passam direto sem mexer.
 *
 * @param {string|null} url - foto_url como vem do backend
 * @param {number} size - lado do quadrado em px (padrão 96 = 2x de um círculo de 48px)
 */
export function fotoMiniatura(url, size = 96) {
  if (!url || typeof url !== 'string') return url
  if (!url.includes('/storage/v1/object/public/')) return url
  const transformada = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
  const separador = transformada.includes('?') ? '&' : '?'
  return `${transformada}${separador}width=${size}&height=${size}&resize=contain`
}
