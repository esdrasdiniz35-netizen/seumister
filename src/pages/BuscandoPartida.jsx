// src/pages/BuscandoPartida.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTecnicoMe } from '../lib/cacheTecnico'

import { buscarPartidaOnline, consultarStatusBusca, cancelarBuscaOnline } from '../lib/partidaApi'

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 64, contorno = '#1C1C1C' }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor1}/>
    <path d="M32 2V70C48 66 60 54 60 38V14L32 2Z" fill={cor2}/>
    <line x1="32" y1="2" x2="32" y2="70" stroke={contorno} strokeWidth="2"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke={contorno} strokeWidth="3" fill="none"/>
  </svg>
)

// Cor de marca usada só como placeholder enquanto o clube real ainda
// não carregou (evita flash de escudo cinza vazio) — não é dado falso,
// é só o estado de loading até a busca real em /api/tecnicos/me voltar.
const CORES_PADRAO = { cor1: '#F97316', cor2: '#1C1C1C' }

const INTERVALO_POLLING_MS = 3000

export default function BuscandoPartida() {
  const navigate = useNavigate()
  const [tempo, setTempo] = useState(0)
  const [erro, setErro] = useState(null)
  const [cancelando, setCancelando] = useState(false)
  const [clube, setClube] = useState(CORES_PADRAO)

  const pollingRef = useRef(null)
  const cronometroRef = useRef(null)
  const partidaEncontradaRef = useRef(false)

  // Busca as cores reais do clube só pra exibir o escudo certo enquanto
  // procura adversário — independente da fila de matchmaking, então uma
  // falha aqui não deve travar a busca de partida (fica na cor padrão).
  useEffect(() => {
    let cancelado = false
    getTecnicoMe()
      .then((resultado) => {
        if (cancelado) return
        const clubeReal = resultado?.tecnico?.clube_proprio
        if (clubeReal) {
          setClube({
            cor1: clubeReal.cor_primaria ?? CORES_PADRAO.cor1,
            cor2: clubeReal.cor_secundaria ?? CORES_PADRAO.cor2,
          })
        }
      })
      .catch(() => {
        // Mantém a cor padrão — não é crítico pra essa tela.
      })
    return () => { cancelado = true }
  }, [])

  // Navega para a tela de pré-partida assim que uma partida é encontrada
  // (seja na entrada inicial na fila, seja durante o polling)
  const irParaPrePartida = (partidaId) => {
    if (partidaEncontradaRef.current) return // evita navegação duplicada
    partidaEncontradaRef.current = true
    clearInterval(pollingRef.current)
    clearInterval(cronometroRef.current)
    navigate('/pre-partida', { state: { partidaId } })
  }

  const iniciarPolling = () => {
    pollingRef.current = setInterval(async () => {
      try {
        const resultado = await consultarStatusBusca()
        if (resultado.status === 'pareado' && resultado.partida_id) {
          irParaPrePartida(resultado.partida_id)
        }
      } catch (e) {
        // Falha de rede pontual durante o polling não deve travar a tela —
        // só tenta de novo no próximo ciclo.
        console.error('Erro ao consultar status da busca:', e)
      }
    }, INTERVALO_POLLING_MS)
  }

  useEffect(() => {
    // Cronômetro visual (independente do polling)
    cronometroRef.current = setInterval(() => {
      setTempo(t => t + 1)
    }, 1000)

    // Entra na fila de busca ao montar a tela
    const entrarNaFila = async () => {
      try {
        const resultado = await buscarPartidaOnline()
        if (resultado.status === 'pareado' && resultado.partida_id) {
          irParaPrePartida(resultado.partida_id)
        } else {
          iniciarPolling()
        }
      } catch (e) {
        setErro(e.message || 'Não foi possível buscar uma partida agora.')
        clearInterval(cronometroRef.current)
      }
    }

    entrarNaFila()

    return () => {
      clearInterval(pollingRef.current)
      clearInterval(cronometroRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCancelar = async () => {
    setCancelando(true)
    clearInterval(pollingRef.current)
    clearInterval(cronometroRef.current)
    try {
      await cancelarBuscaOnline()
    } catch (e) {
      // Mesmo se o cancelamento falhar no backend (ex: já tinha pareado
      // um instante antes), ainda assim tiramos o usuário desta tela.
      console.error('Erro ao cancelar busca:', e)
    } finally {
      navigate('/jogar')
    }
  }

  const minutos = Math.floor(tempo / 60)
  const segundos = tempo % 60
  const tempoFormatado = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#F5F5F5',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '35vh',
      paddingLeft: '24px',
      paddingRight: '24px',
      boxSizing: 'border-box',
    }}>

      {/* Escudo do jogador com animação de pulso */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '24px', marginBottom: '32px',
      }}>
        <div style={{
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <EscudoTime cor1={clube.cor1} cor2={clube.cor2} size={84} contorno="#1C1C1C" />
        </div>

        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid #F97316', borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
        }} />

        <div style={{
          width: '84px', height: '94px',
          borderRadius: '12px',
          border: '2px dashed #D1D5DB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '32px', color: '#6B7280' }}>?</span>
        </div>
      </div>

      <div style={{ fontSize: '17px', fontWeight: '700', color: '#1C1C1C', marginBottom: '6px', textAlign: 'center' }}>
        {erro ? 'Não foi possível buscar uma partida' : 'Procurando adversário do mesmo nível...'}
      </div>

      {erro ? (
        <div style={{ fontSize: '13px', fontWeight: '400', color: '#EF4444', marginBottom: '28px', textAlign: 'center', maxWidth: '320px' }}>
          {erro}
        </div>
      ) : (
        <div style={{ fontSize: '14px', fontWeight: '400', color: '#6B7280', marginBottom: '28px' }}>
          {tempoFormatado}
        </div>
      )}

      <button
        onClick={erro ? () => navigate('/jogar') : handleCancelar}
        disabled={cancelando}
        style={{
          background: 'transparent',
          border: '1.5px solid #D1D5DB',
          borderRadius: '12px',
          padding: '13px 32px',
          color: '#1C1C1C',
          fontSize: '14px',
          fontWeight: '700',
          cursor: cancelando ? 'default' : 'pointer',
          opacity: cancelando ? 0.6 : 1,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {erro ? 'VOLTAR' : (cancelando ? 'CANCELANDO...' : 'CANCELAR')}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  )
}