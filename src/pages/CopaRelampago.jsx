// src/pages/CopaRelampago.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import iconLightning from '../assets/icons/icon-lightning.png'
import iconTrophyGold from '../assets/icons/icon-trophy-gold.png'

// ─── COMPONENTES SVG ────────────────────────────────────────────────────────

const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#9CA3AF" strokeWidth="2"/>
    <path d="M12 7V12L15 14" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconUsers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="8" r="3" stroke="#9CA3AF" strokeWidth="2"/>
    <path d="M3 20C3 16.5 5.5 14 9 14C12.5 14 15 16.5 15 20" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 14C18.5 14 21 16.5 21 20M14 8.5C15.2 8.2 16 7.2 16 6C16 4.6 14.9 3.5 13.5 3.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// ─── DADOS MOCKADOS ────────────────────────────────────────────────────────────
// Técnico pode se inscrever em quantas copas quiser, mas só joga 1 partida
// por vez — restrição aplicada no momento da partida, não na inscrição.

const COPAS = [
  {
    id: 'copa-1',
    nome: 'Copa Relâmpago #47',
    inscritos: 64,
    maxInscritos: 100,
    inicio: 'Sexta, 19h',
    status: 'inscricoes_abertas', // inscricoes_abertas | inscrito | em_andamento
    premiacao: '3 times oficiais — vencedor escolhe 1 para treinar por 1 semana',
  },
  {
    id: 'copa-2',
    nome: 'Copa Relâmpago #48',
    inscritos: 22,
    maxInscritos: 100,
    inicio: 'Sexta, 21h',
    status: 'inscricoes_abertas',
    premiacao: '3 times oficiais — vencedor escolhe 1 para treinar por 1 semana',
  },
]

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function CopaRelampago() {
  const navigate = useNavigate()
  const [inscricoes, setInscricoes] = useState({})

  function handleInscrever(copaId) {
    setInscricoes(prev => ({ ...prev, [copaId]: true }))
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
      overflow: 'hidden',
    }}>

      {/* HEADER */}
      <div style={{
        padding: '14px 16px',
        background: '#1C1C1C',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/jogar')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#fff', fontSize: '22px', padding: '4px', lineHeight: 1,
          }}
        >
          ‹
        </button>
        <img src={iconLightning} alt="" style={{ width: '22px', height: '22px' }} />
        <div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
            Copa Relâmpago
          </div>
          <div style={{ fontSize: '12px', fontWeight: '400', color: '#9CA3AF', marginTop: '2px' }}>
            Eliminatória semanal. Toda sexta-feira.
          </div>
        </div>
      </div>

      {/* LISTA DE COPAS */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {COPAS.map(copa => {
          const inscrito = inscricoes[copa.id]
          const pctPreenchido = (copa.inscritos / copa.maxInscritos) * 100

          return (
            <div
              key={copa.id}
              style={{
                background: '#fff',
                borderRadius: '14px',
                padding: '14px',
                border: inscrito ? '1.5px solid #F97316' : '1.5px solid #E5E7EB',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '900', color: '#1C1C1C' }}>
                  {copa.nome}
                </span>
                {inscrito && (
                  <span style={{
                    fontSize: '10px', fontWeight: '700', color: '#F97316',
                    background: '#FFF7ED', padding: '3px 8px', borderRadius: '99px',
                  }}>
                    INSCRITO
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IconClock />
                  <span style={{ fontSize: '11px', fontWeight: '500', color: '#6B7280' }}>{copa.inicio}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IconUsers />
                  <span style={{ fontSize: '11px', fontWeight: '500', color: '#6B7280' }}>
                    {copa.inscritos}/{copa.maxInscritos} inscritos
                  </span>
                </div>
              </div>

              {/* Barra de inscritos */}
              <div style={{
                width: '100%', height: '6px', borderRadius: '99px',
                background: '#F5F5F5', overflow: 'hidden', marginBottom: '10px',
              }}>
                <div style={{
                  width: `${pctPreenchido}%`, height: '100%',
                  background: pctPreenchido > 80 ? '#EF4444' : '#F97316',
                }} />
              </div>

              {/* Premiação */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                background: '#F5F5F5', borderRadius: '10px', padding: '8px 10px',
                marginBottom: '12px',
              }}>
                <img src={iconTrophyGold} alt="" style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280', lineHeight: '1.4' }}>
                  {copa.premiacao}
                </span>
              </div>

              {/* Ação */}
              {inscrito ? (
                <button
                  disabled
                  style={{
                    width: '100%', background: '#F5F5F5', color: '#9CA3AF',
                    border: 'none', borderRadius: '10px', padding: '11px',
                    fontSize: '13px', fontWeight: '700', fontFamily: "'Inter', sans-serif",
                    cursor: 'default',
                  }}
                >
                  AGUARDANDO SEXTA-FEIRA
                </button>
              ) : (
                <button
                  onClick={() => handleInscrever(copa.id)}
                  style={{
                    width: '100%', background: '#F97316', color: '#fff',
                    border: 'none', borderRadius: '10px', padding: '11px',
                    fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px',
                    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  }}
                >
                  INSCREVER-SE
                </button>
              )}
            </div>
          )
        })}

        {/* AVISO REGRA */}
        <div style={{
          background: '#FFF7ED', borderRadius: '12px', padding: '12px 14px',
          border: '1px solid #FDBA74',
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1C', marginBottom: '4px' }}>
            ⚡ Como funciona
          </div>
          <div style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280', lineHeight: '1.5' }}>
            Você pode se inscrever em mais de uma copa, mas só joga uma partida por vez. Se duas copas caírem no mesmo horário, escolha qual disputar primeiro.
          </div>
        </div>

      </div>

    </div>
  )
}