// src/pages/Jogar.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

import iconHomeCinza from '../assets/icons/home_cinza.png'
import iconHomeLaranja from '../assets/icons/home_laranja.png'
import iconBalaoCinza from '../assets/icons/balao_cinza.png'
import iconBalaoLaranja from '../assets/icons/balao_laranja.png'
import iconBolaCinza from '../assets/icons/bola_cinza.png'
import iconTrofeuCinza from '../assets/icons/trofeu_cinza.png'
import iconTrofeuLaranja from '../assets/icons/trofeu_laranja.png'
import iconPerfilCinza from '../assets/icons/perfil_cinza.png'
import iconPerfilLaranja from '../assets/icons/perfil_laranja.png'

import iconCoin from '../assets/icons/icon-coin.png'
import iconFriends from '../assets/icons/amigos.png'
import iconLightning from '../assets/icons/raio.png'
import iconTaca from '../assets/taça.png'
import iconBolaLaranja from '../assets/icons/bola_laranja.png'

const POLL_NOTIFICACOES_MS = 15000

const NAV_ITEMS_ESQUERDA = [
  { iconNormal: iconHomeCinza,  iconActive: iconHomeLaranja,  label: 'Início',    path: '/painel' },
  { iconNormal: iconBalaoCinza, iconActive: iconBalaoLaranja, label: 'Vestiário', path: '/vestiario' },
]

const NAV_ITEMS_DIREITA = [
  { iconNormal: iconTrofeuCinza, iconActive: iconTrofeuLaranja, label: 'Liga',   path: '/liga-privada' },
  { iconNormal: iconPerfilCinza, iconActive: iconPerfilLaranja, label: 'Perfil', path: '/perfil' },
]

function NavButton({ item, ativo, badge, navigate }) {
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
          style={{ width: '24px', height: '24px' }}
        />
        {badge && (
          <span style={{
            position: 'absolute', top: '0px', right: '2px',
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#EF4444', border: '1.5px solid #fff',
          }} />
        )}
      </div>
      <span style={{
        fontSize: '8px',
        fontWeight: ativo ? '700' : '400',
        color: ativo ? '#F97316' : '#6B7280',
        fontFamily: "'Inter', sans-serif",
      }}>
        {item.label}
      </span>
    </button>
  )
}

// Botão Jogar (FAB) — muda de aparência conforme está ativo ou não
function BotaoJogar({ ativo, navigate }) {
  return (
    <button
      onClick={() => navigate('/jogar')}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '4px', background: 'transparent', border: 'none',
        cursor: 'pointer', padding: 0, position: 'relative',
        transform: 'translateY(-14px)',
      }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: ativo
          ? '0 4px 12px rgba(249, 115, 22, 0.45)'
          : '0 2px 8px rgba(0, 0, 0, 0.12)',
        border: ativo ? '3px solid #F97316' : '2px solid #E5E7EB',
      }}>
        <img
          src={ativo ? iconBolaLaranja : iconBolaCinza}
          alt="Jogar"
          style={{ width: '26px', height: '26px' }}
        />
      </div>
      <span style={{
        fontSize: '8px',
        fontWeight: ativo ? '700' : '400',
        color: ativo ? '#F97316' : '#6B7280',
        fontFamily: "'Inter', sans-serif",
      }}>
        Jogar
      </span>
    </button>
  )
}

export default function Jogar() {
  const navigate = useNavigate()
  const path = '/jogar'

  const [naoLidas, setNaoLidas] = useState(0)
  const pollNotificacoesRef = useRef(null)

  const buscarNaoLidas = useCallback(async () => {
    try {
      const resultado = await apiFetch('/api/notificacoes')
      const lista = resultado?.notificacoes || []
      setNaoLidas(lista.filter(n => !n.lida).length)
    } catch {
      // Badge não é crítico — se falhar, tenta de novo no próximo polling.
    }
  }, [])

  useEffect(() => {
    buscarNaoLidas()
    pollNotificacoesRef.current = setInterval(buscarNaoLidas, POLL_NOTIFICACOES_MS)
    return () => clearInterval(pollNotificacoesRef.current)
  }, [buscarNaoLidas])

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
        padding: '14px 16px 10px',
        borderBottom: '1px solid #E5E7EB',
        background: '#fff',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '18px', fontWeight: '900', color: '#1C1C1C' }}>JOGAR</div>
        <div style={{ fontSize: '12px', fontWeight: '400', color: '#6B7280', marginTop: '1px' }}>
          Escolha como quer entrar em campo
        </div>
      </div>

      {/* CONTEÚDO — compactado pra caber sem scroll */}
      <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>

        {/* SEÇÃO ONLINE */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '1px', marginBottom: '8px' }}>
            ONLINE
          </div>

          <button
            onClick={() => navigate('/buscando-partida')}
            style={{
              width: '100%', background: '#F97316', border: 'none', borderRadius: '14px',
              padding: '14px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={iconBolaLaranja} alt="buscar" style={{ width: '32px', height: '32px' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }}>BUSCAR PARTIDA</div>
                <div style={{ fontSize: '11px', fontWeight: '400', color: '#FFEDD5' }}>Adversário do seu nível</div>
              </div>
            </div>
            <span style={{ fontSize: '18px', color: '#fff' }}>›</span>
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => navigate('/busca-apostada')}
              style={{
                background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '12px',
                padding: '10px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}
            >
              <img src={iconCoin} alt="apostada" style={{ width: '24px', height: '24px' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1C', textAlign: 'center' }}>
                APOSTADA
              </span>
            </button>

            <button
              onClick={() => navigate('/amigos')}
              style={{
                background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '12px',
                padding: '10px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}
            >
              <img src={iconFriends} alt="amigo" style={{ width: '24px', height: '24px' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#1C1C1C', textAlign: 'center' }}>
                COM AMIGO
              </span>
            </button>
          </div>
        </div>

        {/* SEÇÃO COMPETIÇÕES ONLINE */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '1px', marginBottom: '8px' }}>
            COMPETIÇÕES ONLINE
          </div>

          <button
            onClick={() => navigate('/liga-privada')}
            style={{
              width: '100%', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '12px',
              padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={iconTrofeuLaranja} alt="liga" style={{ width: '32px', height: '32px' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C' }}>Ligas</div>
                <div style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280' }}>Crie ou entre em ligas com amigos</div>
              </div>
            </div>
            <span style={{ fontSize: '16px', color: '#9CA3AF' }}>›</span>
          </button>

          <button
            onClick={() => navigate('/copa-relampago')}
            style={{
              width: '100%', background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: '12px',
              padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={iconLightning} alt="copa relâmpago" style={{ width: '24px', height: '24px' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C' }}>Copa Relâmpago</div>
                <div style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280' }}>Toda sexta · até 100 jogadores</div>
              </div>
            </div>
            <span style={{ fontSize: '16px', color: '#9CA3AF' }}>›</span>
          </button>
        </div>

        {/* SEÇÃO MODO CARREIRA */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', letterSpacing: '1px', marginBottom: '8px' }}>
            MODO CARREIRA
          </div>

          <button
            onClick={() => navigate('/modo-carreira')}
            style={{
              width: '100%', background: '#1C1C1C', border: 'none', borderRadius: '14px',
              padding: '14px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <img src={iconTaca} alt="carreira" style={{ width: '38px', height: '38px' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }}>MODO CARREIRA</div>
                <div style={{ fontSize: '11px', fontWeight: '400', color: '#9CA3AF' }}>
                  Brasileiro, Libertadores, Champions
                </div>
              </div>
            </div>
            <span style={{ fontSize: '18px', color: '#fff' }}>›</span>
          </button>
        </div>

      </div>

      {/* BOTTOM NAV — Jogar em destaque no centro, ativo só nesta tela */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
        padding: '4px 0 5px', borderTop: '1px solid #E5E7EB', background: 'white',
        flexShrink: 0,
      }}>
        {NAV_ITEMS_ESQUERDA.map(item => (
          <NavButton
            key={item.label}
            item={item}
            ativo={item.path === path}
            badge={item.path === '/vestiario' && naoLidas > 0}
            navigate={navigate}
          />
        ))}

        <BotaoJogar ativo={path === '/jogar'} navigate={navigate} />

        {NAV_ITEMS_DIREITA.map(item => (
          <NavButton key={item.label} item={item} ativo={item.path === path} badge={false} navigate={navigate} />
        ))}
      </div>

    </div>
  )
}