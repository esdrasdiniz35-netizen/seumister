// src/lib/cacheTecnico.js
// Cache leve em memória pros dados de /api/tecnicos/me (técnico + clube
// próprio), que quase toda tela busca no useEffect ao montar. Sem isso,
// trocar de tela repete a mesma ida-e-volta ao Railway a cada navegação.
//
// TTL curto: dado o suficiente pra não repetir a chamada quando o técnico
// troca de tela rapidamente, mas curto o bastante pra não mostrar moedas/
// nível desatualizados por muito tempo.
import { apiFetch } from './api'

const TTL_MS = 30_000

let cache = null // { data, timestamp }
let inflight = null

/**
 * Busca os dados do técnico logado, reaproveitando uma resposta recente
 * (dentro do TTL) ou uma requisição já em andamento, em vez de disparar
 * uma chamada nova a cada tela.
 *
 * Uso: const dados = await getTecnicoMe() // no lugar de apiFetch('/api/tecnicos/me')
 */
export function getTecnicoMe({ force = false } = {}) {
  if (!force && cache && Date.now() - cache.timestamp < TTL_MS) {
    return Promise.resolve(cache.data)
  }
  if (!force && inflight) {
    return inflight
  }

  inflight = apiFetch('/api/tecnicos/me', { method: 'GET' })
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

/** Descarta o cache — chamar depois de qualquer ação que mude moedas, nível ou dados do clube. */
export function invalidateTecnicoCache() {
  cache = null
}
