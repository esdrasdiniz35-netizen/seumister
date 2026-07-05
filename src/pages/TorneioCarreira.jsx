// src/pages/TorneioCarreira.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

// ─── ÍCONES SVG INLINE ───────────────────────────────────────────────────────

const IconVoltar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M15 6L9 12L15 18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconPlay = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <polygon points="5,3 19,12 5,21" fill="#fff"/>
  </svg>
)

const IconTrofeu = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M6 3h12v9a6 6 0 01-12 0V3z" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 7H3a3 3 0 003 3" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 7h3a3 3 0 01-3 3" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18v3M8 21h8" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconCopa = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M6 3h12v9a6 6 0 01-12 0V3z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 7H3a3 3 0 003 3" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 7h3a3 3 0 01-3 3" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18v3M8 21h8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const NOME_FASE = {
  grupos:  'Fase de Grupos',
  oitavas: 'Oitavas de Final',
  quartas: 'Quartas de Final',
  semi:    'Semifinal',
  final:   'Final',
  campeao: 'Campeão! 🏆',
  eliminado: 'Eliminado',
}

const NOME_RODADA = {
  grupo_1: 'Rodada 1',
  grupo_2: 'Rodada 2',
  grupo_3: 'Rodada 3',
}

function corPosicao(pos) {
  if (pos === 0) return '#10B981' // 1º - verde (classifica)
  if (pos === 1) return '#10B981' // 2º - verde (classifica)
  return '#EF4444'                // 3º/4º - vermelho (eliminado)
}

function saldoGols(stats) {
  return stats.gols_pro - stats.gols_contra
}

// Ordena a classificação (mesma lógica do backend: pontos > saldo > gols_pro)
function ordenarClassificacao(classificacao) {
  return Object.entries(classificacao).sort(([, a], [, b]) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos
    const sA = a.gols_pro - a.gols_contra
    const sB = b.gols_pro - b.gols_contra
    if (sB !== sA) return sB - sA
    return b.gols_pro - a.gols_pro
  })
}

// ─── COMPONENTES MENORES ──────────────────────────────────────────────────────

function TagModo({ modo }) {
  const avancado = modo === 'avancado'
  return (
    <span style={{
      fontSize: '11px', fontWeight: '700',
      color: '#fff',
      background: avancado ? '#F97316' : '#6B7280',
      padding: '3px 10px', borderRadius: '99px',
    }}>
      {avancado ? 'Avançado' : 'Normal'}
    </span>
  )
}

function TagFase({ status }) {
  const cor = status === 'campeao' ? '#10B981' : status === 'eliminado' ? '#EF4444' : '#F97316'
  const bg  = status === 'campeao' ? '#ECFDF5' : status === 'eliminado' ? '#FEF2F2' : '#FFF7ED'
  return (
    <span style={{
      fontSize: '11px', fontWeight: '700',
      color: cor, background: bg,
      padding: '3px 10px', borderRadius: '99px',
    }}>
      {NOME_FASE[status] || status}
    </span>
  )
}

// ─── SEÇÃO: TABELA DE CLASSIFICAÇÃO ──────────────────────────────────────────

function TabelaClassificacao({ classificacao, clubeDoTecnicoId }) {
  const ordenado = ordenarClassificacao(classificacao)

  return (
    <div style={{
      background: '#fff', borderRadius: '14px',
      border: '1.5px solid #E5E7EB', overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid #F5F5F5',
        fontSize: '13px', fontWeight: '700', color: '#1C1C1C',
      }}>
        Classificação do Grupo
      </div>

      {/* Cabeçalho da tabela */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '20px 1fr 28px 28px 28px 28px 28px 36px',
        gap: '0 6px',
        padding: '6px 14px',
        background: '#F9FAFB',
        borderBottom: '1px solid #F0F0F0',
      }}>
        {['#', 'Time', 'P', 'J', 'V', 'E', 'D', 'SG'].map((h) => (
          <div key={h} style={{
            fontSize: '10px', fontWeight: '700', color: '#9CA3AF',
            textAlign: h === 'Time' ? 'left' : 'center',
          }}>
            {h}
          </div>
        ))}
      </div>

      {/* Linhas */}
      {ordenado.map(([clubeId, stats], idx) => {
        const ehTecnico = clubeId === clubeDoTecnicoId
        const cor = corPosicao(idx)
        return (
          <div
            key={clubeId}
            style={{
              display: 'grid',
              gridTemplateColumns: '20px 1fr 28px 28px 28px 28px 28px 36px',
              gap: '0 6px',
              padding: '9px 14px',
              borderBottom: idx < ordenado.length - 1 ? '1px solid #F5F5F5' : 'none',
              background: ehTecnico ? '#FFF7ED' : 'transparent',
              alignItems: 'center',
            }}
          >
            {/* Posição */}
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: idx < 2 ? '#ECFDF5' : '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: '700', color: cor,
            }}>
              {idx + 1}
            </div>

            {/* Nome */}
            <div style={{
              fontSize: '12px',
              fontWeight: ehTecnico ? '700' : '500',
              color: ehTecnico ? '#F97316' : '#1C1C1C',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {ehTecnico ? '★ ' : ''}{stats.nome}
            </div>

            {/* Pontos */}
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1C', textAlign: 'center' }}>
              {stats.pontos}
            </div>

            {/* Jogos */}
            <div style={{ fontSize: '11px', color: '#6B7280', textAlign: 'center' }}>
              {stats.vitorias + stats.empates + stats.derrotas}
            </div>

            {/* V */}
            <div style={{ fontSize: '11px', color: '#10B981', textAlign: 'center' }}>{stats.vitorias}</div>

            {/* E */}
            <div style={{ fontSize: '11px', color: '#F59E0B', textAlign: 'center' }}>{stats.empates}</div>

            {/* D */}
            <div style={{ fontSize: '11px', color: '#EF4444', textAlign: 'center' }}>{stats.derrotas}</div>

            {/* Saldo */}
            <div style={{
              fontSize: '11px', fontWeight: '600', textAlign: 'center',
              color: saldoGols(stats) >= 0 ? '#10B981' : '#EF4444',
            }}>
              {saldoGols(stats) >= 0 ? '+' : ''}{saldoGols(stats)}
            </div>
          </div>
        )
      })}

      {/* Legenda */}
      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid #F5F5F5',
        display: 'flex', gap: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontSize: '10px', color: '#6B7280' }}>Classifica</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
          <span style={{ fontSize: '10px', color: '#6B7280' }}>Eliminado</span>
        </div>
      </div>
    </div>
  )
}

// ─── SEÇÃO: CALENDÁRIO DO GRUPO ───────────────────────────────────────────────

function CalendarioGrupo({ partidas, clubeDoTecnicoId, classificacao }) {
  // Monta mapa id → nome usando a classificação (já tem todos os nomes do grupo)
  const nomePorId = {}
  if (classificacao) {
    Object.entries(classificacao).forEach(([id, stats]) => {
      nomePorId[id] = stats.nome
    })
  }

  // Agrupa por fase (grupo_1, grupo_2, grupo_3)
  const porFase = {}
  ;(partidas || []).forEach((p) => {
    if (!porFase[p.fase]) porFase[p.fase] = []
    porFase[p.fase].push(p)
  })

  const fases = Object.keys(porFase).sort()

  if (fases.length === 0) return null

  return (
    <div style={{
      background: '#fff', borderRadius: '14px',
      border: '1.5px solid #E5E7EB', overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid #F5F5F5',
        fontSize: '13px', fontWeight: '700', color: '#1C1C1C',
      }}>
        Seus Jogos
      </div>

      {fases.map((fase, faseIdx) => (
        <div key={fase}>
          {/* Label da rodada */}
          <div style={{
            padding: '7px 14px',
            background: '#F9FAFB',
            borderTop: faseIdx > 0 ? '1px solid #F0F0F0' : 'none',
            fontSize: '11px', fontWeight: '700', color: '#6B7280',
          }}>
            {NOME_RODADA[fase] || fase}
          </div>

          {porFase[fase].map((partida) => {
            const nomeHome = nomePorId[partida.clube_home_id] || '?'
            const nomeAway = nomePorId[partida.clube_away_id] || '?'
            const ehHome   = partida.clube_home_id === clubeDoTecnicoId
            const jogada   = partida.jogada
            const placar   = jogada
              ? `${partida.placar_home ?? 0} × ${partida.placar_away ?? 0}`
              : 'vs'

            let resultado = null
            if (jogada && partida.placar_home !== null) {
              const golsTecnico  = ehHome ? partida.placar_home : partida.placar_away
              const golsAdv      = ehHome ? partida.placar_away : partida.placar_home
              if (golsTecnico > golsAdv)   resultado = 'V'
              else if (golsTecnico < golsAdv) resultado = 'D'
              else                          resultado = 'E'
            }

            const corResultado = resultado === 'V' ? '#10B981' : resultado === 'D' ? '#EF4444' : '#F59E0B'
            const bgResultado  = resultado === 'V' ? '#ECFDF5' : resultado === 'D' ? '#FEF2F2' : '#FFFBEB'

            return (
              <div
                key={partida.id}
                style={{
                  padding: '10px 14px',
                  borderTop: '1px solid #F5F5F5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {/* Resultado badge */}
                {resultado ? (
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px',
                    background: bgResultado,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '700', color: corResultado,
                    flexShrink: 0,
                  }}>
                    {resultado}
                  </div>
                ) : (
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px',
                    background: '#F5F5F5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '10px', color: '#9CA3AF' }}>–</span>
                  </div>
                )}

                {/* Confronto */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: ehHome ? '700' : '400',
                    color: ehHome ? '#F97316' : '#1C1C1C',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    flex: 1, textAlign: 'right',
                  }}>
                    {nomeHome}
                  </span>
                  <span style={{
                    fontSize: '12px', fontWeight: '700',
                    color: jogada ? '#1C1C1C' : '#9CA3AF',
                    flexShrink: 0, minWidth: '40px', textAlign: 'center',
                  }}>
                    {placar}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: !ehHome ? '700' : '400',
                    color: !ehHome ? '#F97316' : '#1C1C1C',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    flex: 1, textAlign: 'left',
                  }}>
                    {nomeAway}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── SEÇÃO: CHAVE DE MATA-MATA ────────────────────────────────────────────────

function ChaveMataMata({ chave, modo }) {
  if (!chave) return null

  const { adversario_nome, jogo_ida, jogo_volta, penaltis, fase_atual } = chave

  const agregadoTecnico    = (jogo_ida.placar_tecnico ?? 0) + (jogo_volta.placar_tecnico ?? 0)
  const agregadoAdversario = (jogo_ida.placar_adversario ?? 0) + (jogo_volta.placar_adversario ?? 0)
  const ambosJogados       = jogo_ida.jogada && jogo_volta.jogada

  return (
    <div style={{
      background: '#fff', borderRadius: '14px',
      border: '1.5px solid #E5E7EB', overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid #F5F5F5',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C' }}>
          {NOME_FASE[fase_atual] || fase_atual}
        </span>
        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Ida e volta</span>
      </div>

      {/* Adversário */}
      <div style={{
        padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: '10px',
        borderBottom: '1px solid #F5F5F5',
        background: '#FFF7ED',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: '#F97316',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', flexShrink: 0,
        }}>
          ⚔️
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Adversário</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C' }}>{adversario_nome}</div>
        </div>
      </div>

      {/* Jogo de Ida */}
      <JogoMataMata jogo={jogo_ida} label="Jogo de Ida" />

      {/* Jogo de Volta */}
      <JogoMataMata jogo={jogo_volta} label="Jogo de Volta" />

      {/* Agregado (se ao menos 1 jogo foi jogado) */}
      {(jogo_ida.jogada || jogo_volta.jogada) && (
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid #F0F0F0',
          background: '#F9FAFB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280' }}>
            Agregado
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '16px', fontWeight: '900',
              color: ambosJogados
                ? (agregadoTecnico > agregadoAdversario ? '#10B981' : agregadoTecnico < agregadoAdversario ? '#EF4444' : '#F59E0B')
                : '#1C1C1C',
            }}>
              {agregadoTecnico}
            </span>
            <span style={{ fontSize: '13px', color: '#9CA3AF' }}>×</span>
            <span style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C' }}>
              {agregadoAdversario}
            </span>
          </div>
        </div>
      )}

      {/* Pênaltis (se foi decidido assim) */}
      {penaltis && (
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid #F0F0F0',
          background: penaltis.vencedor === 'tecnico' ? '#ECFDF5' : '#FEF2F2',
        }}>
          <span style={{
            fontSize: '12px', fontWeight: '700',
            color: penaltis.vencedor === 'tecnico' ? '#10B981' : '#EF4444',
          }}>
            {penaltis.vencedor === 'tecnico'
              ? '🎯 Decidido nos pênaltis — você avançou!'
              : '😔 Decidido nos pênaltis — você foi eliminado'}
          </span>
        </div>
      )}
    </div>
  )
}

function JogoMataMata({ jogo, label }) {
  const { tecnico_em_casa, placar_tecnico, placar_adversario, jogada } = jogo
  const nomeHome = tecnico_em_casa ? 'Você' : 'Adversário'
  const nomeAway = tecnico_em_casa ? 'Adversário' : 'Você'

  return (
    <div style={{
      padding: '10px 14px',
      borderTop: '1px solid #F5F5F5',
      display: 'flex', alignItems: 'center', gap: '8px',
    }}>
      <div style={{
        fontSize: '10px', fontWeight: '700', color: '#9CA3AF',
        minWidth: '52px', flexShrink: 0,
      }}>
        {label}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          fontSize: '12px',
          fontWeight: tecnico_em_casa ? '700' : '400',
          color: tecnico_em_casa ? '#F97316' : '#1C1C1C',
          flex: 1, textAlign: 'right',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {nomeHome}
        </span>
        <span style={{
          fontSize: '13px', fontWeight: '700',
          color: jogada ? '#1C1C1C' : '#9CA3AF',
          minWidth: '44px', textAlign: 'center', flexShrink: 0,
        }}>
          {jogada
            ? `${tecnico_em_casa ? placar_tecnico : placar_adversario} × ${tecnico_em_casa ? placar_adversario : placar_tecnico}`
            : 'vs'}
        </span>
        <span style={{
          fontSize: '12px',
          fontWeight: !tecnico_em_casa ? '700' : '400',
          color: !tecnico_em_casa ? '#F97316' : '#1C1C1C',
          flex: 1, textAlign: 'left',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {nomeAway}
        </span>
      </div>
      {/* Status do jogo */}
      <div style={{
        fontSize: '10px', fontWeight: '600',
        color: jogada ? '#10B981' : '#9CA3AF',
        flexShrink: 0,
      }}>
        {jogada ? '✓' : tecnico_em_casa ? '🏠 Casa' : '✈️ Fora'}
      </div>
    </div>
  )
}

// ─── TELA DE CAMPEÃO ─────────────────────────────────────────────────────────

function TelaCampeao({ modo, onEntrarDeNovo }) {
  const premio = modo === 'avancado' ? 200 : 100
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', gap: '16px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '64px', lineHeight: 1 }}>🏆</div>
      <div style={{ fontSize: '24px', fontWeight: '900', color: '#1C1C1C' }}>
        Campeão!
      </div>
      <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
        Você venceu o Modo Carreira {modo === 'avancado' ? 'Avançado' : 'Normal'}.<br/>
        <strong style={{ color: '#F97316' }}>+{premio} moedas</strong> já foram creditadas na sua conta.
      </div>
      <button
        onClick={onEntrarDeNovo}
        style={{
          background: '#F97316', color: '#fff', border: 'none',
          borderRadius: '12px', padding: '14px 28px',
          fontSize: '14px', fontWeight: '700', cursor: 'pointer',
          marginTop: '8px',
        }}
      >
        Entrar em outro torneio
      </button>
    </div>
  )
}

// ─── TELA DE ELIMINADO ────────────────────────────────────────────────────────

function TelaEliminado({ modo, onEntrarDeNovo }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', gap: '16px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '64px', lineHeight: 1 }}>😤</div>
      <div style={{ fontSize: '22px', fontWeight: '900', color: '#1C1C1C' }}>
        Eliminado
      </div>
      <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
        Você foi eliminado do Modo Carreira {modo === 'avancado' ? 'Avançado' : 'Normal'}.<br/>
        As moedas que você ganhou nas partidas continuam na sua conta.
      </div>
      <button
        onClick={onEntrarDeNovo}
        style={{
          background: '#1C1C1C', color: '#fff', border: 'none',
          borderRadius: '12px', padding: '14px 28px',
          fontSize: '14px', fontWeight: '700', cursor: 'pointer',
          marginTop: '8px',
        }}
      >
        Tentar de novo
      </button>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function TorneioCarreira() {
  const navigate = useNavigate()

  const [carregando, setCarregando]     = useState(true)
  const [iniciando, setIniciando]       = useState(false)  // aguardando criar partida
  const [erro, setErro]                 = useState(null)
  const [competicao, setCompeticao]     = useState(null)
  const [partidas, setPartidas]         = useState([])
  const [clubeDoTecnicoId, setClubeDoTecnicoId] = useState(null)
  const [confirmandoDesistencia, setConfirmandoDesistencia] = useState(false)
  const [desistindo, setDesistindo]     = useState(false)

  // ─── BUSCAR DADOS DO TORNEIO ────────────────────────────────────────────
  const carregarTorneio = useCallback(async () => {
    setErro(null)
    try {
      // Busca dados do torneio
      const dados = await apiFetch('/api/competicao/atual')
      setCompeticao(dados.competicao || null)
      setPartidas(dados.partidas_do_tecnico || [])

      // Busca o clube do técnico (para saber quem é "eu" na tabela e no calendário)
      // Atenção: a rota devolve { tecnico: { clube_proprio_id, ... } } — aninhado,
      // não solto na raiz.
      const respostaTecnico = await apiFetch('/api/tecnicos/me')
      setClubeDoTecnicoId(respostaTecnico?.tecnico?.clube_proprio_id || null)
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar o torneio.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregarTorneio() }, [carregarTorneio])

  // ─── JOGAR PRÓXIMA RODADA (fase de grupos) ──────────────────────────────
  const handleJogarRodada = async () => {
    setErro(null)
    setIniciando(true)
    try {
      const resultado = await apiFetch('/api/competicao/jogar-rodada', { method: 'POST' })
      navigate('/pre-partida', { state: { partidaId: resultado.partida_id } })
    } catch (e) {
      setErro(e.message || 'Não foi possível iniciar a partida.')
      setIniciando(false)
    }
  }

  // ─── JOGAR JOGO DE MATA-MATA (ida ou volta) ──────────────────────────────
  const handleJogarMataMata = async () => {
    setErro(null)
    setIniciando(true)
    try {
      const resultado = await apiFetch('/api/competicao/jogar-mata-mata', { method: 'POST' })
      navigate('/pre-partida', { state: { partidaId: resultado.partida_id } })
    } catch (e) {
      setErro(e.message || 'Não foi possível iniciar a partida.')
      setIniciando(false)
    }
  }

  // ─── ENTRAR EM NOVO TORNEIO ───────────────────────────────────────────────
  const handleEntrarDeNovo = () => {
    navigate('/modo-carreira')
  }

  // ─── DESISTIR DO TORNEIO ──────────────────────────────────────────────────
  const handleDesistir = async () => {
    if (!confirmandoDesistencia) {
      setConfirmandoDesistencia(true)
      return
    }

    setErro(null)
    setDesistindo(true)
    try {
      await apiFetch('/api/competicao/desistir', { method: 'POST' })
      navigate('/modo-carreira')
    } catch (e) {
      setErro(e.message || 'Não foi possível desistir do torneio.')
      setDesistindo(false)
      setConfirmandoDesistencia(false)
    }
  }

  // ─── LÓGICA DE QUAL BOTÃO MOSTRAR ────────────────────────────────────────
  const statusFaseGrupos = competicao?.status === 'grupos'
  const statusMataMata   = ['oitavas', 'quartas', 'semi', 'final'].includes(competicao?.status)
  const statusCampeao    = competicao?.status === 'campeao'
  const statusEliminado  = competicao?.status === 'eliminado'

  // Tem jogo pendente de mata-mata?
  const chave = competicao?.chave_mata_mata
  const temJogoMataMataDisponivel = statusMataMata && chave && (
    (!chave.jogo_ida.jogada && !chave.jogo_ida.partida_real_id) ||
    (chave.jogo_ida.jogada && !chave.jogo_volta.jogada && !chave.jogo_volta.partida_real_id)
  )

  // Tem rodada disponível na fase de grupos?
  const temRodadaDisponivel = statusFaseGrupos &&
    partidas.some((p) => !p.jogada && !p.partida_real_id)

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#F5F5F5',
      height: '100vh',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 16px',
        background: '#1C1C1C',
        display: 'flex', alignItems: 'center', gap: '12px',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/modo-carreira')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '4px', lineHeight: 1, display: 'flex', alignItems: 'center',
          }}
        >
          <IconVoltar />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
            Modo Carreira
          </div>
          {competicao && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
              <TagModo modo={competicao.modo} />
              <TagFase status={competicao.status} />
            </div>
          )}
        </div>
      </div>

      {/* ── CONTEÚDO ───────────────────────────────────────────────────────── */}

      {/* Carregando */}
      {carregando && (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>Carregando torneio...</span>
        </div>
      )}

      {/* Sem torneio ativo */}
      {!carregando && !competicao && !statusCampeao && !statusEliminado && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px', textAlign: 'center', gap: '12px',
        }}>
          <div style={{ fontSize: '48px' }}>📋</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1C1C1C' }}>
            Nenhum torneio ativo
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>
            Você ainda não entrou em nenhum torneio do Modo Carreira.
          </div>
          <button
            onClick={() => navigate('/modo-carreira')}
            style={{
              background: '#F97316', color: '#fff', border: 'none',
              borderRadius: '12px', padding: '12px 24px',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Escolher torneio
          </button>
        </div>
      )}

      {/* Tela de campeão */}
      {!carregando && statusCampeao && (
        <TelaCampeao modo={competicao?.modo} onEntrarDeNovo={handleEntrarDeNovo} />
      )}

      {/* Tela de eliminado */}
      {!carregando && statusEliminado && (
        <TelaEliminado modo={competicao?.modo} onEntrarDeNovo={handleEntrarDeNovo} />
      )}

      {/* Torneio em andamento */}
      {!carregando && competicao && !statusCampeao && !statusEliminado && (
        <>
          {/* ERRO */}
          {erro && (
            <div style={{
              margin: '12px 16px 0',
              background: '#FEF2F2', border: '1.5px solid #FECACA',
              borderRadius: '10px', padding: '10px 12px', flexShrink: 0,
            }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
            </div>
          )}

          {/* BOTÃO JOGAR — fixo no topo do scroll para ficar sempre visível */}
          {(temRodadaDisponivel || temJogoMataMataDisponivel) && (
            <div style={{
              padding: '12px 16px',
              background: '#fff',
              borderBottom: '1px solid #E5E7EB',
              flexShrink: 0,
            }}>
              <button
                onClick={statusFaseGrupos ? handleJogarRodada : handleJogarMataMata}
                disabled={iniciando}
                style={{
                  width: '100%',
                  background: iniciando ? '#D1D5DB' : '#F97316',
                  color: '#fff', border: 'none',
                  borderRadius: '12px', padding: '14px',
                  fontSize: '15px', fontWeight: '700',
                  cursor: iniciando ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {!iniciando && <IconPlay />}
                {iniciando
                  ? 'Preparando partida...'
                  : statusFaseGrupos
                    ? 'Jogar próxima rodada'
                    : chave?.jogo_ida?.jogada
                      ? 'Jogar jogo de volta'
                      : 'Jogar jogo de ida'}
              </button>
            </div>
          )}

          {/* SCROLL AREA */}
          <div style={{
            flex: 1, minHeight: 0, overflowY: 'auto',
            padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: '14px',
          }}>

            {/* Fase de grupos: tabela + calendário */}
            {statusFaseGrupos && competicao.classificacao && (
              <>
                <TabelaClassificacao
                  classificacao={competicao.classificacao}
                  clubeDoTecnicoId={clubeDoTecnicoId}
                />
                <CalendarioGrupo
                  partidas={partidas}
                  clubeDoTecnicoId={clubeDoTecnicoId}
                  classificacao={competicao.classificacao}
                />
              </>
            )}

            {/* Mata-mata: chave do confronto atual */}
            {statusMataMata && chave && (
              <ChaveMataMata chave={chave} modo={competicao.modo} />
            )}

            {/* Aviso de partida em andamento (partida_real_id existe mas ainda não terminou) */}
            {statusFaseGrupos &&
              partidas.some((p) => !p.jogada && p.partida_real_id) && (
              <div style={{
                background: '#FFF7ED', border: '1.5px solid #FDBA74',
                borderRadius: '12px', padding: '12px 14px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>
                  ⏱ Partida em andamento
                </div>
                <div style={{ fontSize: '12px', color: '#92400E' }}>
                  Você tem uma partida deste torneio ainda em andamento. Termine-a para registrar o resultado.
                </div>
              </div>
            )}

            {/* ── DESISTIR DO TORNEIO ──────────────────────────────────────────
                Link discreto no rodapé (decisão fechada 30/06/2026): sempre
                visível enquanto o torneio está ativo, qualquer fase. A
                entrada paga não é reembolsada — texto de confirmação deixa
                isso explícito antes de executar. */}
            <div style={{
              marginTop: '8px',
              paddingTop: '16px',
              borderTop: '1px solid #E5E7EB',
              textAlign: 'center',
            }}>
              {!confirmandoDesistencia ? (
                <button
                  onClick={handleDesistir}
                  style={{
                    background: 'transparent', border: 'none',
                    color: '#9CA3AF', fontSize: '12px', fontWeight: '600',
                    cursor: 'pointer', textDecoration: 'underline',
                    padding: '4px',
                  }}
                >
                  Desistir do torneio
                </button>
              ) : (
                <div style={{
                  background: '#FEF2F2', border: '1.5px solid #FECACA',
                  borderRadius: '12px', padding: '14px',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                }}>
                  <div style={{ fontSize: '12px', color: '#991B1B', lineHeight: '1.5' }}>
                    <strong>Tem certeza?</strong> Você vai sair do torneio agora e perder todo o progresso. A moeda que você pagou para entrar não será devolvida.
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setConfirmandoDesistencia(false)}
                      disabled={desistindo}
                      style={{
                        background: '#fff', color: '#6B7280',
                        border: '1px solid #E5E7EB', borderRadius: '10px',
                        padding: '9px 16px', fontSize: '12px', fontWeight: '600',
                        cursor: desistindo ? 'default' : 'pointer',
                      }}
                    >
                      Continuar jogando
                    </button>
                    <button
                      onClick={handleDesistir}
                      disabled={desistindo}
                      style={{
                        background: desistindo ? '#D1D5DB' : '#EF4444',
                        color: '#fff', border: 'none', borderRadius: '10px',
                        padding: '9px 16px', fontSize: '12px', fontWeight: '700',
                        cursor: desistindo ? 'default' : 'pointer',
                      }}
                    >
                      {desistindo ? 'Saindo...' : 'Sim, desistir'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  )
}
