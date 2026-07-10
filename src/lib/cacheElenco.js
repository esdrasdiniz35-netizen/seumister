// src/lib/cacheElenco.js
// Cache leve em memória pros dados de /api/elenco (titulares + reservas,
// com foto e overall) — mesmo padrão de cacheTecnico.js. Intervalo.jsx e
// os modais de Lesão/Pênalti em Partida.jsx abrem várias vezes na mesma
// partida e cada abertura refazia a mesma chamada pro mesmo dado.
//
// TTL de 30s, igual ao do técnico: elenco muda menos que moedas/nível,
// mas substituição em partida e compra no Mercado invalidam na hora
// (invalidateElencoCache), então o TTL é só a rede de segurança.
import { apiFetch } from './api'

const TTL_MS = 30_000

let cache = null // { data, timestamp }
let inflight = null

/**
 * Busca o elenco do técnico logado, reaproveitando uma resposta recente
 * (dentro do TTL) ou uma requisição já em andamento.
 *
 * Uso: const dados = await getElencoAtual() // no lugar de apiFetch('/api/elenco')
 */
export function getElencoAtual({ force = false } = {}) {
  if (!force && cache && Date.now() - cache.timestamp < TTL_MS) {
    return Promise.resolve(cache.data)
  }
  if (!force && inflight) {
    return inflight
  }

  inflight = apiFetch('/api/elenco', { method: 'GET' })
    .then((data) => {
      cache = { data, timestamp: Date.now() }
      inflight = null
      return data
    })
    .catch((erro) => {
      inflight = null
      throw erro
    })

  return inflight
}

/** Descarta o cache — chamar depois de qualquer ação que mude o elenco (compra, venda, formação, substituição, promoção). */
export function invalidateElencoCache() {
  cache = null
}
