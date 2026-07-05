// src/pages/PerfilAmigo.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiFetch } from '../lib/api'

import iconHomeCinza from '../assets/icons/home_cinza.png'
import iconHomeLaranja from '../assets/icons/home_laranja.png'
import iconBalaoCinza from '../assets/icons/balao_cinza.png'
import iconBalaoLaranja from '../assets/icons/balao_laranja.png'
import iconBolaCinza from '../assets/icons/bola_cinza.png'
import iconBolaLaranja from '../assets/icons/bola_laranja.png'
import iconTrofeuCinza from '../assets/icons/trofeu_cinza.png'
import iconTrofeuLaranja from '../assets/icons/trofeu_laranja.png'
import iconPerfilCinza from '../assets/icons/perfil_cinza.png'
import iconPerfilLaranja from '../assets/icons/perfil_laranja.png'

import iconPlanejamento from '../assets/icons/planejamento.png'
import iconFogo from '../assets/icons/fogo.png'
import iconRaio from '../assets/icons/raio.png'
import iconAlvo from '../assets/icons/alvo.png'
import iconSacoMoedas from '../assets/icons/sacodemoedas.png'

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

// Mesma constante usada em Perfil.jsx — 1000 XP por nível numérico.
const XP_POR_NIVEL = 1000

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 72, contorno = '#1C1C1C' }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor1}/>
    <path d="M32 2V70C48 66 60 54 60 38V14L32 2Z" fill={cor2}/>
    <line x1="32" y1="2" x2="32" y2="70" stroke={contorno} strokeWidth="2"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke={contorno} strokeWidth="3" fill="none"/>
  </svg>
)

const NAV_ITEMS_ESQUERDA = [
  { iconNormal: iconHomeCinza,  iconActive: iconHomeLaranja,  label: 'Início',    path: '/painel',    hasBadge: false },
  { iconNormal: iconBalaoCinza, iconActive: iconBalaoLaranja, label: 'Vestiário', path: '/vestiario', hasBadge: true  },
]

const NAV_ITEMS_DIREITA = [
  { iconNormal: iconTrofeuCinza, iconActive: iconTrofeuLaranja, label: 'Liga',   path: '/liga-privada', hasBadge: false },
  { iconNormal: iconPerfilCinza, iconActive: iconPerfilLaranja, label: 'Perfil', path: '/perfil',       hasBadge: false },
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
        <img src={ativo ? item.iconActive : item.iconNormal} alt={item.label} style={{ width: '44px', height: '44px' }} />
        {item.hasBadge && TEM_NOTIFICACAO_NAO_LIDA && (
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

export default function PerfilAmigo() {
  const navigate = useNavigate()
  const { codigo } = useParams()
  const path = '/perfil-amigo'

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [amigo, setAmigo] = useState(null)

  const [desafiando, setDesafiando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      setCarregando(true)
      setErro(null)
      try {
        const data = await apiFetch(`/api/amigos/${codigo}`, { method: 'GET' })
        if (cancelado) return
        setAmigo(data?.amigo ?? null)
      } catch (e) {
        if (cancelado) return
        setErro(e.message || 'Não foi possível carregar esse perfil.')
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    carregar()
    return () => { cancelado = true }
  }, [codigo])

  const handleDesafiar = async () => {
    if (!amigo || desafiando || enviado) return
    setDesafiando(true)
    setErro(null)
    try {
      await apiFetch('/api/convites/desafiar', { method: 'POST', body: { amigo_id: amigo.id } })
      setEnviado(true)
    } catch (e) {
      setErro(e.message || 'Não foi possível enviar o desafio.')
    } finally {
      setDesafiando(false)
    }
  }

  if (carregando) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: '#fff', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#9CA3AF' }}>Carregando perfil...</span>
      </div>
    )
  }

  if (erro && !amigo) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: '#fff', height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '16px', textAlign: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
        <button onClick={() => navigate('/amigos')} style={{ background: '#F97316', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 32px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          VOLTAR
        </button>
      </div>
    )
  }

  const nivelTitulo = amigo?.nivel_titulo ?? 'Iniciante'
  const xp = amigo?.xp ?? 0
  const xpNoNivel = xp % XP_POR_NIVEL
  const xpPct = Math.round((xpNoNivel / XP_POR_NIVEL) * 100)

  const partidas = amigo?.partidas ?? 0
  const vitorias = amigo?.vitorias ?? 0
  const empates = amigo?.empates ?? 0
  const titulos = amigo?.titulos ?? 0
  const aproveitamento = partidas > 0
    ? Math.round(((vitorias * 3 + empates) / (partidas * 3)) * 100)
    : 0

  const CARREIRA = [
    { icone: iconFogo,       label: 'Sequência de vitórias atual',      valor: `${amigo?.sequencia_vitorias_atual ?? 0} jogos` },
    { icone: iconRaio,       label: 'Recorde de sequência de vitórias', valor: `${amigo?.recorde_sequencia_vitorias ?? 0} jogos` },
    { icone: iconAlvo,       label: 'Maior goleada aplicada',           valor: `${amigo?.maior_goleada_gols ?? 0} gols de saldo` },
    { icone: iconSacoMoedas, label: 'Moedas acumuladas na carreira',    valor: (amigo?.moedas_carreira_acumuladas ?? 0).toLocaleString('pt-BR') },
  ]

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

      {/* HEADER — fixo */}
      <div style={{
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        borderBottom: '1px solid #F5F5F5',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/amigos')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#1C1C1C', padding: '4px', lineHeight: 1 }}
        >
          ‹
        </button>
        <span style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C' }}>PERFIL</span>
      </div>

      {/* MIOLO — flex:1, rola se precisar, rodapé sempre coladinho */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {erro && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '8px 12px', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
          </div>
        )}

        {/* CARD IDENTIDADE */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E5E7EB',
          borderRadius: '14px', padding: '20px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          marginBottom: '14px',
        }}>
          <div style={{ position: 'relative' }}>
            <EscudoTime cor1={amigo?.clube?.cor_primaria} cor2={amigo?.clube?.cor_secundaria} size={72} />
            <div style={{
              position: 'absolute', bottom: '2px', right: '-4px',
              width: '14px', height: '14px', borderRadius: '50%',
              background: amigo?.online ? '#10B981' : '#D1D5DB',
              border: '2.5px solid #fff',
            }} />
          </div>

          <div style={{ fontSize: '20px', fontWeight: '900', color: '#1C1C1C', marginTop: '10px' }}>
            {amigo?.nome}
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
            {amigo?.clube?.nome} · #{amigo?.codigo}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
            <img src={ICONES_NIVEL[nivelTitulo] || iconNivelIniciante} style={{ width: 18, height: 18 }} alt={nivelTitulo} />
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#F97316' }}>Técnico {nivelTitulo}</span>
          </div>

          {/* Barra XP */}
          <div style={{ width: '100%', marginTop: '14px' }}>
            <div style={{ height: '8px', background: '#F5F5F5', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${xpPct}%`, background: '#F97316', borderRadius: '99px' }} />
            </div>
            <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '12px', color: '#6B7280' }}>
              {xpNoNivel.toLocaleString('pt-BR')} / {XP_POR_NIVEL.toLocaleString('pt-BR')} XP no nível
            </div>
          </div>

          {/* Stats rápidas — mesmo padrão do Perfil.jsx */}
          <div style={{
            display: 'flex', width: '100%', marginTop: '14px',
            borderTop: '1px solid #F5F5F5', paddingTop: '14px', gap: '4px',
          }}>
            {[
              { icone: iconBolaLaranja,  valor: partidas, label: 'partidas' },
              { icone: iconPlanejamento, valor: `${aproveitamento}%`, label: 'aproveit.' },
              { icone: iconTrofeuLaranja, valor: titulos, label: 'títulos' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
                <img src={s.icone} alt={s.label} style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#1C1C1C', lineHeight: 1 }}>{s.valor}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Botão desafiar */}
          {amigo?.online && (
            <button
              onClick={handleDesafiar}
              disabled={desafiando || enviado}
              style={{
                width: '100%', marginTop: '16px',
                background: enviado ? '#10B981' : '#F97316', color: '#fff',
                border: 'none', borderRadius: '10px', padding: '12px',
                fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px',
                cursor: (desafiando || enviado) ? 'default' : 'pointer',
                fontFamily: "'Inter', sans-serif",
                opacity: desafiando ? 0.7 : 1,
              }}
            >
              {enviado ? 'DESAFIO ENVIADO' : (desafiando ? 'ENVIANDO...' : 'DESAFIAR')}
            </button>
          )}
        </div>

        {/* CARREIRA — dados reais, direto das colunas de tecnicos */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E5E7EB',
          borderRadius: '14px', padding: '16px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C', marginBottom: '12px' }}>
            CARREIRA
          </div>
          {CARREIRA.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < CARREIRA.length - 1 ? '1px solid #F5F5F5' : 'none',
            }}>
              <img src={c.icone} alt="" style={{ width: 22, height: 22, objectFit: 'contain', marginRight: '10px', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '13px', color: '#6B7280' }}>{c.label}</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C' }}>{c.valor}</span>
            </div>
          ))}
        </div>

      </div>

      {/* BOTTOM NAV — fixo, padrão mobile-first */}
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
