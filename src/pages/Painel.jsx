// src/pages/Painel.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

import mascoteBusto from '../assets/busto_joia.png'
import iconCoin from '../assets/icons/icon-coin.png'

import iconHomeCinza from '../assets/icons/home_cinza.png'
import iconHomeLaranja from '../assets/icons/home_laranja.png'
import iconBalaoCinza from '../assets/icons/balao_cinza.png'
import iconBalaoLaranja from '../assets/icons/balao_laranja.png'
import iconBolaCinza from '../assets/icons/bola_cinza.png'
import iconTrofeuCinza from '../assets/icons/trofeu_cinza.png'
import iconTrofeuLaranja from '../assets/icons/trofeu_laranja.png'
import iconPerfilCinza from '../assets/icons/perfil_cinza.png'
import iconPerfilLaranja from '../assets/icons/perfil_laranja.png'

import iconAmigos from '../assets/icons/amigos.png'
import iconElenco from '../assets/icons/elenco.png'
import iconMercadoCarrinho from '../assets/icons/mercadocarrinho.png'
import iconTaca from '../assets/taça.png'

import iconNivelIniciante from '../assets/icons/iniciante.png'
import iconNivelAmador from '../assets/icons/amador.png'
import iconNivelPromissor from '../assets/icons/promissor.png'
import iconNivelPro from '../assets/icons/pro.png'
import iconNivelElite from '../assets/icons/elite.png'
import iconNivelSuperTreinador from '../assets/icons/supertreinador.png'
import iconNivelLenda from '../assets/icons/lenda.png'

const ICONES_NIVEL = {
  'Iniciante': iconNivelIniciante,
  'Amador': iconNivelAmador,
  'Promissor': iconNivelPromissor,
  'Pro': iconNivelPro,
  'Elite': iconNivelElite,
  'Super Treinador': iconNivelSuperTreinador,
  'Lenda da Plataforma': iconNivelLenda,
}

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 64, contorno = '#1C1C1C' }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor1}/>
    <path d="M32 2V70C48 66 60 54 60 38V14L32 2Z" fill={cor2}/>
    <line x1="32" y1="2" x2="32" y2="70" stroke={contorno} strokeWidth="2"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke={contorno} strokeWidth="3" fill="none"/>
  </svg>
)

const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#9CA3AF" strokeWidth="2"/>
    <path d="M3 10H21M8 2V6M16 2V6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M9 6L15 12L9 18" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

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
        <img src={ativo ? item.iconActive : item.iconNormal} alt={item.label} style={{ width: '44px', height: '44px' }} />
        {badge && (
          <span style={{
            position: 'absolute', top: '0px', right: '2px',
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#EF4444', border: '1.5px solid #fff',
          }} />
        )}
      </div>
      <span style={{ fontSize: '10px', fontWeight: ativo ? '700' : '400', color: ativo ? '#F97316' : '#6B7280', fontFamily: "'Inter', sans-serif" }}>
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
        <img src={iconBolaCinza} alt="Jogar" style={{ width: '52px', height: '52px', filter: ativo ? 'brightness(0) invert(1)' : 'none' }} />
      </div>
      <span style={{ fontSize: '10px', fontWeight: ativo ? '700' : '400', color: ativo ? '#F97316' : '#6B7280', fontFamily: "'Inter', sans-serif" }}>
        Jogar
      </span>
    </button>
  )
}

const POLL_NOTIFICACOES_MS = 15000

export default function Painel() {
  const navigate = useNavigate()
  const path = '/painel'

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [meuClube, setMeuClube] = useState(null)
  const [moedas, setMoedas] = useState(0)
  const [nivel, setNivel] = useState('Iniciante')
  const [torneio, setTorneio] = useState(null)
  const [naoLidas, setNaoLidas] = useState(0)

  const pollNotificacoesRef = useRef(null)

  const buscarNaoLidas = useCallback(async () => {
    try {
      const resultado = await apiFetch('/api/notificacoes')
      const lista = resultado?.notificacoes || []
      setNaoLidas(lista.filter(n => !n.lida).length)
    } catch {
      // Badge de notificação não é crítico — se falhar, só não atualiza
      // agora, o próximo polling tenta de novo.
    }
  }, [])

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      try {
        const [tecnicoData, competicaoData] = await Promise.all([
          apiFetch('/api/tecnicos/me', { method: 'GET' }),
          apiFetch('/api/competicao/atual', { method: 'GET' }),
        ])
        if (cancelado) return

        const clube = tecnicoData?.tecnico?.clube_proprio
        if (clube) {
          setMeuClube({
            nome: clube.nome,
            cor1: clube.cor_primaria ?? '#F97316',
            cor2: clube.cor_secundaria ?? '#1C1C1C',
          })
          setMoedas(clube.moedas ?? 0)
        }
        setNivel(tecnicoData?.tecnico?.nivel_titulo ?? 'Iniciante')
        setTorneio(competicaoData?.competicao ?? null)
        setCarregando(false)
      } catch (e) {
        if (cancelado) return
        setErro(e.message || 'Não foi possível carregar o painel.')
        setCarregando(false)
      }
    }

    carregar()
    return () => { cancelado = true }
  }, [])

  useEffect(() => {
    buscarNaoLidas()
    pollNotificacoesRef.current = setInterval(buscarNaoLidas, POLL_NOTIFICACOES_MS)
    return () => clearInterval(pollNotificacoesRef.current)
  }, [buscarNaoLidas])

  const ATALHOS = [
    { label: 'ELENCO',  sub: 'Escale seu time',  icon: iconElenco,        path: '/elenco',  iconSize: 56 },
    { label: 'AMIGOS',  sub: 'Desafie a galera', icon: iconAmigos,        path: '/amigos',  iconSize: 56 },
    { label: 'MERCADO', sub: 'Compre e venda',   icon: iconMercadoCarrinho, path: '/mercado', iconSize: 84 },
  ]

  if (carregando) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: '#fff', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#9CA3AF' }}>Carregando painel...</span>
      </div>
    )
  }

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

      {/* HEADER — fixo */}
      <div style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #E5E7EB',
        background: '#fff',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <EscudoTime cor1={meuClube?.cor1} cor2={meuClube?.cor2} size={42} contorno="#1C1C1C" />
          <div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C', lineHeight: '1.2' }}>
              {meuClube?.nome}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <img src={ICONES_NIVEL[nivel] || iconNivelIniciante} alt={nivel} style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>{nivel}</span>
            </div>
          </div>
        </div>

        <div style={{
          border: '1.5px solid #FDE3CC',
          borderRadius: '10px',
          padding: '6px 12px',
          background: '#FFF7ED',
          minWidth: '100px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <img src={iconCoin} alt="moedas" style={{ width: '20px', height: '20px' }} />
            <span style={{ fontSize: '17px', fontWeight: '700', color: '#1C1C1C', lineHeight: 1 }}>
              {moedas.toLocaleString('pt-BR')}
            </span>
          </div>
          <div style={{ fontSize: '10px', fontWeight: '400', color: '#9A6B3F', marginTop: '2px', textAlign: 'center' }}>
            moedas
          </div>
        </div>
      </div>

      {/* MIOLO — flex:1, rola se precisar, empurra o rodapé pra baixo
          sempre coladinho, sem vão morto. */}
      <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>

        {erro && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '8px 12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={mascoteBusto} alt="Seu Mister" style={{ width: '52px', height: '52px', objectFit: 'contain', flexShrink: 0 }} />
          <div style={{
            border: '2px solid #1C1C1C', borderRadius: '12px',
            padding: '8px 12px', fontSize: '12px', fontWeight: '500',
            color: '#1C1C1C', flex: 1, lineHeight: '15px',
          }}>
            {torneio
              ? 'O torneio tá rolando. Bora pra próxima rodada!'
              : 'Nenhum torneio ativo agora. Bora entrar em campo?'}
          </div>
        </div>

        <div style={{
          background: '#1C1C1C', borderRadius: '16px', padding: '16px',
          backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(249,115,22,0.25), transparent 60%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src={iconTaca} alt="troféu" style={{ width: '18px', height: '18px' }} />
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#F97316', letterSpacing: '1.5px' }}>
                MODO CARREIRA
              </span>
            </div>
            {torneio && (
              <span style={{
                fontSize: '10px', fontWeight: '700', color: '#10B981',
                background: 'rgba(16,185,129,0.15)', padding: '3px 9px', borderRadius: '20px',
              }}>
                EM ANDAMENTO
              </span>
            )}
          </div>

          {torneio ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <EscudoTime cor1={meuClube?.cor1} cor2={meuClube?.cor2} size={40} contorno="white" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: '#fff' }}>
                    {torneio.modo === 'avancado' ? 'Carreira Avançada' : 'Carreira Normal'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <IconCalendar />
                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#9CA3AF' }}>
                      Fase: {torneio.fase_atual ?? 'grupos'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/torneio-carreira')} style={{
                width: '100%', background: '#F97316', color: '#fff',
                border: 'none', borderRadius: '10px', padding: '11px',
                fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}>
                VER TORNEIO
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#D1D5DB', marginBottom: '14px', lineHeight: '19px' }}>
                Você ainda não está disputando nenhum torneio. Entre na Carreira Normal ou Avançada e mostre seu trabalho.
              </div>
              <button onClick={() => navigate('/modo-carreira')} style={{
                width: '100%', background: '#F97316', color: '#fff',
                border: 'none', borderRadius: '10px', padding: '11px',
                fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}>
                ENTRAR NO MODO CARREIRA
              </button>
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ATALHOS.map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                background: '#fff',
                border: '1.5px solid #E5E7EB',
                borderRadius: '14px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                textAlign: 'left',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#F97316'
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E5E7EB'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                width: `${item.iconSize}px`, height: `${item.iconSize}px`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <img src={item.icon} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#1C1C1C' }}>{item.label}</div>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#6B7280' }}>{item.sub}</div>
              </div>
              <IconChevron />
            </button>
          ))}
        </div>

      </div>

      {/* BOTTOM NAV */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
        padding: '8px 0 10px', borderTop: '1px solid #E5E7EB', background: 'white',
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