// src/pages/PrePartida.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { buscarPartidaAtual, buscarClube } from '../lib/partidaRealtime'

const CONTAGEM_INICIAL = 5

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 64, contorno = '#1C1C1C' }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor1}/>
    <path d="M32 2V70C48 66 60 54 60 38V14L32 2Z" fill={cor2}/>
    <line x1="32" y1="2" x2="32" y2="70" stroke={contorno} strokeWidth="2"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke={contorno} strokeWidth="3" fill="none"/>
  </svg>
)

// Usado quando o clube adversário não tem escudo_url próprio (ex: alguns
// clubes oficiais ainda sem crest importado) — mesmo fallback visual que
// já existia no mock, agora só como rede de segurança, não como regra.
const EscudoGenerico = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill="#3B82F6"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke="white" strokeWidth="3" fill="none"/>
    <circle cx="32" cy="37" r="14" fill="white"/>
    <circle cx="32" cy="37" r="5" fill="#1C1C1C"/>
    <path d="M32 23L32 31M32 43L32 51M18 37L26 37M38 37L46 37" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// ★ NOVO 30/06/2026 — extraídos do JSX inline para permitir reordenação
// (home à esquerda, away à direita) sem duplicar a marcação.
const BlocoMeuTime = ({ meuTime, mandante }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flex: 1 }}>
    <span style={{ fontSize: '10px', fontWeight: '700', color: mandante ? '#F97316' : '#6B7280', letterSpacing: '1px' }}>
      {mandante ? 'JOGANDO EM CASA' : 'VISITANTE'}
    </span>
    <EscudoTime cor1={meuTime.cor1} cor2={meuTime.cor2} size={76} contorno="#1C1C1C" />
    <span style={{ fontSize: '14px', fontWeight: '900', color: '#1C1C1C', textAlign: 'center' }}>
      {meuTime.nome.toUpperCase()}
    </span>
    <span style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280' }}>
      {meuTime.tecnico}
    </span>
    <span style={{ fontSize: '10px', fontWeight: '700', color: '#10B981' }}>
      {meuTime.nivel}
    </span>
  </div>
)

const BlocoAdversario = ({ adversario, mandante }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flex: 1 }}>
    <span style={{ fontSize: '10px', fontWeight: '700', color: mandante ? '#F97316' : '#6B7280', letterSpacing: '1px' }}>
      {mandante ? 'JOGANDO EM CASA' : 'VISITANTE'}
    </span>
    {adversario.escudoUrl ? (
      <img
        src={adversario.escudoUrl}
        alt={adversario.nome}
        style={{ width: '76px', height: '76px', objectFit: 'contain' }}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    ) : (
      <EscudoGenerico size={76} />
    )}
    <span style={{ fontSize: '14px', fontWeight: '900', color: '#1C1C1C', textAlign: 'center' }}>
      {adversario.nome.toUpperCase()}
    </span>
    {adversario.categoria && (
      <span style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280' }}>
        {adversario.categoria}
      </span>
    )}
  </div>
)

export default function PrePartida() {
  const navigate = useNavigate()
  const location = useLocation()
  const partidaId = location.state?.partidaId

  const [contagem, setContagem] = useState(CONTAGEM_INICIAL)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [meuTime, setMeuTime] = useState(null)
  const [adversario, setAdversario] = useState(null)
  // ★ NOVO 30/06/2026 — guarda se o técnico é mandante ('home') ou
  // visitante ('away') nesta partida, para o JSX decidir a ORDEM visual
  // dos escudos: mandante sempre à esquerda, visitante sempre à direita
  // (convenção padrão de futebol, pedido explícito do Esdras — antes o
  // técnico sempre aparecia à esquerda, mesmo jogando como visitante).
  const [meuLado, setMeuLado] = useState(null)
  // Força de ataque agregada de cada lado (a mesma que o motor usa para
  // decidir gols — ver motorPartida.calcularForcaAtaqueTime). Só existe a
  // partir do primeiro tick do relógio; null enquanto não chegou ainda.
  const [forcaMinha, setForcaMinha] = useState(null)
  const [forcaAdversario, setForcaAdversario] = useState(null)

  // --- Busca os dados reais da partida, do meu clube e do adversário ---
  useEffect(() => {
    if (!partidaId) {
      navigate('/jogar')
      return
    }

    let cancelado = false

    async function carregar() {
      try {
        const [tecnicoData, partida] = await Promise.all([
          apiFetch('/api/tecnicos/me', { method: 'GET' }),
          buscarPartidaAtual(partidaId),
        ])

        if (cancelado) return

        const meuClube = tecnicoData?.tecnico?.clube_proprio
        if (!meuClube) {
          setErro('Não foi possível identificar seu clube.')
          setCarregando(false)
          return
        }

        let ladoAdversarioId = null
        let minhaForca = null
        let forcaDoOutro = null

        if (partida.clube_home_id === meuClube.id) {
          ladoAdversarioId = partida.clube_away_id
          minhaForca = partida.forca_ataque_home
          forcaDoOutro = partida.forca_ataque_away
          setMeuLado('home')
        } else if (partida.clube_away_id === meuClube.id) {
          ladoAdversarioId = partida.clube_home_id
          minhaForca = partida.forca_ataque_away
          forcaDoOutro = partida.forca_ataque_home
          setMeuLado('away')
        } else {
          setErro('Esta partida não pertence ao seu clube.')
          setCarregando(false)
          return
        }

        const clubeAdversario = await buscarClube(ladoAdversarioId)
        if (cancelado) return

        setMeuTime({
          nome: meuClube.nome,
          tecnico: tecnicoData.tecnico.nome ?? 'Você',
          nivel: tecnicoData.tecnico.nivel_titulo ?? 'Iniciante',
          cor1: meuClube.cor_primaria ?? '#F97316',
          cor2: meuClube.cor_secundaria ?? '#1C1C1C',
        })

        setAdversario({
          nome: clubeAdversario.nome,
          categoria: clubeAdversario.categoria_competicao ?? null,
          escudoUrl: clubeAdversario.escudo_url ?? null,
        })

        setForcaMinha(minhaForca)
        setForcaAdversario(forcaDoOutro)
        setCarregando(false)
      } catch (e) {
        if (cancelado) return
        setErro(e.message || 'Não foi possível carregar os dados da partida.')
        setCarregando(false)
      }
    }

    carregar()

    return () => { cancelado = true }
  }, [partidaId, navigate])

  // --- Contagem regressiva até navegar para a tela de Partida ---
  useEffect(() => {
    if (carregando || erro) return

    if (contagem <= 0) {
      navigate('/partida', { state: { partidaId } })
      return
    }
    const timeout = setTimeout(() => setContagem((c) => c - 1), 1000)
    return () => clearTimeout(timeout)
  }, [contagem, carregando, erro, navigate, partidaId])

  const temForcas = typeof forcaMinha === 'number' && typeof forcaAdversario === 'number'
  const totalForca = temForcas ? forcaMinha + forcaAdversario : 0
  const pctMinha = temForcas && totalForca > 0 ? (forcaMinha / totalForca) * 100 : 50

  if (erro) {
    return (
      <div style={{
        maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif",
        background: '#F5F5F5', height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box',
        textAlign: 'center', gap: '16px',
      }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
        <button
          onClick={() => navigate('/jogar')}
          style={{
            background: 'transparent', border: '1.5px solid #D1D5DB', borderRadius: '12px',
            padding: '13px 32px', color: '#1C1C1C', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          VOLTAR
        </button>
      </div>
    )
  }

  if (carregando) {
    return (
      <div style={{
        maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif",
        background: '#F5F5F5', height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box',
      }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#9CA3AF' }}>
          Carregando partida...
        </span>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#F5F5F5',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box',
    }}>

      <div style={{ fontSize: '13px', fontWeight: '700', color: '#F97316', letterSpacing: '2px', marginBottom: '36px' }}>
        PARTIDA ENCONTRADA
      </div>

      {/* Times frente a frente.
          ★ CORREÇÃO 30/06/2026 — antes "meu time" sempre aparecia à
          esquerda e o adversário sempre à direita, independente de
          mando de campo. Decisão fechada com Esdras: respeitar a
          convenção real de futebol — quem joga em CASA fica à esquerda,
          quem joga FORA fica à direita, sempre, então quando o técnico
          é o visitante (possível desde o Modo Carreira poder colocá-lo
          como away), ele aparece à direita corretamente. */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', marginBottom: '32px',
      }}>
        {meuLado === 'away' ? (
          <>
            <BlocoAdversario adversario={adversario} mandante={true} />
            <span style={{ fontSize: '26px', fontWeight: '900', color: '#1C1C1C', padding: '0 8px' }}>VS</span>
            <BlocoMeuTime meuTime={meuTime} mandante={false} />
          </>
        ) : (
          <>
            <BlocoMeuTime meuTime={meuTime} mandante={true} />
            <span style={{ fontSize: '26px', fontWeight: '900', color: '#1C1C1C', padding: '0 8px' }}>VS</span>
            <BlocoAdversario adversario={adversario} mandante={false} />
          </>
        )}
      </div>

      {/* Barra de força comparativa — Força de Ataque real, calculada pelo
          mesmo motor que decide os gols (motorPartida.calcularForcaAtaqueTime).
          Some enquanto o primeiro tick do relógio ainda não rodou. */}
      {temForcas && (
        <div style={{ width: '100%', marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#F97316' }}>{Math.round(forcaMinha)}</span>
            <span style={{ fontSize: '10px', fontWeight: '500', color: '#6B7280' }}>FORÇA DE ATAQUE</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#3B82F6' }}>{Math.round(forcaAdversario)}</span>
          </div>
          <div style={{
            width: '100%', height: '8px', borderRadius: '99px',
            background: '#3B82F6', overflow: 'hidden', display: 'flex',
          }}>
            <div style={{ width: `${pctMinha}%`, height: '100%', background: '#F97316' }} />
          </div>
        </div>
      )}

      {/* Contagem regressiva */}
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: '#F97316',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '12px',
      }}>
        <span style={{ fontSize: '28px', fontWeight: '900', color: '#fff' }}>{contagem}</span>
      </div>

      <span style={{ fontSize: '13px', fontWeight: '500', color: '#9CA3AF' }}>
        A partida vai começar...
      </span>

    </div>
  )
}