// src/pages/Intervalo.jsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { getTecnicoMe } from '../lib/cacheTecnico'
import {
  buscarPartidaAtual,
  descobrirPartidaAtivaDoTecnico,
  assinarPartida,
} from '../lib/partidaRealtime'
import {
  retomarPartida,
  confirmarRetomadaManual,
  heartbeatDecisao,
  ajustarTimeEmCampo,
} from '../lib/partidaApi'

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

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 48, contorno = '#1C1C1C' }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor1}/>
    <path d="M32 2V70C48 66 60 54 60 38V14L32 2Z" fill={cor2}/>
    <line x1="32" y1="2" x2="32" y2="70" stroke={contorno} strokeWidth="2"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke={contorno} strokeWidth="3" fill="none"/>
  </svg>
)

const IconGreenStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#10B981"/>
    <path d="M12 6L13.5 9.5H17L14.2 11.8L15.3 15.5L12 13.4L8.7 15.5L9.8 11.8L7 9.5H10.5L12 6Z" fill="white"/>
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

function NavButton({ item, ativo, navigate, naoLidas }) {
  return (
    <button onClick={() => navigate(item.path)} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '4px', background: 'transparent', border: 'none',
      cursor: 'pointer', padding: '0 6px', position: 'relative',
    }}>
      <div style={{ position: 'relative' }}>
        <img src={ativo ? item.iconActive : item.iconNormal} alt={item.label} style={{ width: '24px', height: '24px' }} />
        {item.hasBadge && naoLidas > 0 && (
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
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: ativo ? '0 4px 12px rgba(249,115,22,0.45)' : '0 2px 8px rgba(0,0,0,0.12)',
        border: ativo ? '3px solid #F97316' : '2px solid #E5E7EB',
      }}>
        <img src={ativo ? iconBolaLaranja : iconBolaCinza} alt="Jogar" style={{ width: '26px', height: '26px' }} />
      </div>
      <span style={{ fontSize: '8px', fontWeight: ativo ? '700' : '400', color: ativo ? '#F97316' : '#6B7280', fontFamily: "'Inter', sans-serif" }}>
        Jogar
      </span>
    </button>
  )
}

const POSICAO_LABEL = { Goalkeeper: 'GOL', Defender: 'ZAG', Midfielder: 'MEI', Attacker: 'ATA' }
const COR_POSICAO = { GOL: '#F97316', ZAG: '#3B82F6', MEI: '#10B981', ATA: '#EF4444' }
const COR_STATUS = { inspirado: '#10B981', normal: '#6B7280', mal: '#EF4444' }
const COR_CANSACO = (pct) => (pct > 60 ? '#10B981' : pct > 30 ? '#F59E0B' : '#EF4444')

const FORMACOES = {
  '4-4-2': [
    { left: 50, top: 88 }, { left: 15, top: 70 }, { left: 35, top: 70 },
    { left: 65, top: 70 }, { left: 85, top: 70 }, { left: 15, top: 48 },
    { left: 38, top: 48 }, { left: 62, top: 48 }, { left: 85, top: 48 },
    { left: 35, top: 22 }, { left: 65, top: 22 },
  ],
  '4-3-3': [
    { left: 50, top: 88 }, { left: 12, top: 70 }, { left: 34, top: 70 },
    { left: 66, top: 70 }, { left: 88, top: 70 }, { left: 25, top: 48 },
    { left: 50, top: 45 }, { left: 75, top: 48 }, { left: 18, top: 18 },
    { left: 50, top: 14 }, { left: 82, top: 18 },
  ],
  '4-2-3-1': [
    { left: 50, top: 88 }, { left: 12, top: 72 }, { left: 34, top: 72 },
    { left: 66, top: 72 }, { left: 88, top: 72 }, { left: 35, top: 55 },
    { left: 65, top: 55 }, { left: 15, top: 36 }, { left: 50, top: 33 },
    { left: 85, top: 36 }, { left: 50, top: 14 },
  ],
  '3-5-2': [
    { left: 50, top: 88 }, { left: 22, top: 72 }, { left: 50, top: 72 },
    { left: 78, top: 72 }, { left: 10, top: 50 }, { left: 30, top: 50 },
    { left: 50, top: 47 }, { left: 70, top: 50 }, { left: 90, top: 50 },
    { left: 35, top: 22 }, { left: 65, top: 22 },
  ],
  '5-3-2': [
    { left: 50, top: 88 }, { left: 8, top: 70 }, { left: 26, top: 70 },
    { left: 50, top: 70 }, { left: 74, top: 70 }, { left: 92, top: 70 },
    { left: 25, top: 46 }, { left: 50, top: 43 }, { left: 75, top: 46 },
    { left: 35, top: 20 }, { left: 65, top: 20 },
  ],
}

const DURACAO_SEM_ACAO = 10
const DURACAO_COM_ACAO = 15
const LIMITE_SUBSTITUICOES_PARTIDA = 5

const POSTURAS = [
  { valor: 'ofensivo', label: 'OFENSIVO' },
  { valor: 'equilibrado', label: 'EQUILIBRADO' },
  { valor: 'defensivo', label: 'DEFENSIVO' },
]

function calcularCansacoPct(minutosJogados) {
  const queda = Math.min(0.25, ((minutosJogados ?? 0) / 90) * 0.25)
  return Math.round((1 - queda) * 100)
}

// ★ Anti-sobreposição — os jogadores no campo são posicionados livremente
// (formação padrão ou arrasto manual) e podiam ficar próximos o bastante
// pra suas etiquetas de nome se sobreporem visualmente. Empurra qualquer
// par mais perto que DISTANCIA_MINIMA pra longe um do outro, metade cada.
// O campo não é quadrado (paddingBottom:'108%' — ver container do campo),
// então a distância no eixo Y precisa ser corrigida por esse aspect ratio
// antes de comparar com a distância no eixo X.
const DISTANCIA_MINIMA = 13
const ASPECT_RATIO_CAMPO = 108 / 100

function distanciaAjustada(a, b) {
  const dx = a.x - b.x
  const dy = (a.y - b.y) * ASPECT_RATIO_CAMPO
  return Math.sqrt(dx * dx + dy * dy)
}

function resolverColisoes(jogadores, passadas = 2) {
  const atual = jogadores.map((j) => ({ ...j }))
  for (let p = 0; p < passadas; p++) {
    for (let i = 0; i < atual.length; i++) {
      for (let k = i + 1; k < atual.length; k++) {
        const a = atual[i]
        const b = atual[k]
        if (typeof a.x !== 'number' || typeof b.x !== 'number') continue
        const dist = distanciaAjustada(a, b)
        if (dist === 0 || dist >= DISTANCIA_MINIMA) continue
        const falta = DISTANCIA_MINIMA - dist
        const dx = (a.x - b.x) / (dist || 1)
        const dy = (a.y - b.y) / (dist || 1)
        const empurraX = (dx * falta) / 2
        const empurraY = (dy * falta) / 2
        a.x = Math.min(95, Math.max(5, a.x + empurraX))
        a.y = Math.min(95, Math.max(5, a.y + empurraY))
        b.x = Math.min(95, Math.max(5, b.x - empurraX))
        b.y = Math.min(95, Math.max(5, b.y - empurraY))
      }
    }
  }
  return atual
}

export default function Intervalo() {
  const navigate = useNavigate()
  const location = useLocation()
  const partidaIdRecebido = location.state?.partidaId

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const [partidaId, setPartidaId] = useState(partidaIdRecebido ?? null)
  const [meuLado, setMeuLado] = useState(null)
  const [meuClube, setMeuClube] = useState(null)
  const [motivoPausa, setMotivoPausa] = useState(null)
  const [partidaEntreDoisHumanos, setPartidaEntreDoisHumanos] = useState(false)
  const [substituicoesUsadas, setSubstituicoesUsadas] = useState(0)

  const [formacao, setFormacao] = useState('4-3-3')
  const [titulares, setTitulares] = useState([])
  const [reservas, setReservas] = useState([])
  const [modoEdicao, setModoEdicao] = useState(false)

  const [postura, setPostura] = useState('equilibrado')
  const [salvandoPostura, setSalvandoPostura] = useState(false)

  const [tempoTotal, setTempoTotal] = useState(DURACAO_SEM_ACAO)
  const [tempoRestante, setTempoRestante] = useState(DURACAO_SEM_ACAO)
  const interagiuRef = useRef(false)
  const timerRef = useRef(null)
  const tempoRestanteRef = useRef(DURACAO_SEM_ACAO)
  const tempoTotalRef = useRef(DURACAO_SEM_ACAO)

  const campoRef = useRef(null)
  const bancoRef = useRef(null)
  const draggingRef = useRef(null)
  const ghostRef = useRef(null)

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      try {
        let idDaPartida = partidaIdRecebido
        if (!idDaPartida) {
          const partidaAtiva = await descobrirPartidaAtivaDoTecnico()
          if (!partidaAtiva) {
            navigate('/jogar')
            return
          }
          idDaPartida = partidaAtiva.id
        }

        const [tecnicoData, partida, elencoData] = await Promise.all([
          getTecnicoMe(),
          buscarPartidaAtual(idDaPartida),
          apiFetch('/api/elenco', { method: 'GET' }).catch(() => null),
        ])

        if (cancelado) return

        const clube = tecnicoData?.tecnico?.clube_proprio
        if (!clube) {
          setErro('Não foi possível identificar seu clube.')
          setCarregando(false)
          return
        }

        let lado
        if (partida.clube_home_id === clube.id) lado = 'home'
        else if (partida.clube_away_id === clube.id) lado = 'away'
        else {
          setErro('Esta partida não pertence ao seu clube.')
          setCarregando(false)
          return
        }

        const campoJogadores = lado === 'away' ? 'dados_jogadores_away' : 'dados_jogadores_home'
        const jogadoresDoMeuLado = partida[campoJogadores] || []

        const fotosPorId = new Map()
        if (elencoData) {
          for (const j of [...(elencoData.titulares || []), ...(elencoData.reservas || [])]) {
            fotosPorId.set(j.id, j.foto)
          }
        }

        const formatarJogador = (j) => ({
          id: j.id,
          nome: j.nome,
          posicao: POSICAO_LABEL[j.posicao] ?? j.posicao,
          overall: j.overall ?? null,
          foto: fotosPorId.get(j.id) ?? null,
          status: j.statusDoDia === 'mal' ? 'mal' : (j.statusDoDia ?? 'normal'),
          cansaco: calcularCansacoPct(j.minutosJogados),
          x: j.x,
          y: j.y,
        })

        const titularesBrutos = jogadoresDoMeuLado.filter((j) => j.titular !== false)
        const ORDEM_POSICAO = { Goalkeeper: 0, Defender: 1, Midfielder: 2, Attacker: 3 }
        const slotsDaFormacao = FORMACOES['4-3-3']
        const titularesOrdenados = [...titularesBrutos].sort(
          (a, b) => (ORDEM_POSICAO[a.posicao] ?? 4) - (ORDEM_POSICAO[b.posicao] ?? 4)
        )

        const titularesAtuais = titularesOrdenados.map((j, indice) => {
          if (typeof j.x === 'number' && typeof j.y === 'number') {
            return formatarJogador(j)
          }
          const slot = slotsDaFormacao[indice] ?? slotsDaFormacao[slotsDaFormacao.length - 1] ?? { left: 50, top: 50 }
          return formatarJogador({ ...j, x: slot.left, y: slot.top })
        })

        const reservasAtuais = jogadoresDoMeuLado
          .filter((j) => j.titular === false)
          .map(formatarJogador)

        const motivo = partida.motivo_pausa
        const ehMinhaPausaManual = motivo === 'manual'

        setPartidaId(idDaPartida)
        setMeuLado(lado)
        setMeuClube({ nome: clube.nome, cor1: clube.cor_primaria ?? '#F97316', cor2: clube.cor_secundaria ?? '#1C1C1C' })
        setPartidaEntreDoisHumanos(partida.modo === 'online' || partida.modo === 'apostada' || partida.modo === 'liga')
        setSubstituicoesUsadas((lado === 'away' ? partida.substituicoes_usadas_away : partida.substituicoes_usadas_home) ?? 0)
        setTitulares(resolverColisoes(titularesAtuais))
        setReservas(reservasAtuais)
        setPostura((lado === 'away' ? partida.postura_away : partida.postura_home) ?? 'equilibrado')

        setMotivoPausa(ehMinhaPausaManual ? 'manual' : null)

        setCarregando(false)
      } catch (e) {
        if (cancelado) return
        setErro(e.message || 'Não foi possível carregar os dados do intervalo.')
        setCarregando(false)
      }
    }

    carregar()
    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!partidaId || !meuLado || carregando) return

    const cancelar = assinarPartida(partidaId, {
      onPartidaAtualizada: (novaLinha) => {
        const continuaPausadaPorMim =
          novaLinha.pausada &&
          (novaLinha.motivo_pausa === 'manual' ||
            (novaLinha.motivo_pausa === 'lesao' && novaLinha.lado_pausado === meuLado))

        if (!continuaPausadaPorMim && novaLinha.fase !== 'intervalo') {
          navigate('/partida', { state: { partidaId } })
        }
      },
    })

    return cancelar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partidaId, meuLado, carregando])

  const registrarInteracao = useCallback(() => {
    if (!interagiuRef.current) {
      interagiuRef.current = true
      tempoTotalRef.current = DURACAO_COM_ACAO
      tempoRestanteRef.current = DURACAO_COM_ACAO
      setTempoTotal(DURACAO_COM_ACAO)
      setTempoRestante(DURACAO_COM_ACAO)
      if (partidaId) heartbeatDecisao(partidaId).catch(() => {})
    }
  }, [partidaId])

  useEffect(() => {
    if (carregando || erro) return
    timerRef.current = setInterval(() => {
      tempoRestanteRef.current -= 1
      setTempoRestante(tempoRestanteRef.current)
      if (tempoRestanteRef.current <= 0) {
        clearInterval(timerRef.current)
      }
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [carregando, erro])

  useEffect(() => {
    if (carregando || erro) return
    const el = document.getElementById('intervalo-root')
    if (!el) return

    const onMove = (e) => {
      if (!draggingRef.current) return
      e.preventDefault()
      const touch = e.touches[0]
      if (ghostRef.current) {
        ghostRef.current.style.left = `${touch.clientX}px`
        ghostRef.current.style.top = `${touch.clientY}px`
      }
    }

    const onEnd = (e) => {
      if (!draggingRef.current) return
      e.preventDefault()
      const touch = e.changedTouches[0]
      const { jogador, origem } = draggingRef.current
      draggingRef.current = null
      removerGhost()

      const campo = campoRef.current
      const banco = bancoRef.current

      if (campo) {
        const rect = campo.getBoundingClientRect()
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          const x = Math.min(95, Math.max(5, ((touch.clientX - rect.left) / rect.width) * 100))
          const y = Math.min(95, Math.max(5, ((touch.clientY - rect.top) / rect.height) * 100))
          if (origem === 'campo') {
            setTitulares((prev) => resolverColisoes(prev.map((j) => (j.id === jogador.id ? { ...j, x, y } : j))))
          } else {
            setReservas((prev) => prev.filter((j) => j.id !== jogador.id))
            setTitulares((prev) => {
              const base = prev.some((j) => j.id === jogador.id)
                ? prev.map((j) => (j.id === jogador.id ? { ...j, x, y } : j))
                : [...prev, { ...jogador, x, y }]
              return resolverColisoes(base)
            })
          }
          return
        }
      }

      if (banco && origem === 'campo') {
        const rect = banco.getBoundingClientRect()
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          setTitulares((prev) => prev.filter((j) => j.id !== jogador.id))
          setReservas((prev) => {
            if (prev.some((j) => j.id === jogador.id)) return prev
            return [...prev, { ...jogador, x: undefined, y: undefined }]
          })
        }
      }
    }

    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: false })
    return () => {
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
    }
  }, [carregando, erro])

  const criarGhost = (touch, jogador) => {
    const ghost = document.createElement('div')
    ghost.innerHTML = `<div style="width:40px;height:40px;border-radius:50%;background:#1C1C1C;border:3px solid #F97316;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:700;box-shadow:0 4px 16px rgba(0,0,0,0.5);pointer-events:none;opacity:0.9;">${jogador.nome.slice(0, 2).toUpperCase()}</div>`
    ghost.style.cssText = `position:fixed;z-index:9999;pointer-events:none;transform:translate(-50%,-50%);left:${touch.clientX}px;top:${touch.clientY}px;`
    document.body.appendChild(ghost)
    ghostRef.current = ghost
  }

  const removerGhost = () => {
    if (ghostRef.current) { document.body.removeChild(ghostRef.current); ghostRef.current = null }
  }

  const handleTouchStartCampo = (e, jogador) => {
    if (!modoEdicao) return
    e.stopPropagation()
    registrarInteracao()
    draggingRef.current = { jogador, origem: 'campo' }
    criarGhost(e.touches[0], jogador)
  }

  const handleTouchStartBanco = (e, jogador) => {
    if (!modoEdicao) return
    e.stopPropagation()
    registrarInteracao()
    draggingRef.current = { jogador, origem: 'banco' }
    criarGhost(e.touches[0], jogador)
  }

  const mudarFormacao = (novaFormacao) => {
    if (!modoEdicao) return
    registrarInteracao()
    const posicoes = FORMACOES[novaFormacao]
    setTitulares((prev) => prev.map((j, i) => ({
      ...j, x: posicoes[i]?.left ?? j.x, y: posicoes[i]?.top ?? j.y,
    })))
    setFormacao(novaFormacao)
  }

  const handleMudarPostura = async (novaPostura) => {
    if (novaPostura === postura || salvandoPostura || salvando) return
    if (titulares.length !== 11) {
      setErro('O time precisa ter exatamente 11 titulares em campo.')
      return
    }

    setSalvandoPostura(true)
    setErro(null)
    try {
      // postura é opcional na API, mas titulares é sempre obrigatório —
      // por isso reenviamos o time atual sem alteração junto da troca.
      await ajustarTimeEmCampo(
        partidaId,
        titulares.map((j) => ({ id: j.id, x: j.x, y: j.y })),
        novaPostura
      )
      setPostura(novaPostura)
    } catch (e) {
      setErro(e.message || 'Não foi possível ajustar a postura tática.')
    } finally {
      setSalvandoPostura(false)
    }
  }

  const handleSalvar = async () => {
    if (!modoEdicao) {
      setModoEdicao(true)
      return
    }

    if (titulares.length !== 11) {
      setErro('O time precisa ter exatamente 11 titulares em campo.')
      return
    }

    setSalvando(true)
    setErro(null)
    try {
      const resultado = await ajustarTimeEmCampo(
        partidaId,
        titulares.map((j) => ({ id: j.id, x: j.x, y: j.y }))
      )

      if (resultado.substituicoesIgnoradas?.length > 0) {
        setErro(`Algumas trocas não cabiam no saldo de substituições e foram desfeitas (restavam ${LIMITE_SUBSTITUICOES_PARTIDA - substituicoesUsadas}).`)
      }
      setSubstituicoesUsadas(LIMITE_SUBSTITUICOES_PARTIDA - (resultado.substituicoesRestantes ?? 0))
      setModoEdicao(false)
    } catch (e) {
      setErro(e.message || 'Não foi possível salvar as alterações.')
    } finally {
      setSalvando(false)
    }
  }

  const handleVoltar = async () => {
    try {
      if (motivoPausa === 'manual') {
        await confirmarRetomadaManual(partidaId)
      } else if (!partidaEntreDoisHumanos) {
        await retomarPartida(partidaId)
      }
      navigate('/partida', { state: { partidaId } })
    } catch (e) {
      setErro(e.message || 'Não foi possível retomar a partida.')
    }
  }

  const pct = (tempoRestante / tempoTotal) * 100
  const corBarra = pct > 50 ? '#10B981' : pct > 25 ? '#F59E0B' : '#EF4444'

  if (erro && carregando) {
    return (
      <div style={{
        maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif",
        background: '#fff', height: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '16px', textAlign: 'center',
      }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
        <button onClick={() => navigate('/jogar')} style={{
          background: '#F97316', color: '#fff', border: 'none', borderRadius: '12px',
          padding: '13px 32px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
        }}>
          VOLTAR
        </button>
      </div>
    )
  }

  if (carregando) {
    return (
      <div style={{
        maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif",
        background: '#fff', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#9CA3AF' }}>Carregando...</span>
      </div>
    )
  }

  return (
    <div
      id="intervalo-root"
      style={{
        maxWidth: '480px', margin: '0 auto',
        fontFamily: "'Inter', sans-serif",
        background: '#FFFFFF', height: '100dvh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      {/* HEADER */}
      <div style={{ flexShrink: 0, background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <EscudoTime cor1={meuClube.cor1} cor2={meuClube.cor2} size={48} contorno="#1C1C1C" />
            <div>
              <div style={{ fontSize: '17px', fontWeight: '900', color: '#1C1C1C', lineHeight: '1.2' }}>{meuClube.nome}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: '400', color: '#6B7280' }}>
                  {LIMITE_SUBSTITUICOES_PARTIDA - substituicoesUsadas} subs restantes
                </span>
                <IconGreenStar />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <div style={{
              background: '#FFF7ED',
              border: '1.5px solid #F97316',
              borderRadius: '20px', padding: '4px 12px',
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#F97316' }}>
                {motivoPausa === 'manual' ? '⏸ PAUSA TÁTICA' : '⏸ INTERVALO'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: corBarra }}>{Math.max(0, tempoRestante)}s</span>
              <div style={{ width: '80px', height: '5px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(0, pct)}%`, height: '100%', background: corBarra, borderRadius: '3px', transition: 'width 1s linear, background 0.3s' }} />
              </div>
            </div>
          </div>
        </div>

        {erro && !carregando && (
          <div style={{ background: '#FFF7ED', padding: '8px 16px', borderTop: '1px solid #FDBA74' }}>
            <span style={{ fontSize: '11px', color: '#9A5B13', fontWeight: '600' }}>{erro}</span>
          </div>
        )}
      </div>

      {/* MIOLO — flex:1 consome o espaço que sobra entre o header e os
          botões/rodapé fixos, e só rola se precisar. */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

      {/* FORMAÇÃO */}
      <div style={{ padding: '8px 16px 6px', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', marginBottom: '6px', letterSpacing: '0.5px' }}>
          FORMAÇÃO
        </div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {Object.keys(FORMACOES).map((f) => (
            <button key={f} onClick={() => mudarFormacao(f)} style={{
              padding: '5px 12px', borderRadius: '20px',
              border: formacao === f ? 'none' : '1.5px solid #E5E7EB',
              background: formacao === f ? '#F97316' : '#fff',
              color: formacao === f ? '#fff' : '#1C1C1C',
              fontSize: '12px', fontWeight: formacao === f ? '700' : '500',
              cursor: modoEdicao ? 'pointer' : 'default',
              opacity: modoEdicao ? 1 : (formacao === f ? 1 : 0.5),
              whiteSpace: 'nowrap', flexShrink: 0,
              fontFamily: "'Inter', sans-serif",
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* POSTURA TÁTICA */}
      <div style={{ padding: '0 16px 6px', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', marginBottom: '6px', letterSpacing: '0.5px' }}>
          POSTURA TÁTICA
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {POSTURAS.map((p) => (
            <button
              key={p.valor}
              onClick={() => handleMudarPostura(p.valor)}
              disabled={salvandoPostura || salvando}
              style={{
                flex: 1, padding: '8px 6px', borderRadius: '10px',
                border: postura === p.valor ? 'none' : '1.5px solid #E5E7EB',
                background: postura === p.valor ? '#F97316' : '#fff',
                color: postura === p.valor ? '#fff' : '#1C1C1C',
                fontSize: '11px', fontWeight: postura === p.valor ? '700' : '500',
                cursor: (salvandoPostura || salvando) ? 'default' : 'pointer',
                opacity: (salvandoPostura || salvando) ? 0.7 : 1,
                fontFamily: "'Inter', sans-serif", transition: 'background 0.2s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* CAMPO */}
      <div style={{ padding: '0 16px', flexShrink: 0 }}>
        <div ref={campoRef} style={{
          position: 'relative', width: '100%', paddingBottom: '108%',
          background: 'linear-gradient(180deg, #2d8a3e 0%, #3a9e4a 25%, #2d8a3e 50%, #3a9e4a 75%, #2d8a3e 100%)',
          borderRadius: '12px', overflow: 'hidden', border: '2px solid #1a6b2a', touchAction: 'none',
        }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 108" preserveAspectRatio="none">
            <rect x="2" y="2" width="96" height="104" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
            <line x1="2" y1="54" x2="98" y2="54" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
            <circle cx="50" cy="54" r="11" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
            <rect x="22" y="2" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
            <rect x="36" y="2" width="28" height="8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
            <rect x="22" y="90" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
            <rect x="36" y="100" width="28" height="6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
          </svg>

          {titulares.map((jogador) => {
            return (
              <div
                key={jogador.id}
                onTouchStart={(e) => handleTouchStartCampo(e, jogador)}
                style={{
                  position: 'absolute', left: `${jogador.x}%`, top: `${jogador.y}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
                  cursor: modoEdicao ? 'grab' : 'default',
                  userSelect: 'none', touchAction: 'none', zIndex: 2,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', marginBottom: '2px' }}>
                  <div style={{
                    fontSize: '8px', fontWeight: '700',
                    color: COR_STATUS[jogador.status],
                    background: 'rgba(0,0,0,0.75)', borderRadius: '3px',
                    padding: '1px 3px', whiteSpace: 'nowrap',
                  }}>
                    {jogador.status}
                  </div>
                  <div style={{ width: '34px', height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${jogador.cansaco}%`, height: '100%', background: COR_CANSACO(jogador.cansaco), borderRadius: '2px' }} />
                  </div>
                </div>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  border: '2px solid white',
                  overflow: 'hidden', background: '#1C1C1C',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                }}>
                  <img
                    src={jogador.foto ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=1C1C1C&color=fff&bold=true&size=34`}
                    alt={jogador.nome}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=1C1C1C&color=fff&bold=true&size=34` }}
                  />
                </div>
                <div style={{ background: 'rgba(0,0,0,0.8)', borderRadius: '3px', padding: '1px 3px', textAlign: 'center' }}>
                  <div style={{ fontSize: '8px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {jogador.nome}
                  </div>
                  {jogador.overall != null && (
                    <div style={{ fontSize: '8px', fontWeight: '900', color: '#fff' }}>{jogador.overall}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* RESERVAS */}
      <div style={{ padding: '6px 16px 0', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', marginBottom: '5px', letterSpacing: '0.5px' }}>
          RESERVAS
        </div>
        <div ref={bancoRef} style={{
          display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', minHeight: '80px',
          background: modoEdicao ? 'rgba(249,115,22,0.05)' : 'transparent',
          border: modoEdicao ? '1.5px dashed rgba(249,115,22,0.4)' : '1.5px solid transparent',
          borderRadius: '10px', padding: '4px', transition: 'all 0.2s',
        }}>
          {reservas.map((jogador) => (
            <div key={jogador.id}
              onTouchStart={(e) => handleTouchStartBanco(e, jogador)}
              style={{
                flexShrink: 0, width: '64px', background: '#F5F5F5', border: '1.5px solid #E5E7EB',
                borderRadius: '10px', padding: '5px 4px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                cursor: modoEdicao ? 'grab' : 'default', touchAction: 'none', userSelect: 'none',
              }}
            >
              <div style={{ width: '52px', height: '3px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: '#10B981', borderRadius: '2px' }} />
              </div>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', background: '#1C1C1C', border: '2px solid #fff' }}>
                <img
                  src={jogador.foto ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=1C1C1C&color=fff&bold=true&size=34`}
                  alt={jogador.nome}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=1C1C1C&color=fff&bold=true&size=34` }}
                />
              </div>
              <div style={{ fontSize: '8px', fontWeight: '700', color: '#10B981', textAlign: 'center' }}>pronto</div>
              <div style={{ fontSize: '9px', fontWeight: '600', color: '#1C1C1C', textAlign: 'center', lineHeight: '11px' }}>
                {jogador.nome.split(' ')[0]}
              </div>
              <div style={{ fontSize: '9px', fontWeight: '700', color: COR_POSICAO[jogador.posicao] }}>{jogador.posicao}</div>
              {jogador.overall != null && <div style={{ fontSize: '10px', fontWeight: '900', color: '#1C1C1C' }}>{jogador.overall}</div>}
            </div>
          ))}
        </div>
      </div>

      </div>
      {/* fim do miolo flex:1 */}

      {/* BOTÕES */}
      <div style={{ padding: '6px 16px', flexShrink: 0, display: 'flex', gap: '8px' }}>
        <button
          onClick={handleSalvar}
          disabled={salvando}
          style={{
            flex: 1, background: modoEdicao ? '#10B981' : '#F97316',
            color: '#fff', border: 'none', borderRadius: '12px', padding: '13px',
            fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: salvando ? 'default' : 'pointer', opacity: salvando ? 0.7 : 1,
            fontFamily: "'Inter', sans-serif", transition: 'background 0.2s',
          }}
        >
          {salvando ? 'SALVANDO...' : modoEdicao ? 'SALVAR' : 'EDITAR TIME'}
        </button>
        <button
          onClick={handleVoltar}
          style={{
            flex: 1,
            background: '#fff',
            color: '#F97316',
            border: '2px solid #F97316',
            borderRadius: '12px', padding: '13px',
            fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          VOLTAR À PARTIDA
        </button>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', padding: '4px 0 5px', borderTop: '1px solid #E5E7EB', background: 'white', flexShrink: 0 }}>
        {NAV_ITEMS_ESQUERDA.map((item) => (
          <NavButton key={item.label} item={item} ativo={false} navigate={navigate} naoLidas={0} />
        ))}
        <BotaoJogar ativo={true} navigate={navigate} />
        {NAV_ITEMS_DIREITA.map((item) => (
          <NavButton key={item.label} item={item} ativo={false} navigate={navigate} naoLidas={0} />
        ))}
      </div>
    </div>
  )
}