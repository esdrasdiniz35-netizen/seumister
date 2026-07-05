// src/pages/Elenco.jsx
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

import iconNivelIniciante from '../assets/icons/iniciante.png'
import iconNivelAmador from '../assets/icons/amador.png'
import iconNivelPromissor from '../assets/icons/promissor.png'
import iconNivelPro from '../assets/icons/pro.png'
import iconNivelElite from '../assets/icons/elite.png'
import iconNivelSuperTreinador from '../assets/icons/supertreinador.png'
import iconNivelLenda from '../assets/icons/lenda.png'

// Mesmo mapeamento do Painel.jsx/Perfil.jsx — estava faltando aqui, por
// isso o "Iniciante" no cabeçalho continuava com a estrelinha verde
// genérica em vez do badge novo.
const ICONES_NIVEL = {
  'Iniciante': iconNivelIniciante,
  'Amador': iconNivelAmador,
  'Promissor': iconNivelPromissor,
  'Pro': iconNivelPro,
  'Elite': iconNivelElite,
  'Super Treinador': iconNivelSuperTreinador,
  'Lenda da Plataforma': iconNivelLenda,
}

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 48, contorno = '#1C1C1C' }) => (
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

function NavButton({ item, ativo, navigate, naoLidas }) {
  return (
    <button onClick={() => navigate(item.path)} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '4px', background: 'transparent', border: 'none',
      cursor: 'pointer', padding: '0 6px', position: 'relative',
    }}>
      <div style={{ position: 'relative' }}>
        <img src={ativo ? item.iconActive : item.iconNormal} alt={item.label} style={{ width: '44px', height: '44px' }} />
        {item.hasBadge && naoLidas > 0 && (
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

// ★ Posições padronizadas em 4 valores (Goalkeeper/Defender/Midfielder/
// Attacker), mesmo mapeamento já usado em Partida.jsx/Intervalo.jsx.
const POSICAO_LABEL = { Goalkeeper: 'GOL', Defender: 'ZAG', Midfielder: 'MEI', Attacker: 'ATA' }
const COR_POSICAO = { GOL: '#F97316', ZAG: '#3B82F6', MEI: '#10B981', ATA: '#EF4444' }

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

const TIPOS_FORMACAO = {
  '4-4-2':   ['GOL', 'ZAG', 'ZAG', 'ZAG', 'ZAG', 'MEI', 'MEI', 'MEI', 'MEI', 'ATA', 'ATA'],
  '4-3-3':   ['GOL', 'ZAG', 'ZAG', 'ZAG', 'ZAG', 'MEI', 'MEI', 'MEI', 'ATA', 'ATA', 'ATA'],
  '4-2-3-1': ['GOL', 'ZAG', 'ZAG', 'ZAG', 'ZAG', 'MEI', 'MEI', 'MEI', 'MEI', 'MEI', 'ATA'],
  '3-5-2':   ['GOL', 'ZAG', 'ZAG', 'ZAG', 'MEI', 'MEI', 'MEI', 'MEI', 'MEI', 'ATA', 'ATA'],
  '5-3-2':   ['GOL', 'ZAG', 'ZAG', 'ZAG', 'ZAG', 'ZAG', 'MEI', 'MEI', 'MEI', 'ATA', 'ATA'],
}

const GRUPOS_LINHA = ['Defender', 'Midfielder', 'Attacker']

function escalarPorPosicao(titularesAtuais, novaFormacao) {
  const slots = FORMACOES[novaFormacao]
  const goleiro = titularesAtuais.find((j) => j.posicao === 'Goalkeeper')

  const linha = GRUPOS_LINHA.flatMap((grupo) =>
    titularesAtuais.filter((j) => j.posicao === grupo)
  )
  const semGrupoConhecido = titularesAtuais.filter(
    (j) => j.posicao !== 'Goalkeeper' && !GRUPOS_LINHA.includes(j.posicao)
  )

  const ordenado = [
    ...(goleiro ? [goleiro] : []),
    ...linha,
    ...semGrupoConhecido,
  ]

  return ordenado.map((j, i) => {
    const slot = slots[i] ?? { left: 50, top: 50 }
    return { ...j, x: slot.left, y: slot.top }
  })
}

function calcularVagasVazias(titularesAtuais, novaFormacao) {
  const slots = FORMACOES[novaFormacao]
  const usados = new Set()

  titularesAtuais.forEach((jogador) => {
    let melhorIndice = -1
    let melhorDist = Infinity
    slots.forEach((slot, i) => {
      if (usados.has(i)) return
      const dist = Math.hypot(slot.left - (jogador.x ?? 50), slot.top - (jogador.y ?? 50))
      if (dist < melhorDist) {
        melhorDist = dist
        melhorIndice = i
      }
    })
    if (melhorIndice !== -1) usados.add(melhorIndice)
  })

  return slots
    .map((slot, i) => ({ ...slot, indice: i }))
    .filter((slot) => !usados.has(slot.indice))
}

const POLL_NOTIFICACOES_MS = 15000

export default function Elenco() {
  const navigate = useNavigate()
  const path = '/elenco'

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const [meuClube, setMeuClube] = useState(null)
  const [nivel, setNivel] = useState('Iniciante')
  const [formacao, setFormacao] = useState('4-3-3')
  const [titulares, setTitulares] = useState([])
  const [reservas, setReservas] = useState([])
  const [modoEdicao, setModoEdicao] = useState(false)
  const [naoLidas, setNaoLidas] = useState(0)

  const campoRef = useRef(null)
  const bancoRef = useRef(null)
  const draggingRef = useRef(null)
  const ghostRef = useRef(null)
  const pollNotificacoesRef = useRef(null)

  const buscarNaoLidas = useCallback(async () => {
    try {
      const resultado = await apiFetch('/api/notificacoes')
      const lista = resultado?.notificacoes || []
      setNaoLidas(lista.filter(n => !n.lida).length)
    } catch {
      // Badge de notificação não é crítico — se falhar, só não atualiza
      // agora, o próximo polling tenta de novo. Mesma decisão do Painel.jsx.
    }
  }, [])

  useEffect(() => {
    buscarNaoLidas()
    pollNotificacoesRef.current = setInterval(buscarNaoLidas, POLL_NOTIFICACOES_MS)
    return () => clearInterval(pollNotificacoesRef.current)
  }, [buscarNaoLidas])

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      try {
        const [tecnicoData, elencoData] = await Promise.all([
          apiFetch('/api/tecnicos/me', { method: 'GET' }),
          apiFetch('/api/elenco', { method: 'GET' }),
        ])
        if (cancelado) return

        const clube = tecnicoData?.tecnico?.clube_proprio
        if (clube) {
          setMeuClube({
            nome: clube.nome,
            cor1: clube.cor_primaria ?? '#F97316',
            cor2: clube.cor_secundaria ?? '#1C1C1C',
          })
        }
        setNivel(tecnicoData?.tecnico?.nivel_titulo ?? 'Iniciante')

        const formatarComLabel = (j) => ({ ...j, posicaoLabel: POSICAO_LABEL[j.posicao] ?? j.posicao })

        const titularesFormatados = (elencoData.titulares || []).map(formatarComLabel)
        const reservasFormatadas = (elencoData.reservas || []).map(formatarComLabel)

        const todosComPosicaoSalva = titularesFormatados.every(
          (j) => typeof j.x === 'number' && typeof j.y === 'number'
        )
        const titularesComPosicao = todosComPosicaoSalva
          ? titularesFormatados
          : escalarPorPosicao(titularesFormatados, '4-3-3')

        setTitulares(titularesComPosicao)
        setReservas(reservasFormatadas)
        setCarregando(false)
      } catch (e) {
        if (cancelado) return
        setErro(e.message || 'Não foi possível carregar o elenco.')
        setCarregando(false)
      }
    }

    carregar()
    return () => { cancelado = true }
  }, [])

  const mudarFormacao = async (novaFormacao) => {
    if (!modoEdicao || salvando) return
    if (novaFormacao === formacao) return

    if (titulares.length !== 11) {
      setErro(`Seu elenco titular tem ${titulares.length} jogador(es) — são necessários exatamente 11 para trocar de formação. Arraste reservas pro campo primeiro.`)
      return
    }

    const titularesAtualizados = escalarPorPosicao(titulares, novaFormacao)

    const formacaoAnterior = formacao
    const titularesAnteriores = titulares

    setFormacao(novaFormacao)
    setTitulares(titularesAtualizados)
    setSalvando(true)
    setErro(null)

    try {
      const goleiro = titularesAtualizados.find((j) => j.posicao === 'Goalkeeper')
      const outros = titularesAtualizados.filter((j) => j.posicao !== 'Goalkeeper')
      const ordemTitulares = goleiro ? [goleiro.id, ...outros.map((j) => j.id)] : titularesAtualizados.map((j) => j.id)

      await apiFetch('/api/elenco/formacao', {
        method: 'PUT',
        body: { formacao: novaFormacao, ordemTitulares },
      })
    } catch (e) {
      setFormacao(formacaoAnterior)
      setTitulares(titularesAnteriores)
      setErro(e.message || 'Não foi possível trocar a formação.')
    } finally {
      setSalvando(false)
    }
  }

  const criarGhost = (clientX, clientY, jogador) => {
    removerGhost()
    const ghost = document.createElement('div')
    ghost.id = 'drag-ghost'
    ghost.innerHTML = `
      <div style="
        width:44px;height:44px;border-radius:50%;
        background:#1C1C1C;border:3px solid #F97316;
        display:flex;align-items:center;justify-content:center;
        color:white;font-size:11px;font-weight:700;
        box-shadow:0 4px 16px rgba(0,0,0,0.5);
        pointer-events:none;opacity:0.9;
      ">${jogador.nome.slice(0, 2).toUpperCase()}</div>
    `
    ghost.style.cssText = `
      position:fixed;z-index:9999;pointer-events:none;
      transform:translate(-50%,-50%);
      left:${clientX}px;top:${clientY}px;
    `
    document.body.appendChild(ghost)
    ghostRef.current = ghost
  }

  const removerGhost = () => {
    if (ghostRef.current) {
      ghostRef.current.remove()
      ghostRef.current = null
    }
  }

  const salvarReposicionamentoNoCampo = async (titularesAtualizados) => {
    setSalvando(true)
    setErro(null)
    try {
      const goleiro = titularesAtualizados.find((j) => j.posicao === 'Goalkeeper')
      const outros = titularesAtualizados.filter((j) => j.posicao !== 'Goalkeeper')
      const ordemTitulares = goleiro ? [goleiro.id, ...outros.map((j) => j.id)] : titularesAtualizados.map((j) => j.id)

      await apiFetch('/api/elenco/formacao', {
        method: 'PUT',
        body: { formacao, ordemTitulares },
      })
    } catch (e) {
      setErro(e.message || 'Não foi possível salvar a posição.')
    } finally {
      setSalvando(false)
    }
  }

  const salvarSubstituicao = async (idTitularSaindo, idReservaEntrando) => {
    setSalvando(true)
    setErro(null)
    try {
      await apiFetch('/api/elenco/substituicao', {
        method: 'PUT',
        body: { idTitularSaindo, idReservaEntrando },
      })
    } catch (e) {
      setErro(e.message || 'Não foi possível realizar a substituição.')
      try {
        const elencoData = await apiFetch('/api/elenco', { method: 'GET' })
        const formatarComLabel = (j) => ({ ...j, posicaoLabel: POSICAO_LABEL[j.posicao] ?? j.posicao })
        setTitulares((elencoData.titulares || []).map(formatarComLabel))
        setReservas((elencoData.reservas || []).map(formatarComLabel))
      } catch {
        // Se nem isso funcionar, mantém o estado otimista mesmo.
      }
    } finally {
      setSalvando(false)
    }
  }

  const salvarPromocao = async (idReservaEntrando, x, y) => {
    setSalvando(true)
    setErro(null)
    try {
      await apiFetch('/api/elenco/promover', {
        method: 'PUT',
        body: { idReservaEntrando, x, y },
      })
    } catch (e) {
      setErro(e.message || 'Não foi possível promover o jogador a titular.')
      try {
        const elencoData = await apiFetch('/api/elenco', { method: 'GET' })
        const formatarComLabel = (j) => ({ ...j, posicaoLabel: POSICAO_LABEL[j.posicao] ?? j.posicao })
        setTitulares((elencoData.titulares || []).map(formatarComLabel))
        setReservas((elencoData.reservas || []).map(formatarComLabel))
      } catch {
        // mantém estado otimista se nem isso funcionar
      }
    } finally {
      setSalvando(false)
    }
  }

  const finalizarArrasto = (clientX, clientY) => {
    if (!draggingRef.current) return
    const { jogador, origem } = draggingRef.current
    removerGhost()
    draggingRef.current = null

    const campo = campoRef.current
    const banco = bancoRef.current

    if (campo) {
      const rect = campo.getBoundingClientRect()
      if (
        clientX >= rect.left && clientX <= rect.right &&
        clientY >= rect.top && clientY <= rect.bottom
      ) {
        const x = Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100))
        const y = Math.min(95, Math.max(5, ((clientY - rect.top) / rect.height) * 100))

        if (origem === 'campo') {
          const titularesAtualizados = titulares.map((j) => (j.id === jogador.id ? { ...j, x, y } : j))
          setTitulares(titularesAtualizados)
          salvarReposicionamentoNoCampo(titularesAtualizados)
          return
        }

        if (titulares.length < 11) {
          const jaTemGoleiroTitular = titulares.some((t) => t.posicao === 'Goalkeeper')
          if (jogador.posicao === 'Goalkeeper' && jaTemGoleiroTitular) return

          const novoTitular = { ...jogador, x, y }
          setTitulares((prev) => [...prev, novoTitular])
          setReservas((prev) => prev.filter((r) => r.id !== jogador.id))
          salvarPromocao(jogador.id, x, y)
          return
        }

        if (titulares.length === 0) return

        const candidatosMesmaPosicao = titulares.filter((t) => t.posicao === jogador.posicao)
        const pool = candidatosMesmaPosicao.length > 0 ? candidatosMesmaPosicao : titulares

        const maisProximo = pool.reduce((melhor, atual) => {
          const distAtual = Math.hypot((atual.x ?? 50) - x, (atual.y ?? 50) - y)
          const distMelhor = Math.hypot((melhor.x ?? 50) - x, (melhor.y ?? 50) - y)
          return distAtual < distMelhor ? atual : melhor
        }, pool[0])

        if (maisProximo.posicao === 'Goalkeeper' && jogador.posicao !== 'Goalkeeper') return
        if (jogador.posicao === 'Goalkeeper' && maisProximo.posicao !== 'Goalkeeper') return

        const novoTitular = { ...jogador, x: maisProximo.x, y: maisProximo.y }
        setTitulares((prev) => prev.map((t) => (t.id === maisProximo.id ? novoTitular : t)))
        setReservas((prev) => [...prev.filter((r) => r.id !== jogador.id), { ...maisProximo, x: undefined, y: undefined }])
        salvarSubstituicao(maisProximo.id, jogador.id)
        return
      }
    }

    if (banco && origem === 'campo') {
      const rect = banco.getBoundingClientRect()
      if (
        clientX >= rect.left && clientX <= rect.right &&
        clientY >= rect.top && clientY <= rect.bottom
      ) {
        if (reservas.length === 0) return

        const candidatosMesmaPosicao = reservas.filter((r) => r.posicao === jogador.posicao)
        const escolhido = candidatosMesmaPosicao[0] ?? reservas[0]

        if (jogador.posicao === 'Goalkeeper' && escolhido.posicao !== 'Goalkeeper') return
        if (escolhido.posicao === 'Goalkeeper' && jogador.posicao !== 'Goalkeeper') return

        const novoTitular = { ...escolhido, x: jogador.x, y: jogador.y }
        setTitulares((prev) => prev.map((t) => (t.id === jogador.id ? novoTitular : t)))
        setReservas((prev) => [...prev.filter((r) => r.id !== escolhido.id), { ...jogador, x: undefined, y: undefined }])
        salvarSubstituicao(jogador.id, escolhido.id)
      }
    }
  }

  const handlePointerDown = (e, jogador, origem) => {
    if (!modoEdicao || salvando) return
    if (origem === 'campo' && jogador.posicao === 'Goalkeeper') return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    draggingRef.current = { jogador, origem }
    criarGhost(e.clientX, e.clientY, jogador)
  }

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return
    e.preventDefault()
    if (ghostRef.current) {
      ghostRef.current.style.left = `${e.clientX}px`
      ghostRef.current.style.top = `${e.clientY}px`
    }
  }

  const handlePointerUp = (e) => {
    if (!draggingRef.current) return
    e.preventDefault()
    finalizarArrasto(e.clientX, e.clientY)
  }

  const handlePointerCancel = () => {
    removerGhost()
    draggingRef.current = null
  }

  if (carregando) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#9CA3AF' }}>Carregando elenco...</span>
      </div>
    )
  }

  if (erro && titulares.length === 0) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '16px', textAlign: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
        <button onClick={() => navigate('/painel')} style={{ background: '#F97316', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 32px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          VOLTAR
        </button>
      </div>
    )
  }

  const vagasVazias = calcularVagasVazias(titulares, formacao)

  return (
    <div
      style={{
        maxWidth: '480px', margin: '0 auto',
        fontFamily: "'Inter', sans-serif",
        background: '#FFFFFF', height: '100vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >

      {/* HEADER — fixo no topo, não faz parte do miolo que rola */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB',
        background: '#fff', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <EscudoTime cor1={meuClube?.cor1} cor2={meuClube?.cor2} size={48} contorno="#1C1C1C" />
          <div>
            <div style={{ fontSize: '17px', fontWeight: '900', color: '#1C1C1C', lineHeight: '1.2' }}>{meuClube?.nome}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
              <img src={ICONES_NIVEL[nivel] || iconNivelIniciante} alt={nivel} style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '13px', fontWeight: '400', color: '#6B7280' }}>{nivel}</span>
            </div>
          </div>
        </div>
        {salvando && (
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#F97316' }}>Salvando...</span>
        )}
      </div>

      {erro && (
        <div style={{ padding: '6px 16px 0', flexShrink: 0 }}>
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '8px 12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
          </div>
        </div>
      )}

      {/* MIOLO — flex:1 é a peça que faltava: consome exatamente o
          espaço que sobra entre o header e o rodapé, e só rola (scroll)
          se o conteúdo não couber, em vez de deixar vão morto antes do
          rodapé numa tela mais alta. */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        <div style={{ padding: '8px 16px 6px', flexShrink: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', marginBottom: '6px', letterSpacing: '0.5px' }}>
            FORMAÇÃO
          </div>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {Object.keys(FORMACOES).map(f => (
              <button key={f} onClick={() => mudarFormacao(f)} disabled={!modoEdicao || salvando} style={{
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

        <div style={{ padding: '0 16px', flexShrink: 0 }}>
          <div
            ref={campoRef}
            style={{
              position: 'relative', width: '100%', paddingBottom: '110%',
              background: 'linear-gradient(180deg, #2d8a3e 0%, #3a9e4a 25%, #2d8a3e 50%, #3a9e4a 75%, #2d8a3e 100%)',
              borderRadius: '12px', overflow: 'hidden',
              border: '2px solid #1a6b2a', touchAction: 'none',
            }}
          >
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 110" preserveAspectRatio="none">
              <rect x="2" y="2" width="96" height="106" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
              <line x1="2" y1="55" x2="98" y2="55" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
              <circle cx="50" cy="55" r="11" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
              <circle cx="50" cy="55" r="1" fill="rgba(255,255,255,0.5)"/>
              <rect x="22" y="2" width="56" height="17" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
              <rect x="36" y="2" width="28" height="8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
              <rect x="22" y="91" width="56" height="17" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
              <rect x="36" y="101" width="28" height="7" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8"/>
            </svg>

            {vagasVazias.map((vaga) => (
              <div
                key={`vaga-${vaga.indice}`}
                style={{
                  position: 'absolute',
                  left: `${vaga.left}%`, top: `${vaga.top}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '38px', height: '38px', borderRadius: '50%',
                  border: '2px dashed rgba(255,255,255,0.65)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none', zIndex: 1,
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: '700', color: 'rgba(255,255,255,0.75)' }}>
                  {TIPOS_FORMACAO[formacao]?.[vaga.indice] ?? ''}
                </span>
              </div>
            ))}

            {titulares.map(jogador => (
              <div
                key={jogador.id}
                onPointerDown={(e) => handlePointerDown(e, jogador, 'campo')}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                style={{
                  position: 'absolute',
                  left: `${jogador.x}%`, top: `${jogador.y}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
                  cursor: modoEdicao && jogador.posicao !== 'Goalkeeper' ? 'grab' : 'default',
                  userSelect: 'none', touchAction: 'none', zIndex: 2,
                }}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  border: jogador.lesionado ? '2px solid #EF4444' : '2px solid white',
                  overflow: 'hidden', background: '#1C1C1C',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                }}>
                  <img src={jogador.foto} alt={jogador.nome}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=1C1C1C&color=fff&bold=true&size=38` }}
                  />
                </div>
                <div style={{ background: 'rgba(0,0,0,0.8)', borderRadius: '4px', padding: '1px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', maxWidth: '54px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {jogador.tem_estrela ? '⭐' : ''}{jogador.nome}
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: '900', color: '#fff' }}>{jogador.overall}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '6px 16px 0', flexShrink: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', marginBottom: '5px', letterSpacing: '0.5px' }}>
            RESERVAS
          </div>
          <div
            ref={bancoRef}
            style={{
              display: 'flex', gap: '6px', overflowX: 'auto',
              scrollbarWidth: 'none', minHeight: '85px',
              background: modoEdicao ? 'rgba(249,115,22,0.05)' : 'transparent',
              border: modoEdicao ? '1.5px dashed rgba(249,115,22,0.4)' : '1.5px solid transparent',
              borderRadius: '10px', padding: '4px',
              transition: 'all 0.2s',
            }}
          >
            {reservas.map(jogador => (
              <div
                key={jogador.id}
                onPointerDown={(e) => handlePointerDown(e, jogador, 'banco')}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                style={{
                  flexShrink: 0, width: '68px',
                  background: '#F5F5F5', border: '1.5px solid #E5E7EB',
                  borderRadius: '10px', padding: '6px 4px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  cursor: modoEdicao ? 'grab' : 'default',
                  touchAction: 'none', userSelect: 'none',
                  opacity: jogador.lesionado || jogador.em_fortalecimento ? 0.5 : 1,
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', background: '#1C1C1C', border: '2px solid #fff' }}>
                  <img src={jogador.foto} alt={jogador.nome}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=1C1C1C&color=fff&bold=true&size=38` }}
                  />
                </div>
                <div style={{ fontSize: '9px', fontWeight: '600', color: '#1C1C1C', textAlign: 'center', lineHeight: '12px' }}>
                  {jogador.tem_estrela ? '⭐' : ''}{jogador.nome.split(' ')[0]}
                </div>
                <div style={{ fontSize: '10px', fontWeight: '700', color: COR_POSICAO[jogador.posicaoLabel] }}>{jogador.posicaoLabel}</div>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#1C1C1C' }}>{jogador.overall}</div>
              </div>
            ))}

            <div onClick={() => navigate('/mercado')} style={{
              flexShrink: 0, width: '68px',
              background: '#F5F5F5', border: '1.5px dashed #E5E7EB',
              borderRadius: '10px', padding: '6px 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '4px', cursor: 'pointer',
            }}>
              <span style={{ fontSize: '22px', color: '#9CA3AF', lineHeight: 1 }}>+</span>
              <span style={{ fontSize: '10px', fontWeight: '600', color: '#9CA3AF' }}>Mais</span>
            </div>
          </div>
        </div>

        {/* Espaçador flexível — se o conteúdo acima for curto (ex.: poucas
            reservas), empurra o botão pro rodapé colado no miolo, em vez
            de deixar ele flutuando no meio de um vão vazio. */}
        <div style={{ flex: 1, minHeight: '8px' }} />

        <div style={{ padding: '6px 16px', flexShrink: 0 }}>
          <button
            onClick={() => setModoEdicao((prev) => !prev)}
            disabled={salvando}
            style={{
              width: '100%',
              background: modoEdicao ? '#10B981' : '#F97316',
              color: '#fff', border: 'none', borderRadius: '12px', padding: '13px',
              fontSize: '15px', fontWeight: '700', letterSpacing: '1px',
              cursor: salvando ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif",
              transition: 'background 0.2s', opacity: salvando ? 0.7 : 1,
            }}
          >
            {modoEdicao ? 'CONCLUIR EDIÇÃO' : 'EDITAR ELENCO'}
          </button>
        </div>

      </div>

      {/* BOTTOM NAV — flexShrink:0, sempre colado embaixo agora que o
          miolo acima consome o resto do espaço. */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
        padding: '8px 0 10px', borderTop: '1px solid #E5E7EB', background: 'white',
        flexShrink: 0,
      }}>
        {NAV_ITEMS_ESQUERDA.map(item => (
          <NavButton key={item.label} item={item} ativo={item.path === path} navigate={navigate} naoLidas={naoLidas} />
        ))}
        <BotaoJogar ativo={path === '/jogar'} navigate={navigate} />
        {NAV_ITEMS_DIREITA.map(item => (
          <NavButton key={item.label} item={item} ativo={item.path === path} navigate={navigate} naoLidas={naoLidas} />
        ))}
      </div>

    </div>
  )
}