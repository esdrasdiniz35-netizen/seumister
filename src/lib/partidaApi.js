// src/lib/partidaApi.js
import { apiFetch } from './api'

/**
 * Camada de funções que conversam com as rotas reais de /api/partida
 * no backend. Todas usam apiFetch, que já injeta o token de autenticação
 * automaticamente.
 */

// ─── MODO CARREIRA ──────────────────────────────────────────────────────────

/**
 * Inicia uma partida contra a máquina (Modo Carreira).
 * categoriaCompeticao é opcional — o backend usa 'serie_b' como padrão.
 */
export async function iniciarPartidaCarreira(categoriaCompeticao) {
  return apiFetch('/api/partida/iniciar', {
    method: 'POST',
    body: categoriaCompeticao ? { categoriaCompeticao } : {},
  })
}

// ─── MODO ONLINE (MATCHMAKING) ──────────────────────────────────────────────

/**
 * Entra na fila de busca por uma partida Online.
 * Cobra 1 moeda de entrada. Se já houver alguém esperando no mesmo
 * nivel_titulo, pareia na hora e a partida já vem criada na resposta.
 */
export async function buscarPartidaOnline() {
  return apiFetch('/api/partida/buscar-online', { method: 'POST' })
}

/**
 * Consulta o status atual da busca do técnico autenticado.
 * Retorna a entrada mais recente na fila: status 'esperando' ou 'pareado'
 * (com partida_id quando já pareado). Genérica — serve tanto pra busca
 * Online quanto pra Busca Apostada.
 */
export async function consultarStatusBusca() {
  return apiFetch('/api/partida/status-busca', { method: 'GET' })
}

/**
 * Cancela a busca por partida Online em andamento.
 * O backend devolve a moeda de entrada automaticamente.
 */
export async function cancelarBuscaOnline() {
  return apiFetch('/api/partida/cancelar-busca', { method: 'POST' })
}

// ─── BUSCA APOSTADA (decisão de 03/07/2026) ─────────────────────────────────

/**
 * Entra na fila de busca da Busca Apostada com um valor de aposta
 * escolhido (deve ser um dos valores liberados pra o nível de título do
 * técnico — o backend valida). O valor é debitado (reservado) na hora de
 * entrar na fila. Se já houver alguém esperando no mesmo nivel_titulo e na
 * mesma faixa de aposta, pareia na hora e a partida já vem criada na
 * resposta. Cancelamento e polling de status reaproveitam
 * cancelarBuscaOnline/consultarStatusBusca acima — são genéricos pros dois
 * tipos de fila.
 */
export async function buscarPartidaApostada(valorAposta) {
  return apiFetch('/api/partida/buscar-apostada', {
    method: 'POST',
    body: { valorAposta },
  })
}

// ─── DURANTE A PARTIDA (qualquer modo) ──────────────────────────────────────

/**
 * Avança do intervalo para o segundo tempo.
 * Usado apenas no Modo Carreira — no Online o intervalo avança sozinho
 * automaticamente após 10s, sem chamada manual.
 */
export async function retomarPartida(partidaId) {
  return apiFetch(`/api/partida/${partidaId}/retomar`, { method: 'POST' })
}

/**
 * Escolhe manualmente o jogador reserva que vai substituir o lesionado.
 * Só funciona enquanto a partida estiver pausada com motivo_pausa === 'lesao'.
 */
export async function escolherSubstituto(partidaId, elencoReservaId) {
  return apiFetch(`/api/partida/${partidaId}/escolher-substituto`, {
    method: 'POST',
    body: { elencoReservaId },
  })
}

/**
 * Escolhe manualmente o jogador que vai cobrar o pênalti.
 * Só funciona enquanto a partida estiver pausada com motivo_pausa === 'penalti'.
 */
export async function escolherBatedorPenalti(partidaId, elencoJogadorId) {
  return apiFetch(`/api/partida/${partidaId}/escolher-batedor-penalti`, {
    method: 'POST',
    body: { elencoJogadorId },
  })
}

/**
 * Avisa o backend que o técnico está interagindo com a tela de decisão
 * (lesão ou pênalti), estendendo o timeout de 10s para 15s.
 */
export async function heartbeatDecisao(partidaId) {
  return apiFetch(`/api/partida/${partidaId}/heartbeat-decisao`, { method: 'POST' })
}

// ─── PAUSA MANUAL DE SUBSTITUIÇÃO (decisão de 25/06/2026) ───────────────────

/**
 * Aciona a Pausa Manual de Substituição: para o relógio para os dois
 * lados (como um intervalo extra), permitindo ajustar o time. Limite: 1
 * vez por tempo (máx 2 por partida). Lança erro se já tiver sido usada
 * neste tempo, ou se a partida já estiver pausada por outro motivo.
 */
export async function pausarManual(partidaId) {
  return apiFetch(`/api/partida/${partidaId}/pausar-manual`, { method: 'POST' })
}

/**
 * Confirma que terminou de ajustar o time durante a Pausa Manual. No
 * Modo Carreira retoma na hora (a máquina não precisa confirmar); no
 * Online, retoma só quando os dois lados confirmarem (ou o timeout de
 * 10-15s estourar, liberado automaticamente pelo backend).
 */
export async function confirmarRetomadaManual(partidaId) {
  return apiFetch(`/api/partida/${partidaId}/confirmar-retomada-manual`, { method: 'POST' })
}

/**
 * Salva o time inteiro em campo de uma vez (intervalo natural ou pausa
 * manual): cada item deve ter { id, x, y }. O backend descobre sozinho
 * quais entradas são reposicionamento (livre) e quais são trocas banco
 * <-> campo (consomem saldo de substituições), aceitando parcialmente se
 * o saldo não cobrir tudo que foi enviado.
 */
export async function ajustarTimeEmCampo(partidaId, titulares) {
  return apiFetch(`/api/partida/${partidaId}/ajustar-time-em-campo`, {
    method: 'PUT',
    body: { titulares },
  })
}