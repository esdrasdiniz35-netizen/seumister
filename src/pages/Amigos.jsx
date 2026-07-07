// src/pages/Amigos.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { getTecnicoMe } from '../lib/cacheTecnico'

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

const POLL_AMIGOS_MS = 15000
const POLL_CONVITE_MS = 4000

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 44, contorno = '#1C1C1C' }) => (
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
        <img src={ativo ? item.iconActive : item.iconNormal} alt={item.label} style={{ width: '24px', height: '24px' }} />
        {item.hasBadge && TEM_NOTIFICACAO_NAO_LIDA && (
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

export default function Amigos() {
  const navigate = useNavigate()
  const path = '/amigos'

  const [abaAtiva, setAbaAtiva] = useState('amigos')
  const [meuCodigo, setMeuCodigo] = useState(null)

  const [amigos, setAmigos] = useState([])
  const [carregandoAmigos, setCarregandoAmigos] = useState(true)
  const [erro, setErro] = useState(null)

  const [inputCodigo, setInputCodigo] = useState('')
  const [adicionando, setAdicionando] = useState(false)
  const [mensagemAdicionar, setMensagemAdicionar] = useState(null)

  const [desafiando, setDesafiando] = useState(null)
  const [enviados, setEnviados] = useState({})

  const [conviteRecebido, setConviteRecebido] = useState(null)
  const [respondendoConvite, setRespondendoConvite] = useState(false)

  const pollAmigosRef = useRef(null)
  const pollConviteRef = useRef(null)

  const buscarAmigos = async () => {
    try {
      const data = await apiFetch('/api/amigos', { method: 'GET' })
      setAmigos(data.amigos || [])
      setErro(null)
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar seus amigos.')
    } finally {
      setCarregandoAmigos(false)
    }
  }

  const buscarConviteRecebido = async () => {
    try {
      const data = await apiFetch('/api/convites/recebido', { method: 'GET' })
      setConviteRecebido(data.convite || null)
    } catch {
      // Silencioso — polling em segundo plano.
    }
  }

  useEffect(() => {
    let cancelado = false

    async function carregarInicial() {
      try {
        const tecnicoData = await getTecnicoMe()
        if (cancelado) return
        setMeuCodigo(tecnicoData?.tecnico?.codigo ?? null)
      } catch (e) {
        if (cancelado) return
        setErro(e.message || 'Não foi possível carregar seu perfil.')
      }
      await buscarAmigos()
      await buscarConviteRecebido()
    }

    carregarInicial()

    pollAmigosRef.current = setInterval(buscarAmigos, POLL_AMIGOS_MS)
    pollConviteRef.current = setInterval(buscarConviteRecebido, POLL_CONVITE_MS)

    return () => {
      cancelado = true
      clearInterval(pollAmigosRef.current)
      clearInterval(pollConviteRef.current)
    }
  }, [])

  const handleAdicionar = async () => {
    if (!inputCodigo.trim() || adicionando) return
    setAdicionando(true)
    setMensagemAdicionar(null)
    try {
      const resultado = await apiFetch('/api/amigos/adicionar', {
        method: 'POST',
        body: { codigo: inputCodigo.trim() },
      })
      setMensagemAdicionar({ tipo: 'ok', texto: `${resultado.amigo.nome} agora é seu amigo!` })
      setInputCodigo('')
      buscarAmigos()
    } catch (e) {
      setMensagemAdicionar({ tipo: 'erro', texto: e.message || 'Não foi possível adicionar esse código.' })
    } finally {
      setAdicionando(false)
    }
  }

  const handleDesafiar = async (amigo) => {
    setDesafiando(amigo.id)
    setErro(null)
    try {
      await apiFetch('/api/convites/desafiar', { method: 'POST', body: { amigo_id: amigo.id } })
      setEnviados((prev) => ({ ...prev, [amigo.id]: true }))
      setTimeout(() => {
        setEnviados((prev) => {
          const copia = { ...prev }
          delete copia[amigo.id]
          return copia
        })
      }, 8000)
    } catch (e) {
      setErro(e.message || 'Não foi possível enviar o desafio.')
    } finally {
      setDesafiando(null)
    }
  }

  const handleAceitarConvite = async () => {
    if (!conviteRecebido || respondendoConvite) return
    setRespondendoConvite(true)
    try {
      await apiFetch(`/api/convites/${conviteRecebido.id}/aceitar`, { method: 'POST' })
      navigate('/partida')
    } catch (e) {
      setErro(e.message || 'Não foi possível aceitar o desafio.')
      setConviteRecebido(null)
    } finally {
      setRespondendoConvite(false)
    }
  }

  const handleRecusarConvite = async () => {
    if (!conviteRecebido || respondendoConvite) return
    setRespondendoConvite(true)
    try {
      await apiFetch(`/api/convites/${conviteRecebido.id}/recusar`, { method: 'POST' })
    } catch {
      // Mesmo se der erro, some da tela.
    } finally {
      setConviteRecebido(null)
      setRespondendoConvite(false)
    }
  }

  const onlineCount = amigos.filter((a) => a.online).length

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
      <div style={{ padding: '14px 16px 0', background: '#1C1C1C', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <img src={iconAmigos} alt="amigos" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>Amigos</div>
            <div style={{ fontSize: '12px', fontWeight: '400', color: '#9CA3AF', marginTop: '2px' }}>
              {onlineCount} online agora
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { key: 'amigos', label: `Amigos (${amigos.length})` },
            { key: 'adicionar', label: 'Adicionar' },
          ].map((aba) => (
            <button
              key={aba.key}
              onClick={() => setAbaAtiva(aba.key)}
              style={{
                background: abaAtiva === aba.key ? '#F97316' : 'transparent',
                border: abaAtiva === aba.key ? 'none' : '1px solid #4B5563',
                borderRadius: '99px 99px 0 0',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                color: abaAtiva === aba.key ? '#fff' : '#9CA3AF',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      {/* BANNER DE DESAFIO RECEBIDO */}
      {conviteRecebido && (
        <div style={{
          margin: '12px 16px 0', background: '#1C1C1C', borderRadius: '14px',
          padding: '14px', flexShrink: 0, border: '1.5px solid #F97316',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <EscudoTime
              cor1={conviteRecebido.tecnicos?.clube_proprio?.cor_primaria}
              cor2={conviteRecebido.tecnicos?.clube_proprio?.cor_secundaria}
              size={36}
              contorno="white"
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: '#fff' }}>
                {conviteRecebido.tecnicos?.nome} te desafiou!
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                {conviteRecebido.tecnicos?.clube_proprio?.nome}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAceitarConvite}
              disabled={respondendoConvite}
              style={{
                flex: 1, background: '#F97316', border: 'none', borderRadius: '10px',
                padding: '10px', fontSize: '13px', fontWeight: '700', color: '#fff',
                cursor: respondendoConvite ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif",
                opacity: respondendoConvite ? 0.7 : 1,
              }}
            >
              ACEITAR
            </button>
            <button
              onClick={handleRecusarConvite}
              disabled={respondendoConvite}
              style={{
                flex: 1, background: 'transparent', border: '1.5px solid #4B5563', borderRadius: '10px',
                padding: '10px', fontSize: '13px', fontWeight: '700', color: '#9CA3AF',
                cursor: respondendoConvite ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif",
              }}
            >
              RECUSAR
            </button>
          </div>
        </div>
      )}

      {/* MIOLO — flex:1, rola se precisar, mantém o rodapé sempre colado. */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {erro && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '8px 12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
          </div>
        )}

        {abaAtiva === 'amigos' && (
          <>
            {carregandoAmigos && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '13px' }}>
                Carregando amigos...
              </div>
            )}

            {!carregandoAmigos && amigos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <img src={iconAmigos} alt="amigos" style={{ width: '48px', height: '48px', objectFit: 'contain', opacity: 0.4, marginBottom: '10px' }} />
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#6B7280' }}>
                  Você ainda não tem amigos adicionados.
                </div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                  Vai na aba "Adicionar" e usa o código de alguém.
                </div>
              </div>
            )}

            {!carregandoAmigos && amigos.map((amigo) => (
              <div
                key={amigo.id}
                onClick={() => navigate(`/amigos/${amigo.codigo}`)}
                style={{
                  background: '#fff', borderRadius: '14px', padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  border: '1.5px solid #E5E7EB', cursor: 'pointer',
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <EscudoTime cor1={amigo.clube?.cor_primaria} cor2={amigo.clube?.cor_secundaria} size={44} />
                  <span style={{
                    position: 'absolute', bottom: '-1px', right: '-1px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: amigo.online ? '#10B981' : '#D1D5DB',
                    border: '2px solid #fff',
                  }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C' }}>{amigo.nome}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <img src={ICONES_NIVEL[amigo.nivel_titulo] || iconNivelIniciante} alt={amigo.nivel_titulo} style={{ width: '14px', height: '14px' }} />
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>
                      {amigo.clube?.nome} · {amigo.nivel_titulo}
                    </span>
                  </div>
                </div>

                {amigo.online && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDesafiar(amigo) }}
                    disabled={desafiando === amigo.id || Boolean(enviados[amigo.id])}
                    style={{
                      background: enviados[amigo.id] ? '#10B981' : '#F97316',
                      border: 'none', borderRadius: '8px', padding: '7px 12px',
                      fontSize: '11px', fontWeight: '700', color: '#fff',
                      cursor: desafiando === amigo.id ? 'default' : 'pointer',
                      fontFamily: "'Inter', sans-serif", flexShrink: 0,
                      opacity: desafiando === amigo.id ? 0.7 : 1,
                    }}
                  >
                    {enviados[amigo.id] ? 'ENVIADO' : (desafiando === amigo.id ? '...' : 'DESAFIAR')}
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {abaAtiva === 'adicionar' && (
          <div style={{ paddingTop: '8px' }}>
            <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C', marginBottom: '4px' }}>
                Adicionar por código
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
                Digite o código do técnico — a amizade é criada na hora, dos dois lados.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Código"
                  value={inputCodigo}
                  onChange={(e) => { setInputCodigo(e.target.value); setMensagemAdicionar(null) }}
                  style={{
                    flex: 1, border: '1.5px solid #E5E7EB', borderRadius: '10px',
                    padding: '10px 12px', fontSize: '14px', fontWeight: '700',
                    color: '#1C1C1C', fontFamily: "'Inter', sans-serif", outline: 'none',
                  }}
                />
                <button
                  onClick={handleAdicionar}
                  disabled={adicionando || !inputCodigo.trim()}
                  style={{
                    background: '#F97316', border: 'none', borderRadius: '10px',
                    padding: '10px 16px', fontSize: '13px', fontWeight: '700',
                    color: '#fff', cursor: adicionando ? 'default' : 'pointer',
                    fontFamily: "'Inter', sans-serif", opacity: adicionando ? 0.7 : 1,
                  }}
                >
                  {adicionando ? '...' : 'ADICIONAR'}
                </button>
              </div>

              {mensagemAdicionar && (
                <div style={{
                  marginTop: '12px',
                  background: mensagemAdicionar.tipo === 'ok' ? '#ECFDF5' : '#FEF2F2',
                  borderRadius: '10px', padding: '10px 12px',
                  fontSize: '12px', fontWeight: '600',
                  color: mensagemAdicionar.tipo === 'ok' ? '#10B981' : '#EF4444',
                }}>
                  {mensagemAdicionar.texto}
                </div>
              )}
            </div>

            <div style={{
              background: '#FFF7ED', border: '1.5px solid #FDE3CC', borderRadius: '14px',
              padding: '16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#9A6B3F', letterSpacing: '0.5px', marginBottom: '6px' }}>
                SEU CÓDIGO
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#1C1C1C', letterSpacing: '2px' }}>
                {meuCodigo ?? '...'}
              </div>
              <div style={{ fontSize: '11px', color: '#9A6B3F', marginTop: '6px' }}>
                Compartilha esse número pra outros técnicos te adicionarem.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM NAV */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
        padding: '4px 0 5px', borderTop: '1px solid #E5E7EB', background: 'white',
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