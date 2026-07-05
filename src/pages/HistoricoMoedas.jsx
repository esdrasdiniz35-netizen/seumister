// src/pages/HistoricoMoedas.jsx
import { useNavigate } from 'react-router-dom'

import iconCoin from '../assets/icons/icon-coin.png'

// ─── DADOS MOCKADOS ────────────────────────────────────────────────────────────
// Histórico acumulado na carreira — nunca zera, mesmo no reset mensal.

const TOTAL_CARREIRA = 18420

const EVOLUCAO_MENSAL = [
  { mes: 'Jan', acumulado: 4200 },
  { mes: 'Fev', acumulado: 6800 },
  { mes: 'Mar', acumulado: 9100 },
  { mes: 'Abr', acumulado: 13600 },
  { mes: 'Mai', acumulado: 18420 },
]

const MOVIMENTACOES = [
  { id: 1, data: 'Hoje, 16:42', descricao: 'Vitória online vs Tigres FC', valor: 5,    tipo: 'ganho' },
  { id: 2, data: 'Hoje, 14:10', descricao: 'Proposta da máquina por De Bruyne', valor: 340,  tipo: 'ganho' },
  { id: 3, data: 'Ontem, 20:05', descricao: 'Compra de jogador no Mercado', valor: -180, tipo: 'gasto' },
  { id: 4, data: 'Ontem, 19:30', descricao: 'Vitória online vs Pantera SC', valor: 5,    tipo: 'ganho' },
  { id: 5, data: '15/05, 21:00', descricao: 'Empate vs máquina', valor: 1,    tipo: 'ganho' },
  { id: 6, data: '14/05, 18:22', descricao: 'Aposta vencida (Busca Apostada)', valor: 10,   tipo: 'ganho' },
  { id: 7, data: '13/05, 17:00', descricao: 'Salário semanal do elenco', valor: -85,  tipo: 'gasto' },
  { id: 8, data: '12/05, 19:15', descricao: 'Vitória online vs Cobra FC', valor: 5,    tipo: 'ganho' },
]

// ─── GRÁFICO SIMPLES EM SVG ─────────────────────────────────────────────────

function GraficoEvolucao({ dados }) {
  const largura = 320
  const altura = 100
  const padding = 10

  const maxValor = Math.max(...dados.map(d => d.acumulado))
  const minValor = 0

  const pontos = dados.map((d, i) => {
    const x = padding + (i / (dados.length - 1)) * (largura - padding * 2)
    const y = altura - padding - ((d.acumulado - minValor) / (maxValor - minValor)) * (altura - padding * 2)
    return { x, y, valor: d.acumulado, mes: d.mes }
  })

  const linhaPath = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linhaPath} L ${pontos[pontos.length - 1].x} ${altura} L ${pontos[0].x} ${altura} Z`

  return (
    <svg width="100%" height={altura + 24} viewBox={`0 0 ${largura} ${altura + 24}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="gradMoedas" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill="url(#gradMoedas)" />
      <path d={linhaPath} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {pontos.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#F97316" stroke="#fff" strokeWidth="1.5" />
      ))}

      {pontos.map((p, i) => (
        <text key={i} x={p.x} y={altura + 18} textAnchor="middle" fontSize="9" fontWeight="500" fill="#9CA3AF" fontFamily="Inter, sans-serif">
          {p.mes}
        </text>
      ))}
    </svg>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function HistoricoMoedas() {
  const navigate = useNavigate()

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
          onClick={() => navigate('/perfil')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#1C1C1C', padding: '4px', lineHeight: 1 }}
        >
          ‹
        </button>
        <span style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C' }}>Histórico de Moedas</span>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* TOTAL ACUMULADO */}
        <div style={{
          background: '#1C1C1C', borderRadius: '14px', padding: '18px 16px',
          marginBottom: '14px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '1px', marginBottom: '6px' }}>
            TOTAL ACUMULADO NA CARREIRA
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <img src={iconCoin} alt="moedas" style={{ width: '26px', height: '26px' }} />
            <span style={{ fontSize: '30px', fontWeight: '900', color: '#fff' }}>
              {TOTAL_CARREIRA.toLocaleString('pt-BR')}
            </span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: '400', color: '#9CA3AF', marginTop: '6px' }}>
            Esse valor nunca zera, mesmo no reset mensal
          </div>
        </div>

        {/* GRÁFICO DE EVOLUÇÃO */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', marginBottom: '14px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C', marginBottom: '8px' }}>
            EVOLUÇÃO NA TEMPORADA
          </div>
          <GraficoEvolucao dados={EVOLUCAO_MENSAL} />
        </div>

        {/* LISTA DE MOVIMENTAÇÕES */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C', marginBottom: '10px' }}>
            MOVIMENTAÇÕES RECENTES
          </div>

          {MOVIMENTACOES.map((mov, i) => (
            <div
              key={mov.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < MOVIMENTACOES.length - 1 ? '1px solid #F5F5F5' : 'none',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1C1C1C' }}>
                  {mov.descricao}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '400', color: '#9CA3AF', marginTop: '1px' }}>
                  {mov.data}
                </div>
              </div>
              <span style={{
                fontSize: '14px', fontWeight: '700',
                color: mov.tipo === 'ganho' ? '#10B981' : '#EF4444',
                flexShrink: 0, marginLeft: '12px',
              }}>
                {mov.tipo === 'ganho' ? '+' : ''}{mov.valor}
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}