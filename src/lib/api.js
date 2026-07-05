// src/lib/api.js
import { supabase } from './supabaseClient'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Chama uma rota do nosso backend (Express), enviando automaticamente
 * o token de autenticação do usuário logado no Supabase.
 *
 * Uso:
 *   const dados = await apiFetch('/api/tecnicos/me')
 *   const dados = await apiFetch('/api/tecnicos', { method: 'POST', body: { nome: 'João' } })
 *
 * Em caso de erro (resposta não-ok), lança um Error cuja mensagem é a
 * mensagem amigável do backend, mas que também carrega o corpo JSON
 * completo da resposta em err.corpo — útil quando o backend manda dados
 * extras junto do erro (ex: { erro, sugestoes } em 409 de nome duplicado).
 */
export async function apiFetch(path, options = {}) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const responseData = await response.json().catch(() => null)

  if (!response.ok) {
    const mensagem = responseData?.erro || responseData?.message || 'Erro ao comunicar com o servidor'
    const erro = new Error(mensagem)
    erro.status = response.status
    erro.corpo = responseData
    throw erro
  }

  return responseData
}