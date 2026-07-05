// src/pages/TabelaCompeticao.jsx
import { useParams, useNavigate } from 'react-router-dom'

// ─── COMPONENTES SVG ────────────────────────────────────────────────────────

const EscudoGenerico = ({ cor = '#6B7280', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor} stroke="#1C1C1C" strokeWidth="2"/>
  </svg>
)

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor1}/>
    <path d="M32 2V70C48 66 60 54 60 38V14L32 2Z" fill={cor2}/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke="#1C1C1C" strokeWidth="2" fill="none"/>
  </svg>
)

// ─── DADOS MOCKADOS ────────────────────────────────────────────────────────────
// Estrutura genérica — funciona pra Série B hoje e Série A / Libertadores / etc
// no futuro, trocando apenas o conteúdo de COMPETICOES[id] quando vier do backend.

const COMPETICOES = {
  'serie-b': {
    nome: 'Série B',
    rodadaAtual: 8,
    totalRodadas: 19,
    meuTimeId: 3,
    proximoJogo: { adversario: 'Tigres FC', data: 'Sábado, 16h', mandante: true },
    tabela: [
      { pos: 1, nome: 'Leões FC',     pts: 19, j: 7, v: 6, e: 1, d: 0, gp: 18, gc: 5,  saldo: 13 },
      { pos: 2, nome: 'Trovão EC',    pts: 16, j: 7, v: 5, e: 1, d: 1, gp: 14, gc: 7,  saldo: 7  },
      { pos: 3, nome: 'Raposa FC',    pts: 14, j: 7, v: 4, e: 2, d: 1, gp: 12, gc: 8,  saldo: 4, voce: true },
      { pos: 4, nome: 'Pantera SC',   pts: 13, j: 7, v: 4, e: 1, d: 2, gp: 11, gc: 9,  saldo: 2  },
      { pos: 5, nome: 'Cobra FC',     pts: 11, j: 7, v: 3, e: 2, d: 2, gp: 10, gc: 10, saldo: 0  },
      { pos: 6, nome: 'Falcões SC',   pts: 10, j: 7, v: 3, e: 1, d: 3, gp: 9,  gc: 11, saldo: -2 },
      { pos: 7, nome: 'Tigres FC',    pts: 8,  j: 7, v: 2, e: 2, d: 3, gp: 8,  gc: 12, saldo: -4 },
      { pos: 8, nome: 'Relâmpago FC', pts: 5,  j: 7, v: 1, e: 2, d: 4, gp: 6,  gc: 14, saldo: -8 },
    ],
    zonaAcesso: 2,
  },
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function TabelaCompeticao() {
  const navigate = useNavigate()
  const { id } = useParams()

  const competicao = COMPETICOES[id] || COMPETICOES['serie-b']

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
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={() => navigate('/modo-carreira')}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: '22px', padding: '4px', lineHeight: 1,
            }}
          >
            ‹
          </button>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
              {competicao.nome}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '400', color: '#9CA3AF', marginTop: '2px' }}>
              Rodada {competicao.rodadaAtual} de {competicao.totalRodadas}
            </div>
          </div>
        </div>

        {/* PRÓXIMO JOGO COMPACTO */}
        <div style={{
          background: '#262626', borderRadius: '12px', padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#F97316', letterSpacing: '0.5px' }}>
              PRÓXIMO JOGO
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', marginTop: '2px' }}>
              {competicao.proximoJogo.mandante ? 'vs' : '@'} {competicao.proximoJogo.adversario}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '400', color: '#9CA3AF', marginTop: '1px' }}>
              {competicao.proximoJogo.data}
            </div>
          </div>
          <button
            onClick={() => navigate('/buscando-partida')}
            style={{
              background: '#F97316', border: 'none', borderRadius: '8px',
              padding: '8px 14px', fontSize: '11px', fontWeight: '700',
              color: '#fff', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            }}
          >
            JOGAR
          </button>
        </div>
      </div>

      {/* TABELA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>

        {/* Legenda da zona de acesso */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '0 4px' }}>
          <div style={{ width: '4px', height: '12px', background: '#10B981', borderRadius: '2px' }} />
          <span style={{ fontSize: '10px', fontWeight: '500', color: '#6B7280' }}>Zona de acesso</span>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>

          {/* Cabeçalho da tabela */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '24px 1fr 28px 24px 24px 24px 32px',
            gap: '4px',
            padding: '8px 10px',
            background: '#F5F5F5',
            borderBottom: '1px solid #E5E7EB',
          }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF' }}>#</span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF' }}>TIME</span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textAlign: 'center' }}>PTS</span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textAlign: 'center' }}>J</span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textAlign: 'center' }}>V</span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textAlign: 'center' }}>D</span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textAlign: 'center' }}>SG</span>
          </div>

          {/* Linhas */}
          {competicao.tabela.map((time, idx) => (
            <div
              key={time.pos}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr 28px 24px 24px 24px 32px',
                gap: '4px',
                padding: '9px 10px',
                alignItems: 'center',
                background: time.voce ? '#FFF7ED' : '#fff',
                borderLeft: `3px solid ${time.pos <= competicao.zonaAcesso ? '#10B981' : 'transparent'}`,
                borderBottom: idx < competicao.tabela.length - 1 ? '1px solid #F5F5F5' : 'none',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1C' }}>{time.pos}</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                {time.voce ? (
                  <EscudoTime cor1="#F97316" cor2="#1C1C1C" size={20} />
                ) : (
                  <EscudoGenerico cor="#9CA3AF" size={20} />
                )}
                <span style={{
                  fontSize: '12px', fontWeight: time.voce ? '900' : '500',
                  color: '#1C1C1C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {time.nome}
                </span>
              </div>

              <span style={{ fontSize: '12px', fontWeight: '900', color: '#1C1C1C', textAlign: 'center' }}>{time.pts}</span>
              <span style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280', textAlign: 'center' }}>{time.j}</span>
              <span style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280', textAlign: 'center' }}>{time.v}</span>
              <span style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280', textAlign: 'center' }}>{time.d}</span>
              <span style={{
                fontSize: '11px', fontWeight: '700', textAlign: 'center',
                color: time.saldo > 0 ? '#10B981' : time.saldo < 0 ? '#EF4444' : '#6B7280',
              }}>
                {time.saldo > 0 ? '+' : ''}{time.saldo}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '11px', color: '#9CA3AF' }}>
          Não rebaixa — só não sobe se for mal
        </div>

      </div>

    </div>
  )
}