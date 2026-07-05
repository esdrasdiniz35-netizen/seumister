// src/pages/PremiacaoCopa.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import iconTrophyGold from '../assets/icons/icon-trophy-gold.png'

// ─── COMPONENTES SVG ────────────────────────────────────────────────────────

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor1}/>
    <path d="M32 2V70C48 66 60 54 60 38V14L32 2Z" fill={cor2}/>
    <line x1="32" y1="2" x2="32" y2="70" stroke="#1C1C1C" strokeWidth="2"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke="#1C1C1C" strokeWidth="3" fill="none"/>
  </svg>
)

const IconCoin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" fill="#F97316"/>
    <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="900" fill="#fff">$</text>
  </svg>
)

// ─── DADOS MOCKADOS ────────────────────────────────────────────────────────────

const TIME = {
  nome: 'Raposa FC',
  cor1: '#F97316',
  cor2: '#1C1C1C',
}

const COPA = {
  nome: 'Copa Relâmpago #47',
}

const TIMES_OFICIAIS = [
  { id: 'flamengo', nome: 'Flamengo', orcamento: 2400, cor: '#EF4444' },
  { id: 'corinthians', nome: 'Corinthians', orcamento: 2100, cor: '#1C1C1C' },
  { id: 'gremio', nome: 'Grêmio', orcamento: 1900, cor: '#3B82F6' },
]

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function PremiacaoCopa() {
  const navigate = useNavigate()
  const [timeSelecionado, setTimeSelecionado] = useState(null)
  const [confirmado, setConfirmado] = useState(false)

  function handleConfirmar() {
    if (!timeSelecionado) return
    setConfirmado(true)
  }

  if (confirmado) {
    const time = TIMES_OFICIAIS.find(t => t.id === timeSelecionado)
    return (
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        fontFamily: "'Inter', sans-serif",
        background: '#1C1C1C',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: time.cor, display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px', fontSize: '36px', fontWeight: '900', color: '#fff',
        }}>
          {time.nome[0]}
        </div>
        <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '6px', textAlign: 'center' }}>
          Você agora comanda o {time.nome}!
        </div>
        <div style={{ fontSize: '13px', fontWeight: '400', color: '#9CA3AF', marginBottom: '28px', textAlign: 'center' }}>
          Seu time de origem entrou em standby. Bom desempenho prorroga sua permanência por +1 semana.
        </div>
        <button
          onClick={() => navigate('/time-oficial')}
          style={{
            width: '100%', background: '#F97316', color: '#fff',
            border: 'none', borderRadius: '12px', padding: '15px',
            fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          IR PARA O PAINEL DO TIME OFICIAL
        </button>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#1C1C1C',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>

      {/* TROFÉU E CONQUISTA */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
        <div style={{
          width: '76px', height: '76px', borderRadius: '50%',
          background: '#262626', border: '2px solid #FBBF24',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '14px', boxShadow: '0 0 24px rgba(251,191,36,0.3)',
        }}>
          <img src={iconTrophyGold} alt="campeão" style={{ width: '38px', height: '38px' }} />
        </div>

        <span style={{ fontSize: '11px', fontWeight: '700', color: '#FBBF24', letterSpacing: '1.5px', marginBottom: '4px' }}>
          CAMPEÃO
        </span>
        <span style={{ fontSize: '19px', fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: '6px' }}>
          {COPA.nome}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EscudoTime cor1={TIME.cor1} cor2={TIME.cor2} size={28} />
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{TIME.nome}</span>
        </div>
      </div>

      {/* TÍTULO DA ESCOLHA */}
      <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
        Escolha um time oficial para treinar
      </div>
      <div style={{ fontSize: '11px', fontWeight: '400', color: '#9CA3AF', marginBottom: '14px' }}>
        Você vai comandar este time por 1 semana. Bom desempenho prorroga a permanência.
      </div>

      {/* CARDS DOS TIMES OFICIAIS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
        {TIMES_OFICIAIS.map(time => {
          const selecionado = timeSelecionado === time.id
          return (
            <button
              key={time.id}
              onClick={() => setTimeSelecionado(time.id)}
              style={{
                background: selecionado ? '#262626' : '#1C1C1C',
                border: selecionado ? '2px solid #F97316' : '1.5px solid #4B5563',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                textAlign: 'left',
              }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: time.cor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: '900', color: '#fff', flexShrink: 0,
              }}>
                {time.nome[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{time.nome}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                  <IconCoin />
                  <span style={{ fontSize: '11px', fontWeight: '500', color: '#9CA3AF' }}>
                    Orçamento: {time.orcamento.toLocaleString('pt-BR')} moedas
                  </span>
                </div>
              </div>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                border: selecionado ? 'none' : '2px solid #4B5563',
                background: selecionado ? '#F97316' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {selecionado && <span style={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}>✓</span>}
              </div>
            </button>
          )
        })}
      </div>

      {/* AVISO */}
      <div style={{
        background: '#262626', borderRadius: '10px', padding: '10px 12px',
        fontSize: '11px', fontWeight: '400', color: '#9CA3AF', lineHeight: '1.5',
        margin: '12px 0',
      }}>
        Seu time de origem ({TIME.nome}) vai para standby — não evolui, mas também não some — enquanto você estiver no comando do time oficial.
      </div>

      <button
        onClick={handleConfirmar}
        disabled={!timeSelecionado}
        style={{
          width: '100%',
          background: timeSelecionado ? '#F97316' : '#4B5563',
          color: '#fff',
          border: 'none', borderRadius: '12px', padding: '15px',
          fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px',
          cursor: timeSelecionado ? 'pointer' : 'default',
          fontFamily: "'Inter', sans-serif",
          flexShrink: 0,
        }}
      >
        CONFIRMAR ESCOLHA
      </button>
    </div>
  )
}