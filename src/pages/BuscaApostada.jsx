// src/pages/BuscaApostada.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { buscarPartidaApostada, consultarStatusBusca, cancelarBuscaOnline } from '../lib/partidaApi'

import iconCoin from '../assets/icons/icon-coin.png'
import mascote from '../assets/piscando.png'

// ─── ESCALA DE APOSTAS POR NÍVEL DE TÍTULO ──────────────────────────────────
// Mesma escala do backend (routes/partida.js, ESCALA_APOSTAS) — se mudar
// aqui, mudar lá também. O backend é quem valida de verdade; essa cópia
// aqui é só pra montar os botões sem esperar round-trip nenhum.
const ESCALA_APOSTAS = {
  'Iniciante':           [5],
  'Amador':              [5, 10],
  'Promissor':           [5, 10, 20],
  'Pro':                 [10, 20, 50],
  'Elite':               [20, 50, 100],
  'Super Treinador':     [50, 100, 200, 500],
  'Lenda da Plataforma': [50, 100, 200, 500, 1000],
}

const INTERVALO_POLLING_MS = 3000

export default function BuscaApostada() {
  const navigate = useNavigate()

  const [carregando, setCarregando] = useState(true)
  const [erroCarregar, setErroCarregar] = useState(null)
  const [nivelTitulo, setNivelTitulo] = useState('Iniciante')
  const [moedas, setMoedas] = useState(0)

  const [etapa, setEtapa] = useState('escolher') // 'escolher' | 'aguardando'
  const [valorEscolhido, setValorEscolhido] = useState(null)
  const [erroBusca, setErroBusca] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [tempoEspera, setTempoEspera] = useState(0)

  const pollingRef = useRef(null)
  const cronometroRef = useRef(null)
  const partidaEncontradaRef = useRef(false)

  // Busca nível de título e saldo reais do técnico ao montar a tela.
  useEffect(() => {
    let cancelado = false
    apiFetch('/api/tecnicos/me', { method: 'GET' })
      .then((resultado) => {
        if (cancelado) return
        const tecnico = resultado?.tecnico
        const nivel = tecnico?.nivel_titulo || 'Iniciante'
        const saldoAtual = tecnico?.clube_proprio?.moedas ?? 0
        setNivelTitulo(nivel)
        setMoedas(saldoAtual)
        const faixas = ESCALA_APOSTAS[nivel] || ESCALA_APOSTAS['Iniciante']
        setValorEscolhido(faixas[0])
        setCarregando(false)
      })
      .catch((e) => {
        if (cancelado) return
        console.error('Erro ao buscar dados do técnico para Busca Apostada:', e)
        setErroCarregar('Não foi possível carregar seus dados agora.')
        setCarregando(false)
      })
    return () => { cancelado = true }
  }, [])

  const apostasDisponiveis = ESCALA_APOSTAS[nivelTitulo] || ESCALA_APOSTAS['Iniciante']

  // Navega pra pré-partida assim que a busca pareia (seja na entrada
  // inicial na fila, seja durante o polling).
  const irParaPrePartida = (partidaId) => {
    if (partidaEncontradaRef.current) return
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
        // Falha pontual de rede durante o polling não deve travar a tela.
        console.error('Erro ao consultar status da busca apostada:', e)
      }
    }, INTERVALO_POLLING_MS)
  }

  useEffect(() => {
    if (etapa !== 'aguardando') return

    cronometroRef.current = setInterval(() => {
      setTempoEspera(t => t + 1)
    }, 1000)
    iniciarPolling()

    return () => {
      clearInterval(pollingRef.current)
      clearInterval(cronometroRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapa])

  async function handleConfirmar() {
    if (!valorEscolhido || enviando) return
    setEnviando(true)
    setErroBusca(null)
    try {
      const resultado = await buscarPartidaApostada(valorEscolhido)
      if (resultado.status === 'pareado' && resultado.partida_id) {
        irParaPrePartida(resultado.partida_id)
      } else {
        setTempoEspera(0)
        setEtapa('aguardando')
      }
    } catch (e) {
      setErroBusca(e.message || 'Não foi possível buscar uma partida apostada agora.')
    } finally {
      setEnviando(false)
    }
  }

  async function handleCancelar() {
    setCancelando(true)
    clearInterval(pollingRef.current)
    clearInterval(cronometroRef.current)
    try {
      await cancelarBuscaOnline()
    } catch (e) {
      // Mesmo se falhar no backend (ex: pareou um instante antes), ainda
      // assim tira o técnico desta tela.
      console.error('Erro ao cancelar busca apostada:', e)
    } finally {
      setCancelando(false)
      setEtapa('escolher')
      setTempoEspera(0)
    }
  }

  const minutos = Math.floor(tempoEspera / 60)
  const segundos = tempoEspera % 60
  const tempoFormatado = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`

  // ─── ESTADO DE CARREGAMENTO INICIAL ────────────────────────────────────────

  if (carregando) {
    return (
      <div style={{
        maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif",
        background: '#F5F5F5', height: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid #F97316', borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (erroCarregar) {
    return (
      <div style={{
        maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif",
        background: '#F5F5F5', height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px', boxSizing: 'border-box',
      }}>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#EF4444', marginBottom: '20px', textAlign: 'center' }}>
          {erroCarregar}
        </div>
        <button
          onClick={() => navigate('/jogar')}
          style={{
            background: '#F97316', color: '#fff', border: 'none', borderRadius: '12px',
            padding: '13px 32px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          VOLTAR
        </button>
      </div>
    )
  }

  // ─── ETAPA 2: AGUARDANDO ADVERSÁRIO ─────────────────────────────────────────

  if (etapa === 'aguardando') {
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
        paddingTop: '30vh',
        paddingLeft: '24px',
        paddingRight: '24px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '84px', height: '84px', borderRadius: '50%',
          background: '#fff', border: '2px solid #F97316',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '24px', position: 'relative',
        }}>
          <img src={iconCoin} alt="" style={{ width: '36px', height: '36px' }} />
          <div style={{
            position: 'absolute', inset: '-2px',
            borderRadius: '50%',
            border: '3px solid #F97316', borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
          }} />
        </div>

        <div style={{ fontSize: '17px', fontWeight: '700', color: '#1C1C1C', marginBottom: '6px', textAlign: 'center' }}>
          Procurando adversário do mesmo nível e faixa...
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: '99px', padding: '6px 14px',
          marginBottom: '20px', marginTop: '10px',
        }}>
          <img src={iconCoin} alt="" style={{ width: '16px', height: '16px' }} />
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C' }}>{valorEscolhido} moedas</span>
        </div>

        <div style={{ fontSize: '14px', fontWeight: '400', color: '#6B7280', marginBottom: '28px' }}>
          {tempoFormatado}
        </div>

        <div style={{
          background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '10px', padding: '10px 14px',
          fontSize: '11px', fontWeight: '400', color: '#1C1C1C',
          marginBottom: '28px', textAlign: 'center', lineHeight: '1.5',
          maxWidth: '300px',
        }}>
          Suas {valorEscolhido} moedas estão reservadas. Se ninguém aparecer, elas voltam pra você ao cancelar.
        </div>

        <button
          onClick={handleCancelar}
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
          {cancelando ? 'CANCELANDO...' : 'CANCELAR'}
        </button>

        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ─── ETAPA 1: ESCOLHER VALOR ─────────────────────────────────────────────────

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#F5F5F5',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* HEADER */}
      <div style={{
        padding: '14px 16px',
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', gap: '12px',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/jogar')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#1C1C1C', padding: '4px', lineHeight: 1 }}
        >
          ‹
        </button>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C', lineHeight: 1 }}>
            Busca Apostada
          </div>
          <div style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280', marginTop: '3px' }}>
            Vença e leve tudo. Perca e perde sua aposta.
          </div>
        </div>
      </div>

      {/* MASCOTE + BALÃO */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px 4px', gap: '10px', flexShrink: 0 }}>
        <img src={mascote} alt="Seu Mister"
          style={{ width: '54px', height: '54px', objectFit: 'contain', flexShrink: 0 }} />
        <div style={{
          border: '2px solid #1C1C1C', borderRadius: '12px',
          padding: '8px 12px', fontSize: '12px', fontWeight: '500',
          color: '#1C1C1C', flex: 1, lineHeight: '15px',
        }}>
          Escolhe o valor e topa o desafio — quem vencer leva as duas apostas.
        </div>
      </div>

      {/* CONTEÚDO ROLÁVEL */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* SALDO ATUAL */}
        <div style={{
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280' }}>Seu saldo</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src={iconCoin} alt="" style={{ width: '18px', height: '18px' }} />
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1C' }}>
              {moedas.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* NÍVEL DO TÉCNICO */}
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#F97316', letterSpacing: '1px' }}>
            SEU NÍVEL: {nivelTitulo.toUpperCase()}
          </span>
        </div>

        {/* ESCOLHA DO VALOR */}
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C', marginBottom: '12px' }}>
          Escolha o valor da aposta
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '16px',
        }}>
          {apostasDisponiveis.map(valor => {
            const selecionado = valorEscolhido === valor
            const semSaldo = moedas < valor
            return (
              <button
                key={valor}
                onClick={() => !semSaldo && setValorEscolhido(valor)}
                disabled={semSaldo}
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: selecionado ? '#F97316' : '#fff',
                  border: selecionado ? '3px solid #FDBA74' : '2px solid #E5E7EB',
                  cursor: semSaldo ? 'default' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  fontFamily: "'Inter', sans-serif",
                  flexShrink: 0,
                  opacity: semSaldo ? 0.4 : 1,
                  boxShadow: selecionado ? '0 4px 14px rgba(249,115,22,0.3)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <img src={iconCoin} alt="" style={{ width: '18px', height: '18px' }} />
                <span style={{
                  fontSize: '15px', fontWeight: '900',
                  color: selecionado ? '#fff' : '#1C1C1C',
                }}>
                  {valor}
                </span>
              </button>
            )
          })}
        </div>

        {apostasDisponiveis.length === 1 && (
          <div style={{
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 12px',
            fontSize: '11px', fontWeight: '400', color: '#6B7280', marginBottom: '16px',
            lineHeight: '1.5',
          }}>
            Técnicos no nível Iniciante só podem apostar 5 moedas. Suba de nível pra liberar valores maiores.
          </div>
        )}

        {/* RESUMO */}
        <div style={{
          background: '#FFF7ED', borderRadius: '12px', padding: '12px 14px',
          marginBottom: '16px', border: '1px solid #FDBA74',
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#F97316', marginBottom: '4px' }}>
            COMO FUNCIONA
          </div>
          <div style={{ fontSize: '12px', fontWeight: '400', color: '#1C1C1C', lineHeight: '1.5' }}>
            Suas {valorEscolhido || 0} moedas ficam reservadas até o fim da partida. Quem vencer leva tudo. Em caso de empate, cada um recebe sua aposta de volta.
          </div>
        </div>

        {erroBusca && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '10px 12px',
            fontSize: '12px', fontWeight: '500', color: '#EF4444', marginBottom: '16px',
          }}>
            {erroBusca}
          </div>
        )}
      </div>

      {/* RODAPÉ FIXO */}
      <div style={{ padding: '12px 16px 16px', background: '#F5F5F5', flexShrink: 0 }}>
        <button
          onClick={handleConfirmar}
          disabled={!valorEscolhido || enviando || moedas < (valorEscolhido || 0)}
          style={{
            width: '100%',
            background: (!valorEscolhido || enviando || moedas < (valorEscolhido || 0)) ? '#FDBA74' : '#F97316',
            color: '#fff',
            border: 'none', borderRadius: '12px', padding: '15px',
            fontSize: '15px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: (!valorEscolhido || enviando || moedas < (valorEscolhido || 0)) ? 'default' : 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {enviando ? 'BUSCANDO...' : `APOSTAR ${valorEscolhido || 0} MOEDAS`}
        </button>
      </div>
    </div>
  )
}