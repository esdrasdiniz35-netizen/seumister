// src/pages/ChaveamentoCopa.jsx
import { useNavigate, useParams } from 'react-router-dom'

import iconLightning from '../assets/icons/icon-lightning.png'

// ─── COMPONENTES SVG ────────────────────────────────────────────────────────

const EscudoGenerico = ({ cor = '#6B7280', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor} stroke="#1C1C1C" strokeWidth="2"/>
  </svg>
)

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor1}/>
    <path d="M32 2V70C48 66 60 54 60 38V14L32 2Z" fill={cor2}/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke="#1C1C1C" strokeWidth="2" fill="none"/>
  </svg>
)

// ─── DADOS MOCKADOS ────────────────────────────────────────────────────────────
// O chaveamento visual só começa nas oitavas (16 times). A fase de classificação
// (100 → 16 inscritos) acontece "nos bastidores" e não é desenhada como bracket.

const NOMES_FASES = ['Oitavas de Final', 'Quartas de Final', 'Semifinal', 'Final']

const FASES = [
  // OITAVAS — 8 confrontos
  {
    nome: 'Oitavas de Final',
    status: 'em_andamento',
    confrontos: [
      { id: 1, casa: 'Raposa FC',    fora: 'Cobra FC',     placarCasa: null, placarFora: null, voce: true,  jogado: false },
      { id: 2, casa: 'Leões FC',     fora: 'Trovão EC',    placarCasa: 2,    placarFora: 1,    voce: false, jogado: true  },
      { id: 3, casa: 'Pantera SC',   fora: 'Falcões SC',   placarCasa: 0,    placarFora: 0,    voce: false, jogado: true  },
      { id: 4, casa: 'Tigres FC',    fora: 'Relâmpago FC', placarCasa: null, placarFora: null, voce: false, jogado: false },
      { id: 5, casa: 'Águia FC',     fora: 'Vulcão EC',    placarCasa: 3,    placarFora: 0,    voce: false, jogado: true  },
      { id: 6, casa: 'Fênix SC',     fora: 'Touro FC',     placarCasa: null, placarFora: null, voce: false, jogado: false },
      { id: 7, casa: 'Coruja EC',    fora: 'Lince FC',     placarCasa: 1,    placarFora: 2,    voce: false, jogado: true  },
      { id: 8, casa: 'Furacão SC',   fora: 'Pegaso FC',    placarCasa: null, placarFora: null, voce: false, jogado: false },
    ],
  },
  // QUARTAS — 4 confrontos (ainda sem definição, dependem das oitavas)
  {
    nome: 'Quartas de Final',
    status: 'pendente',
    confrontos: [
      { id: 1, casa: 'A definir', fora: 'A definir', placarCasa: null, placarFora: null, voce: false, jogado: false },
      { id: 2, casa: 'A definir', fora: 'A definir', placarCasa: null, placarFora: null, voce: false, jogado: false },
      { id: 3, casa: 'A definir', fora: 'A definir', placarCasa: null, placarFora: null, voce: false, jogado: false },
      { id: 4, casa: 'A definir', fora: 'A definir', placarCasa: null, placarFora: null, voce: false, jogado: false },
    ],
  },
  // SEMIFINAL — 2 confrontos
  {
    nome: 'Semifinal',
    status: 'pendente',
    confrontos: [
      { id: 1, casa: 'A definir', fora: 'A definir', placarCasa: null, placarFora: null, voce: false, jogado: false },
      { id: 2, casa: 'A definir', fora: 'A definir', placarCasa: null, placarFora: null, voce: false, jogado: false },
    ],
  },
  // FINAL — 1 confronto
  {
    nome: 'Final',
    status: 'pendente',
    confrontos: [
      { id: 1, casa: 'A definir', fora: 'A definir', placarCasa: null, placarFora: null, voce: false, jogado: false },
    ],
  },
]

// ─── CARD DE CONFRONTO ─────────────────────────────────────────────────────────

function CardConfronto({ confronto, navigate }) {
  const { casa, fora, placarCasa, placarFora, voce, jogado } = confronto
  const aDefinir = casa === 'A definir' || fora === 'A definir'

  const venceuCasa = jogado && placarCasa > placarFora
  const venceuFora = jogado && placarFora > placarCasa

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: voce ? '1.5px solid #F97316' : '1.5px solid #E5E7EB',
      padding: '10px',
      width: '180px',
      flexShrink: 0,
      opacity: aDefinir ? 0.55 : 1,
    }}>
      {/* Time da casa */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          {!aDefinir && (voce ? <EscudoTime size={18} /> : <EscudoGenerico size={18} />)}
          <span style={{
            fontSize: '11px', fontWeight: venceuCasa ? '900' : '500',
            color: aDefinir ? '#9CA3AF' : '#1C1C1C',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {casa}
          </span>
        </div>
        <span style={{ fontSize: '13px', fontWeight: '900', color: venceuCasa ? '#1C1C1C' : '#9CA3AF', flexShrink: 0 }}>
          {jogado ? placarCasa : '-'}
        </span>
      </div>

      <div style={{ height: '1px', background: '#F5F5F5', margin: '4px 0' }} />

      {/* Time de fora */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          {!aDefinir && <EscudoGenerico size={18} />}
          <span style={{
            fontSize: '11px', fontWeight: venceuFora ? '900' : '500',
            color: aDefinir ? '#9CA3AF' : '#1C1C1C',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {fora}
          </span>
        </div>
        <span style={{ fontSize: '13px', fontWeight: '900', color: venceuFora ? '#1C1C1C' : '#9CA3AF', flexShrink: 0 }}>
          {jogado ? placarFora : '-'}
        </span>
      </div>

      {voce && !jogado && (
        <button
          onClick={() => navigate('/buscando-partida')}
          style={{
            width: '100%', marginTop: '8px', background: '#F97316', color: '#fff',
            border: 'none', borderRadius: '7px', padding: '6px',
            fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          JOGAR CONFRONTO
        </button>
      )}

      {voce && jogado && (
        <div style={{
          marginTop: '8px', textAlign: 'center', fontSize: '10px', fontWeight: '700',
          color: venceuCasa ? '#10B981' : '#EF4444',
        }}>
          {venceuCasa ? 'CLASSIFICADO' : 'ELIMINADO'}
        </div>
      )}
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function ChaveamentoCopa() {
  const navigate = useNavigate()
  const { id } = useParams()

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
          onClick={() => navigate('/copa-relampago')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#fff', fontSize: '22px', padding: '4px', lineHeight: 1,
          }}
        >
          ‹
        </button>
        <img src={iconLightning} alt="" style={{ width: '20px', height: '20px' }} />
        <div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
            Copa Relâmpago {id ? `#${id}` : ''}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '400', color: '#9CA3AF', marginTop: '2px' }}>
            16 times classificados • mata-mata
          </div>
        </div>
      </div>

      {/* CHAVEAMENTO — scroll horizontal, fases lado a lado */}
      <div style={{
        flex: 1,
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '16px 0',
        display: 'flex',
      }}>
        <div style={{ display: 'flex', gap: '20px', padding: '0 16px' }}>
          {FASES.map((fase, faseIdx) => (
            <div key={fase.nome} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

              {/* Título da fase */}
              <div style={{
                fontSize: '11px', fontWeight: '700', color: '#1C1C1C',
                letterSpacing: '0.5px', marginBottom: '12px',
                paddingLeft: '4px',
              }}>
                {fase.nome.toUpperCase()}
              </div>

              {/* Confrontos da fase, espaçados verticalmente conforme a fase avança */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: faseIdx === 0 ? '12px' : faseIdx === 1 ? '36px' : faseIdx === 2 ? '84px' : '0',
                justifyContent: 'center',
                flex: 1,
              }}>
                {fase.confrontos.map(confronto => (
                  <CardConfronto key={confronto.id} confronto={confronto} navigate={navigate} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LEGENDA / DICA DE SCROLL */}
      <div style={{
        padding: '10px 16px 14px',
        background: '#fff',
        borderTop: '1px solid #E5E7EB',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '11px', fontWeight: '400', color: '#9CA3AF' }}>
          ← Arraste para ver as próximas fases →
        </span>
      </div>

    </div>
  )
}