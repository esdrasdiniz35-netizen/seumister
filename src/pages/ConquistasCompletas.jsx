// src/pages/ConquistasCompletas.jsx
import { useNavigate } from 'react-router-dom'

// ─── DADOS MOCKADOS ────────────────────────────────────────────────────────────

const CATEGORIAS = [
  {
    nome: 'Ligas',
    conquistas: [
      { emoji: '🏆', titulo: 'Campeão Divisão 2', descricao: 'Termine em 1º lugar na Divisão 2', desbloqueada: true, data: '12/03/2025' },
      { emoji: '🥈', titulo: 'Vice na Divisão 1', descricao: 'Termine em 2º lugar na Divisão 1', desbloqueada: false },
      { emoji: '🛡️', titulo: 'Invicto', descricao: 'Termine uma temporada sem perder', desbloqueada: true, data: '28/02/2025' },
      { emoji: '👑', titulo: 'Pentacampeão', descricao: 'Conquiste 5 títulos de liga', desbloqueada: false },
    ],
  },
  {
    nome: 'Copas',
    conquistas: [
      { emoji: '⚡', titulo: 'Raio Dourado', descricao: 'Vença uma Copa Relâmpago', desbloqueada: false },
      { emoji: '🎯', titulo: 'Artilheiro da Copa', descricao: 'Marque 10 gols em uma única Copa Relâmpago', desbloqueada: false },
    ],
  },
  {
    nome: 'Recordes',
    conquistas: [
      { emoji: '🔥', titulo: '5 vitórias seguidas', descricao: 'Vença 5 partidas consecutivas', desbloqueada: true, data: '02/04/2025' },
      { emoji: '💥', titulo: 'Goleada histórica', descricao: 'Vença uma partida por 6 gols de diferença ou mais', desbloqueada: false },
      { emoji: '🧱', titulo: 'Muralha', descricao: 'Termine uma temporada sem sofrer mais de 10 gols', desbloqueada: false },
    ],
  },
  {
    nome: 'Carreira',
    conquistas: [
      { emoji: '⭐', titulo: '???', descricao: 'Continue jogando para descobrir', desbloqueada: false },
      { emoji: '🌟', titulo: 'Lenda da Plataforma', descricao: 'Alcance o nível máximo de título', desbloqueada: false },
      { emoji: '🤝', titulo: 'Primeiro amigo', descricao: 'Adicione seu primeiro amigo na plataforma', desbloqueada: true, data: '18/02/2025' },
    ],
  },
]

const TOTAL_DESBLOQUEADAS = CATEGORIAS.reduce(
  (acc, cat) => acc + cat.conquistas.filter(c => c.desbloqueada).length, 0
)
const TOTAL_CONQUISTAS = CATEGORIAS.reduce((acc, cat) => acc + cat.conquistas.length, 0)

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function ConquistasCompletas() {
  const navigate = useNavigate()

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#F5F5F5',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* HEADER */}
      <div style={{
        padding: '14px 16px',
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/perfil')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#1C1C1C', padding: '4px', lineHeight: 1 }}
          >
            ‹
          </button>
          <span style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C' }}>Conquistas</span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#F97316' }}>
          {TOTAL_DESBLOQUEADAS} / {TOTAL_CONQUISTAS}
        </span>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {CATEGORIAS.map((categoria, catIdx) => (
          <div key={categoria.nome} style={{ marginBottom: catIdx < CATEGORIAS.length - 1 ? '20px' : 0 }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C', letterSpacing: '0.5px' }}>
                {categoria.nome.toUpperCase()}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#9CA3AF' }}>
                {categoria.conquistas.filter(c => c.desbloqueada).length}/{categoria.conquistas.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categoria.conquistas.map((c, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid #E5E7EB',
                    opacity: c.desbloqueada ? 1 : 0.6,
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: c.desbloqueada ? '#FFF7ED' : '#F5F5F5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: '20px',
                    filter: c.desbloqueada ? 'none' : 'grayscale(1)',
                  }}>
                    {c.emoji}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C' }}>
                      {c.titulo}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280', marginTop: '1px', lineHeight: '1.4' }}>
                      {c.descricao}
                    </div>
                    {c.desbloqueada && c.data && (
                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#10B981', marginTop: '4px' }}>
                        ✓ Desbloqueada em {c.data}
                      </div>
                    )}
                  </div>

                  {!c.desbloqueada && (
                    <span style={{ fontSize: '16px', color: '#D1D5DB', flexShrink: 0 }}>🔒</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>

    </div>
  )
}