// src/pages/PainelTimeOficial.jsx
import { useNavigate } from 'react-router-dom'

import iconCoin from '../assets/icons/icon-coin.png'
import iconHome from '../assets/icons/icon-home.png'
import iconHomeOrange from '../assets/icons/icon-home-orange.png'
import iconSquad from '../assets/icons/icon-squad.png'
import iconBall from '../assets/icons/icon-ball.png'
import iconTrophy from '../assets/icons/icon-trophy.png'
import iconTrophyOrange from '../assets/icons/icon-trophy-orange.png'
import iconUser from '../assets/icons/icon-user.png'
import iconUserOrange from '../assets/icons/icon-profile-orange.png'
import iconEmail from '../assets/icons/icon-email.png'
import iconCart from '../assets/icons/icon-cart.png'
import iconFriends from '../assets/icons/icon-friends.png'
import iconFire from '../assets/icons/icon-fire.png'

// ─── COMPONENTES SVG ────────────────────────────────────────────────────────

const EscudoOficial = ({ cor = '#EF4444', size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor} stroke="#1C1C1C" strokeWidth="3"/>
    <circle cx="32" cy="36" r="13" fill="#fff" />
    <path d="M32 26L38 32V40L32 46L26 40V32L32 26Z" fill={cor} />
  </svg>
)

const EscudoAdversario = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill="#3B82F6"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke="white" strokeWidth="3" fill="none"/>
    <circle cx="32" cy="37" r="14" fill="white"/>
    <circle cx="32" cy="37" r="5" fill="#1C1C1C"/>
    <path d="M32 23L32 31M32 43L32 51M18 37L26 37M38 37L46 37" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#9CA3AF" strokeWidth="2"/>
    <path d="M3 10H21M8 2V6M16 2V6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

const NAV_ITEMS_ESQUERDA = [
  { iconNormal: iconHome,  iconActive: iconHomeOrange, label: 'Início',    path: '/time-oficial', isFilter: false, hasBadge: false },
  { iconNormal: iconEmail, iconActive: iconEmail,       label: 'Vestiário', path: '/vestiario',    isFilter: true,  hasBadge: true  },
]

const NAV_ITEMS_DIREITA = [
  { iconNormal: iconTrophy, iconActive: iconTrophyOrange, label: 'Liga',   path: '/liga-privada', isFilter: false, hasBadge: false },
  { iconNormal: iconUser,   iconActive: iconUserOrange,   label: 'Perfil', path: '/perfil',       isFilter: false, hasBadge: false },
]

const TEM_NOTIFICACAO_NAO_LIDA = true

function NavButton({ item, ativo, navigate }) {
  return (
    <button onClick={() => navigate(item.path)} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '4px', background: 'transparent', border: 'none',
      cursor: 'pointer', padding: '0 6px', position: 'relative',
    }}>
      <div style={{ position: 'relative' }}>
        <img
          src={ativo ? item.iconActive : item.iconNormal}
          alt={item.label}
          style={{
            width: '30px', height: '30px',
            filter: item.isFilter && ativo
              ? 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(0deg) brightness(104%) contrast(97%)'
              : 'none',
          }}
        />
        {item.hasBadge && TEM_NOTIFICACAO_NAO_LIDA && (
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#EF4444', border: '1.5px solid #fff',
          }} />
        )}
      </div>
      <span style={{
        fontSize: '10px',
        fontWeight: ativo ? '700' : '400',
        color: ativo ? '#F97316' : '#6B7280',
        fontFamily: "'Inter', sans-serif",
      }}>
        {item.label}
      </span>
    </button>
  )
}

function BotaoJogar({ ativo, navigate }) {
  return (
    <button
      onClick={() => navigate('/jogar')}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '4px', background: 'transparent', border: 'none',
        cursor: 'pointer', padding: 0,
        transform: 'translateY(-14px)',
      }}
    >
      <div style={{
        width: '58px', height: '58px', borderRadius: '50%',
        background: ativo ? '#F97316' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: ativo ? '0 4px 12px rgba(249,115,22,0.45)' : '0 2px 8px rgba(0,0,0,0.12)',
        border: ativo ? '4px solid #fff' : '2px solid #E5E7EB',
      }}>
        <img src={iconBall} alt="Jogar" style={{ width: '28px', height: '28px', filter: ativo ? 'brightness(0) invert(1)' : 'none' }} />
      </div>
      <span style={{ fontSize: '10px', fontWeight: ativo ? '700' : '400', color: ativo ? '#F97316' : '#6B7280', fontFamily: "'Inter', sans-serif" }}>
        Jogar
      </span>
    </button>
  )
}

// ─── DADOS MOCKADOS — TIME OFICIAL ─────────────────────────────────────────────
// Mesma estrutura do Painel.jsx, mas os dados refletem o time oficial assumido.
// "Tudo OK" — sem alerta de cargo em risco nesta versão mockada.

const TIME_OFICIAL = {
  nome: 'Flamengo',
  nivel: 'Time Oficial',
  moedas: 2400, // orçamento do time oficial, não as moedas pessoais do técnico
  cor: '#EF4444',
}

const PROXIMO_JOGO = {
  liga: 'Série A',
  rodada: 12,
  adversario: 'Tigres FC',
  data: 'Domingo, 26/05',
  hora: '18:00',
}

const DESTAQUE_SEMANA = {
  nome: 'Pedro',
  posicao: 'ATA',
  overall: 88,
  motivo: 'Em grande fase: 4 gols nas últimas 2 partidas',
}

export default function PainelTimeOficial() {
  const navigate = useNavigate()
  const path = '/time-oficial'

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#FFFFFF',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* HEADER */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #E5E7EB',
        background: '#fff',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <EscudoOficial cor={TIME_OFICIAL.cor} size={42} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C', lineHeight: '1.2' }}>
                {TIME_OFICIAL.nome}
              </span>
              <span style={{
                fontSize: '9px', fontWeight: '700', color: '#fff',
                background: '#1C1C1C', padding: '2px 6px', borderRadius: '5px',
                letterSpacing: '0.3px',
              }}>
                TIME OFICIAL
              </span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '400', color: '#6B7280', marginTop: '2px' }}>
              {TIME_OFICIAL.nivel}
            </div>
          </div>
        </div>

        <div style={{
          border: '1.5px solid #E5E7EB',
          borderRadius: '10px',
          padding: '6px 12px',
          background: '#fff',
          minWidth: '100px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <img src={iconCoin} alt="moedas" style={{ width: '20px', height: '20px' }} />
            <span style={{ fontSize: '17px', fontWeight: '700', color: '#1C1C1C', lineHeight: 1 }}>
              {TIME_OFICIAL.moedas.toLocaleString('pt-BR')}
            </span>
          </div>
          <div style={{ fontSize: '10px', fontWeight: '400', color: '#6B7280', marginTop: '2px', textAlign: 'center' }}>
            orçamento
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>

        {/* CARD PRÓXIMO JOGO */}
        <div style={{ background: '#1C1C1C', borderRadius: '14px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#F97316', letterSpacing: '1.5px' }}>
              PRÓXIMO JOGO
            </span>
            <span style={{ fontSize: '11px', fontWeight: '400', color: '#9CA3AF' }}>
              {PROXIMO_JOGO.liga} • R{PROXIMO_JOGO.rodada}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
              <EscudoOficial cor={TIME_OFICIAL.cor} size={44} />
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#fff', textAlign: 'center' }}>
                {TIME_OFICIAL.nome.toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#fff', paddingBottom: '16px' }}>VS</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
              <EscudoAdversario size={44} />
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#fff', textAlign: 'center' }}>
                {PROXIMO_JOGO.adversario.toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '10px' }}>
            <IconCalendar />
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#9CA3AF' }}>
              {PROXIMO_JOGO.data} • {PROXIMO_JOGO.hora}
            </span>
          </div>

          <button onClick={() => navigate('/partida')} style={{
            width: '100%', background: '#F97316', color: '#fff',
            border: 'none', borderRadius: '8px', padding: '10px',
            fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}>
            IR PARA A PARTIDA
          </button>
        </div>

        {/* JOGADOR EM DESTAQUE DA SEMANA */}
        <div style={{
          background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '12px',
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <img src={iconFire} alt="destaque" style={{ width: '24px', height: '24px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#F97316', letterSpacing: '0.5px' }}>
              DESTAQUE DA SEMANA
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C', marginTop: '1px' }}>
              {DESTAQUE_SEMANA.nome} <span style={{ color: '#6B7280', fontWeight: '400' }}>({DESTAQUE_SEMANA.posicao} • {DESTAQUE_SEMANA.overall})</span>
            </div>
          </div>
        </div>

        {/* ELENCO + AMIGOS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'ELENCO', icon: iconSquad,   path: '/elenco' },
            { label: 'AMIGOS', icon: iconFriends, path: '/amigos' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)} style={{
              background: '#fff',
              border: '1.5px solid #E5E7EB',
              borderRadius: '12px',
              padding: '10px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#F97316'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
            >
              <img src={item.icon} alt={item.label} style={{ width: '24px', height: '24px' }} />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1C' }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* MERCADO */}
        <button
          onClick={() => navigate('/mercado')}
          style={{
            background: '#fff',
            border: '1.5px solid #E5E7EB',
            borderRadius: '14px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#F97316'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={iconCart} alt="mercado" style={{ width: '40px', height: '40px' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#1C1C1C' }}>MERCADO</div>
              <div style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280' }}>
                Compre e venda jogadores
              </div>
            </div>
          </div>
          <span style={{ fontSize: '18px', color: '#9CA3AF' }}>›</span>
        </button>

      </div>

      {/* BOTTOM NAV */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
        padding: '8px 0 10px', borderTop: '1px solid #E5E7EB', background: 'white',
        flexShrink: 0,
      }}>
        {NAV_ITEMS_ESQUERDA.map(item => (
          <NavButton key={item.label} item={item} ativo={item.path === path} navigate={navigate} />
        ))}
        <BotaoJogar ativo={path === '/jogar'} navigate={navigate} />
        {NAV_ITEMS_DIREITA.map(item => (
          <NavButton key={item.label} item={item} ativo={item.path === path} navigate={navigate} />
        ))}
      </div>

    </div>
  )
}