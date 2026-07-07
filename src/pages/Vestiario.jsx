// src/pages/Vestiario.jsx
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
import iconPlanejamento from '../assets/icons/planejamento.png'

const POLL_NOTIFICACOES_MS = 15000

// A tabela `notificacoes` não guarda cor/destaque — isso é decisão de
// exibição, então mora aqui no frontend, indexado por `tipo`. Cada tipo
// novo que a gente for adicionando no backend ganha uma entrada aqui.
const VISUAL_POR_TIPO = {
  convite_partida: { cor: '#F97316', destaque: true, acaoLabel: 'Toque para responder em Amigos' },
}
const VISUAL_PADRAO = { cor: '#6B7280', destaque: false, acaoLabel: null }

// ─── BOTTOM NAV — padrão real do app (igual Painel.jsx / Elenco.jsx / Draft.jsx) ───

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
        <img src={ativo ? item.iconActive : item.iconNormal} alt={item.label} style={{ width: '24px', height: '24px' }} />
        {badge && (
          <span style={{
            position: 'absolute', top: '0px', right: '2px',
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#EF4444', border: '1.5px solid #fff',
          }} />
        )}
      </div>
      <span style={{ fontSize: '8px', fontWeight: ativo ? '700' : '400', color: ativo ? '#F97316' : '#6B7280', fontFamily: "'Inter', sans-serif" }}>
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
        width: '32px', height: '32px', borderRadius: '50%',
        background: ativo ? '#F97316' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: ativo ? '0 4px 12px rgba(249,115,22,0.45)' : '0 2px 8px rgba(0,0,0,0.12)',
        border: ativo ? '4px solid #fff' : '2px solid #E5E7EB',
      }}>
        <img src={iconBolaCinza} alt="Jogar" style={{ width: '28px', height: '28px', filter: ativo ? 'brightness(0) invert(1)' : 'none' }} />
      </div>
      <span style={{ fontSize: '8px', fontWeight: ativo ? '700' : '400', color: ativo ? '#F97316' : '#6B7280', fontFamily: "'Inter', sans-serif" }}>
        Jogar
      </span>
    </button>
  )
}

// ─── FORMATAÇÃO DE TEMPO RELATIVO ──────────────────────────────────────────

function formatarTempoRelativo(createdAt) {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Agora'
  if (diffMin < 60) return `${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffDias = Math.floor(diffH / 24)
  return `${diffDias}d`
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────

export default function Vestiario() {
  const navigate = useNavigate()
  const path = '/vestiario'

  const [notificacoes, setNotificacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const pollRef = useRef(null)

  const buscarNotificacoes = useCallback(async (mostrarLoading) => {
    if (mostrarLoading) setCarregando(true)
    try {
      const resultado = await apiFetch('/api/notificacoes')
      setNotificacoes(resultado.notificacoes || [])
      setErro('')
    } catch (err) {
      setErro(err.message || 'Não foi possível carregar as notificações.')
    } finally {
      if (mostrarLoading) setCarregando(false)
    }
  }, [])

  useEffect(() => {
    buscarNotificacoes(true)
    pollRef.current = setInterval(() => buscarNotificacoes(false), POLL_NOTIFICACOES_MS)
    return () => clearInterval(pollRef.current)
  }, [buscarNotificacoes])

  const naoLidas = notificacoes.filter(n => !n.lida).length

  function estaExpirada(notif) {
    return Boolean(notif.expira_em) && new Date(notif.expira_em).getTime() < Date.now()
  }

  async function handleAbrirNotificacao(notif) {
    // Marca como lida (otimista — já atualiza a tela antes da resposta do backend)
    if (!notif.lida) {
      setNotificacoes(prev => prev.map(n => n.id === notif.id ? { ...n, lida: true } : n))
      apiFetch(`/api/notificacoes/${notif.id}/marcar-lida`, { method: 'PUT' }).catch(() => {
        // Se falhar, o próximo polling corrige o estado sozinho.
      })
    }

    // Convite de partida é o único tipo com ação real hoje — o aceitar/
    // recusar de verdade mora no banner do Amigos.jsx. Se já expirou,
    // não tem pra onde levar.
    if (notif.tipo === 'convite_partida' && !estaExpirada(notif)) {
      navigate('/amigos')
    }
  }

  async function handleMarcarTodasLidas() {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
    try {
      await apiFetch('/api/notificacoes/marcar-todas-lidas', { method: 'PUT' })
    } catch {
      buscarNotificacoes(false)
    }
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

      {/* HEADER */}
      <div style={{
        padding: '14px 16px 10px',
        background: '#1C1C1C',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
              Vestiário
            </div>
            <div style={{ fontSize: '12px', fontWeight: '400', color: '#9CA3AF', marginTop: '2px' }}>
              {naoLidas > 0 ? `${naoLidas} mensagem${naoLidas > 1 ? 's' : ''} não lida${naoLidas > 1 ? 's' : ''}` : 'Tudo em dia'}
            </div>
          </div>
          {naoLidas > 0 && (
            <button
              onClick={handleMarcarTodasLidas}
              style={{
                background: 'transparent', border: '1px solid #4B5563', borderRadius: '99px',
                padding: '5px 12px', fontSize: '11px', fontWeight: '700', color: '#9CA3AF',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}
            >
              Marcar tudo lido
            </button>
          )}
        </div>
      </div>

      {/* LISTA DE NOTIFICAÇÕES */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {carregando && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF', fontSize: '13px' }}>
            Carregando...
          </div>
        )}

        {!carregando && erro && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#EF4444', fontSize: '13px' }}>
            {erro}
          </div>
        )}

        {!carregando && !erro && notificacoes.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            paddingTop: '60px', gap: '8px',
          }}>
            <img src={iconPlanejamento} alt="" style={{ width: '40px', height: '40px', opacity: 0.6 }} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#6B7280' }}>Nada por aqui ainda</span>
            <span style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>
              As novidades do seu time vão aparecer aqui.
            </span>
          </div>
        )}

        {!carregando && !erro && notificacoes.map(notif => {
          const visual = VISUAL_POR_TIPO[notif.tipo] || VISUAL_PADRAO
          const expirada = estaExpirada(notif)

          return (
            <button
              key={notif.id}
              onClick={() => handleAbrirNotificacao(notif)}
              style={{
                background: '#fff',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                border: visual.destaque && !expirada ? `1.5px solid ${visual.cor}` : '1.5px solid transparent',
                position: 'relative',
                opacity: notif.lida || expirada ? 0.75 : 1,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {/* Bolinha colorida no lugar de ícone por tipo — evita depender
                  de um conjunto de ícones por categoria que ainda não existe */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${visual.cor}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: visual.cor }} />
              </div>

              {/* Conteúdo */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C' }}>
                    {notif.titulo}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: '400', color: '#9CA3AF', flexShrink: 0, marginLeft: '8px' }}>
                    {formatarTempoRelativo(notif.created_at)}
                  </span>
                </div>
                <p style={{
                  fontSize: '12px', fontWeight: '400', color: '#6B7280',
                  margin: 0, lineHeight: '1.5',
                }}>
                  {notif.mensagem}
                </p>

                {expirada ? (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{
                      background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '99px',
                      padding: '3px 10px', fontSize: '11px', fontWeight: '700', color: '#9CA3AF',
                    }}>
                      Expirou
                    </span>
                  </div>
                ) : visual.acaoLabel && (
                  <div style={{ marginTop: '8px' }}>
                    <span style={{
                      background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '99px',
                      padding: '3px 10px', fontSize: '11px', fontWeight: '700', color: '#F97316',
                    }}>
                      {visual.acaoLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Bolinha de não lida */}
              {!notif.lida && (
                <div style={{
                  position: 'absolute', top: '14px', right: '14px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: visual.cor,
                  flexShrink: 0,
                }} />
              )}
            </button>
          )
        })}

      </div>

      {/* BOTTOM NAV */}
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