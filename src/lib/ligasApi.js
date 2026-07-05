// src/lib/ligasApi.js
import { apiFetch } from './api'

/**
 * Camada de funções que conversam com as rotas reais de /api/ligas no
 * backend (decisão de 03/07/2026, Fase 1 do Sistema de Ligas Privadas).
 */

/**
 * Cria uma liga privada nova. O criador já entra automaticamente e paga
 * a entrada (10 moedas) no ato.
 */
export async function criarLiga(nome, tipo) {
  return apiFetch('/api/ligas/criar', {
    method: 'POST',
    body: { nome, tipo },
  })
}

/**
 * Lista as ligas abertas ainda no lobby (pra quem quer entrar sem
 * conhecer ninguém, direto pela lista pública).
 */
export async function listarLigasAbertas() {
  return apiFetch('/api/ligas/abertas', { method: 'GET' })
}

/**
 * Lista as ligas que o técnico autenticado criou ou é membro.
 */
export async function listarMinhasLigas() {
  return apiFetch('/api/ligas/minhas', { method: 'GET' })
}

/**
 * Busca o detalhe completo de uma liga (membros, pote, status) — só
 * funciona se o técnico autenticado já for membro dela.
 */
export async function buscarDetalheLiga(ligaId) {
  return apiFetch(`/api/ligas/${ligaId}`, { method: 'GET' })
}

/**
 * Entra numa liga pelo número. senha só é necessária se a liga for
 * fechada — pra abertas, pode chamar sem o segundo argumento.
 */
export async function entrarNaLiga(numero, senha) {
  return apiFetch('/api/ligas/entrar', {
    method: 'POST',
    body: { numero, senha },
  })
}

/**
 * Sai de uma liga ainda no lobby (devolve a entrada). Não funciona pro
 * criador nem depois que a liga já começou.
 */
export async function sairDaLiga(ligaId) {
  return apiFetch(`/api/ligas/${ligaId}/sair`, { method: 'POST' })
}

/**
 * Dá play manual na liga — só o criador, só com 2+ participantes.
 */
export async function darPlayNaLiga(ligaId) {
  return apiFetch(`/api/ligas/${ligaId}/play`, { method: 'POST' })
}

/**
 * Alterna a liga entre aberta e fechada — só o criador, só no lobby.
 */
export async function alternarTipoLiga(ligaId) {
  return apiFetch(`/api/ligas/${ligaId}/alternar-tipo`, { method: 'PUT' })
}

/**
 * Verifica se uma partida específica foi a FINAL de alguma Liga
 * Privada — usado na tela de Resultado de Partida pra mostrar o banner
 * de campeão quando fizer sentido.
 */
export async function verificarSeFinalDeLiga(partidaId) {
  return apiFetch(`/api/ligas/partida/${partidaId}`, { method: 'GET' })
}