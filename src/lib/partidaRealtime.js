// src/lib/partidaRealtime.js
import { supabase } from './supabaseClient'

/**
 * Assina as mudanças em tempo real de uma partida específica:
 * - mudanças na própria linha da partida (placar, fase, pausa, etc.)
 * - novos eventos inseridos para essa partida (gols, cartões, lesões...)
 *
 * onPartidaAtualizada(novaLinha) é chamado a cada UPDATE na tabela partidas
 * onNovoEvento(novoEvento) é chamado a cada INSERT na tabela eventos_partida
 *
 * Retorna uma função de "unsubscribe" — chame ela no cleanup do useEffect.
 */
export function assinarPartida(partidaId, { onPartidaAtualizada, onNovoEvento }) {
  const channel = supabase
    .channel(`partida-${partidaId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'partidas',
        filter: `id=eq.${partidaId}`,
      },
      (payload) => {
        if (onPartidaAtualizada) onPartidaAtualizada(payload.new)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'eventos_partida',
        filter: `partida_id=eq.${partidaId}`,
      },
      (payload) => {
        if (onNovoEvento) onNovoEvento(payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Busca o estado atual completo de uma partida diretamente do banco
 * (usado ao entrar na tela, antes do Realtime começar a atualizar,
 * e também como fallback caso o Realtime perca algum evento).
 */
export async function buscarPartidaAtual(partidaId) {
  const { data, error } = await supabase
    .from('partidas')
    .select('*')
    .eq('id', partidaId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Busca todos os eventos já registrados de uma partida, em ordem cronológica.
 * Usado ao entrar na tela (ex: dando refresh no meio de uma partida em andamento)
 * pra reconstruir o feed de eventos que já aconteceram.
 */
export async function buscarEventosDaPartida(partidaId) {
  const { data, error } = await supabase
    .from('eventos_partida')
    .select('*')
    .eq('partida_id', partidaId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

/**
 * Busca os dados básicos de um clube (nome, escudo, cores) pelo id.
 * Usado nas telas de PrePartida e Partida para mostrar o nome real
 * do adversário em vez de "Tigres FC" fixo.
 */
export async function buscarClube(clubeId) {
  const { data, error } = await supabase
    .from('clubes')
    .select('id, nome, escudo_url, cor_primaria, cor_secundaria, categoria_competicao')
    .eq('id', clubeId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Busca o clube_proprio_id do técnico atualmente autenticado.
 * Função auxiliar usada por descobrirPartidaAtivaDoTecnico.
 */
async function buscarClubeProprioDoTecnicoLogado() {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) throw new Error('Usuário não autenticado.')

  const { data, error } = await supabase
    .from('tecnicos')
    .select('clube_proprio_id')
    .eq('id', authData.user.id)
    .single()

  if (error) throw new Error(error.message)
  return data?.clube_proprio_id ?? null
}

/**
 * DESCOBRE se o técnico logado tem alguma partida ativa agora
 * (status 'em_andamento' ou 'intervalo'), consultando direto o banco —
 * sem depender de nada salvo localmente (sessionStorage, state de navegação).
 *
 * Esta é a peça central que permite recarregar a página, fechar e abrir
 * o app, ou trocar de aba/dispositivo no meio de uma partida sem perder
 * o progresso: a verdade sobre "qual partida estou jogando agora" vive
 * sempre no banco, nunca só no navegador.
 *
 * Retorna a linha completa da partida, ou null se não houver nenhuma ativa.
 */
export async function descobrirPartidaAtivaDoTecnico() {
  const clubeProprioId = await buscarClubeProprioDoTecnicoLogado()
  if (!clubeProprioId) return null

  const { data, error } = await supabase
    .from('partidas')
    .select('*')
    .in('status', ['em_andamento', 'intervalo'])
    .or(`clube_home_id.eq.${clubeProprioId},clube_away_id.eq.${clubeProprioId}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}