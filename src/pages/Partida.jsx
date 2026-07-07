// src/pages/Partida.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { getTecnicoMe } from '../lib/cacheTecnico'
import {
  assinarPartida,
  buscarPartidaAtual,
  buscarEventosDaPartida,
  buscarClube,
  descobrirPartidaAtivaDoTecnico,
} from '../lib/partidaRealtime'
import { escolherBatedorPenalti, escolherSubstituto, pausarManual, heartbeatDecisao } from '../lib/partidaApi'
import mascote from '../assets/busto_apito.png'

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
import iconBallOrange from '../assets/icons/icon-ball-orange.png'
import iconInjury from '../assets/icons/lesao.png'
import iconGol from '../assets/icons/golnarrado.png'
import iconAmarelo from '../assets/icons/cartaoamarelo.png'
import iconVermelho from '../assets/icons/cartaovermelho.png'
import iconPenalti from '../assets/icons/penalidade.png'
import iconMicrofone from '../assets/icons/narrador.png'
import iconFalta from '../assets/icons/falta.png'

const NAV_ITEMS_ESQUERDA = [
  { iconNormal: iconHomeCinza,  iconActive: iconHomeLaranja,  label: 'Início',    path: '/painel',    hasBadge: false },
  { iconNormal: iconBalaoCinza, iconActive: iconBalaoLaranja, label: 'Vestiário', path: '/vestiario', hasBadge: true  },
]

const NAV_ITEMS_DIREITA = [
  { iconNormal: iconTrofeuCinza, iconActive: iconTrofeuLaranja, label: 'Liga',   path: '/liga-privada', hasBadge: false },
  { iconNormal: iconPerfilCinza, iconActive: iconPerfilLaranja, label: 'Perfil', path: '/perfil',       hasBadge: false },
]

const POSICAO_LABEL = { Goalkeeper: 'GOL', Defender: 'ZAG', Midfielder: 'MEI', Attacker: 'ATA' }
const DURACAO_SEM_ACAO = 10
const DURACAO_COM_ACAO = 15
const LIMITE_SUBSTITUICOES_PARTIDA = 5

// ★ 06/07/2026 — Ritmo de Leitura (Etapa 3). Eventos que chegam do
// realtime não são mais aplicados na tela na hora: entram numa fila
// (filaEventosRef) e são revelados um de cada vez, no ritmo abaixo.
// Placar/domínio/forças/fase viram "estado pausado no tempo" — só
// avançam junto com o evento que sai da fila, nunca antes.
const TEMPO_BASE_EVENTO_MS = 2800
const TEMPO_MINIMO_LEITURA_MS = 1300
const TAMANHO_FILA_PARA_ACELERACAO_MAXIMA = 6
const TIPOS_QUE_NUNCA_ACELERAM = new Set([
  'gol', 'penalti_marcado', 'penalti_sinalizado', 'penalti_perdido', 'cartao_vermelho',
])

// Atraso acumulado (fila grande) reduz o tempo por evento, mas nunca
// abaixo do mínimo pra dar tempo de ler — e gol/pênalti/cartão vermelho
// sempre recebem o tempo cheio, não importa o tamanho da fila.
function calcularDelayProximoEvento(tipoEvento, tamanhoFilaRestante) {
  if (TIPOS_QUE_NUNCA_ACELERAM.has(tipoEvento)) return TEMPO_BASE_EVENTO_MS
  const fatorAtraso = Math.min(1, tamanhoFilaRestante / TAMANHO_FILA_PARA_ACELERACAO_MAXIMA)
  return Math.round(TEMPO_BASE_EVENTO_MS - fatorAtraso * (TEMPO_BASE_EVENTO_MS - TEMPO_MINIMO_LEITURA_MS))
}

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor1}/>
    <path d="M32 2V70C48 66 60 54 60 38V14L32 2Z" fill={cor2}/>
    <line x1="32" y1="2" x2="32" y2="70" stroke="#1C1C1C" strokeWidth="2"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke="#1C1C1C" strokeWidth="3" fill="none"/>
  </svg>
)

const EscudoGenerico = ({ size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill="#3B82F6"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke="white" strokeWidth="3" fill="none"/>
    <circle cx="32" cy="37" r="14" fill="white"/>
    <circle cx="32" cy="37" r="5" fill="#1C1C1C"/>
  </svg>
)

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

export default function Partida() {
  const navigate = useNavigate()
  const location = useLocation()
  const partidaIdRecebido = location.state?.partidaId

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [mostrandoIntroducao, setMostrandoIntroducao] = useState(false)
  const DURACAO_INTRODUCAO_MS = 3500

  const [partidaId, setPartidaId] = useState(partidaIdRecebido ?? null)
  const [meuLado, setMeuLado] = useState(null)
  const [meuClube, setMeuClube] = useState(null)
  const [adversario, setAdversario] = useState(null)
  const idsMeusJogadoresRef = useRef(new Set())

  const [placarHome, setPlacarHome] = useState(0)
  const [placarFora, setPlacarFora] = useState(0)
  const [fase, setFase] = useState('primeiro')
  const [tickAtual, setTickAtual] = useState(0)
  const [tickVisual, setTickVisual] = useState(0)
  const [eventos, setEventos] = useState([])
  const eventosRef = useRef(null)

  // ★ Ritmo de Leitura — ver constantes/comentário acima.
  const filaEventosRef = useRef([])
  const processandoFilaRef = useRef(false)
  const transicaoPendenteRef = useRef(null)
  const timeoutFilaRef = useRef(null)
  const snapshotMaisRecenteRef = useRef(null)

  const [forcaAtaque, setForcaAtaque] = useState(null)
  const [forcaMeio, setForcaMeio] = useState(null)
  const [forcaDefesa, setForcaDefesa] = useState(null)
  const [dominioAtual, setDominioAtual] = useState(50)

  const [substituicoesUsadas, setSubstituicoesUsadas] = useState(0)
  const [pausandoManual, setPausandoManual] = useState(false)

  const [penaltiAberto, setPenaltiAberto] = useState(false)
  const [titularesParaPenalti, setTitularesParaPenalti] = useState([])
  const interagiuPenaltiRef = useRef(false)
  const tempoTotalPenaltiRef = useRef(DURACAO_SEM_ACAO)
  const tempoRestantePenaltiRef = useRef(DURACAO_SEM_ACAO)
  const [tempoPenalti, setTempoPenalti] = useState(DURACAO_SEM_ACAO)
  const [tempoTotalPenalti, setTempoTotalPenalti] = useState(DURACAO_SEM_ACAO)
  const timerPenaltiRef = useRef(null)

  const [lesaoAberto, setLesaoAberto] = useState(false)
  const [reservasParaLesao, setReservasParaLesao] = useState([])
  const [jogadorLesionadoNome, setJogadorLesionadoNome] = useState(null)
  const interagiuLesaoRef = useRef(false)
  const tempoTotalLesaoRef = useRef(DURACAO_SEM_ACAO)
  const tempoRestanteLesaoRef = useRef(DURACAO_SEM_ACAO)
  const [tempoLesao, setTempoLesao] = useState(DURACAO_SEM_ACAO)
  const [tempoTotalLesao, setTempoTotalLesao] = useState(DURACAO_SEM_ACAO)
  const timerLesaoRef = useRef(null)

  const [fala, setFala] = useState('Vamos com calma, analisando o jogo...')

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

        const [tecnicoData, partida] = await Promise.all([
          getTecnicoMe(),
          buscarPartidaAtual(idDaPartida),
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

        const idAdversario = lado === 'home' ? partida.clube_away_id : partida.clube_home_id
        const clubeAdversario = await buscarClube(idAdversario)
        if (cancelado) return

        const meusJogadores = (lado === 'home' ? partida.dados_jogadores_home : partida.dados_jogadores_away) || []
        idsMeusJogadoresRef.current = new Set(meusJogadores.map((j) => j.id))

        setPartidaId(idDaPartida)
        setMeuLado(lado)
        setMeuClube({ nome: clube.nome, cor1: clube.cor_primaria ?? '#F97316', cor2: clube.cor_secundaria ?? '#1C1C1C' })
        setAdversario({ nome: clubeAdversario.nome, escudoUrl: clubeAdversario.escudo_url ?? null })

        aplicarSnapshotPartida(partida, lado)
        snapshotMaisRecenteRef.current = partida

        const eventosExistentes = await buscarEventosDaPartida(idDaPartida)
        if (cancelado) return
        setEventos((eventosExistentes || []).map((ev) => formatarEvento(ev, lado, idsMeusJogadoresRef.current)))

        const partidaRealmenteNova = (partida.tempo_atual ?? 0) <= 1 && (eventosExistentes || []).length === 0
        if (partidaRealmenteNova) {
          setMostrandoIntroducao(true)
          setTimeout(() => {
            if (!cancelado) setMostrandoIntroducao(false)
          }, DURACAO_INTRODUCAO_MS)
        }

        setCarregando(false)
      } catch (e) {
        if (cancelado) return
        setErro(e.message || 'Não foi possível carregar a partida.')
        setCarregando(false)
      }
    }

    carregar()
    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function aplicarSnapshotPartida(partida, lado) {
    setPlacarHome(partida.placar_home ?? 0)
    setPlacarFora(partida.placar_away ?? 0)
    setFase(partida.fase ?? 'primeiro')
    setTickAtual(partida.tempo_atual ?? 0)
    setTickVisual(partida.tempo_atual ?? 0)
    setDominioAtual(partida.dominio_atual ?? 50)
    setSubstituicoesUsadas((lado === 'away' ? partida.substituicoes_usadas_away : partida.substituicoes_usadas_home) ?? 0)

    if (lado === 'away') {
      setForcaAtaque(partida.forca_ataque_away)
      setForcaMeio(partida.forca_meio_away)
      setForcaDefesa(partida.forca_defesa_away)
    } else {
      setForcaAtaque(partida.forca_ataque_home)
      setForcaMeio(partida.forca_meio_home)
      setForcaDefesa(partida.forca_defesa_home)
    }
  }

  useEffect(() => {
    if (!partidaId || !meuLado) return

    // Descobre que tipo de transição (intervalo/pênalti/fim) a nova linha
    // pede, sem executá-la — só é executada quando a fila de eventos
    // esvaziar (função abaixo), pra nunca "pular" o jogador pra tela
    // seguinte com eventos ainda não revelados.
    function detectarTransicao(novaLinha) {
      const souEuQuemPausou = novaLinha.lado_pausado === meuLado
      if (novaLinha.pausada && novaLinha.motivo_pausa === 'lesao' && souEuQuemPausou) return 'lesao'
      if (novaLinha.pausada && novaLinha.motivo_pausa === 'manual') return 'intervalo'
      if (novaLinha.fase === 'intervalo') return 'intervalo'
      if (novaLinha.pausada && novaLinha.motivo_pausa === 'penalti' && souEuQuemPausou) return 'penalti'
      if (novaLinha.fase === 'fim') return 'fim'
      return null
    }

    function tentarExecutarTransicaoPendente() {
      const pendente = transicaoPendenteRef.current
      if (!pendente || filaEventosRef.current.length > 0) return
      transicaoPendenteRef.current = null
      aplicarSnapshotPartida(pendente.linha, meuLado)
      if (pendente.tipo === 'penalti') abrirModalPenalti(pendente.linha)
      else if (pendente.tipo === 'lesao') abrirModalLesao(pendente.linha)
      else if (pendente.tipo === 'intervalo') navigate('/intervalo', { state: { partidaId } })
      else if (pendente.tipo === 'fim') navigate('/resultado-partida', { state: { partidaId } })
    }

    function processarProximoDaFila() {
      const fila = filaEventosRef.current
      if (fila.length === 0) {
        processandoFilaRef.current = false
        tentarExecutarTransicaoPendente()
        return
      }
      const item = fila.shift()
      aplicarSnapshotPartida(item.snapshot, meuLado)
      setEventos((prev) => [...prev, item.evento])
      atualizarFala(item.evento, meuLado, idsMeusJogadoresRef.current)

      const delay = calcularDelayProximoEvento(item.evento.tipo, fila.length)
      timeoutFilaRef.current = setTimeout(processarProximoDaFila, delay)
    }

    function iniciarProcessamentoSeNecessario() {
      if (processandoFilaRef.current) return
      processandoFilaRef.current = true
      processarProximoDaFila()
    }

    const cancelar = assinarPartida(partidaId, {
      onPartidaAtualizada: (novaLinha) => {
        snapshotMaisRecenteRef.current = novaLinha
        const tipo = detectarTransicao(novaLinha)
        if (tipo) {
          transicaoPendenteRef.current = { tipo, linha: novaLinha }
          if (!processandoFilaRef.current) tentarExecutarTransicaoPendente()
        }
      },
      onNovoEvento: (novoEvento) => {
        filaEventosRef.current.push({
          evento: formatarEvento(novoEvento, meuLado, idsMeusJogadoresRef.current),
          snapshot: snapshotMaisRecenteRef.current,
        })
        iniciarProcessamentoSeNecessario()
      },
    })

    return () => {
      cancelar()
      clearTimeout(timeoutFilaRef.current)
      processandoFilaRef.current = false
      filaEventosRef.current = []
      transicaoPendenteRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partidaId, meuLado])

  useEffect(() => {
    if (eventosRef.current) eventosRef.current.scrollTop = eventosRef.current.scrollHeight
  }, [eventos])

  useEffect(() => {
    if (fase === 'intervalo' || fase === 'fim') return
    const intervalId = setInterval(() => {
      setTickVisual((atual) => Math.min(atual + 1, tickAtual + 1))
    }, 1000)
    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, tickAtual])

  function formatarEvento(ev, lado, idsMeus) {
    const ehMeu = ev.lado
      ? ev.lado === lado
      : (ev.elenco_jogador_id ? idsMeus.has(ev.elenco_jogador_id) : null)

    const titulos = {
      gol: ehMeu === null ? 'GOOOL!!!' : ehMeu ? 'GOOOL DO SEU TIME!!!' : 'GOOOL DO ADVERSÁRIO!!!',
      cartao_amarelo: 'Cartão amarelo',
      cartao_vermelho: 'Cartão vermelho — expulsão!',
      lesao: ehMeu ? 'Lesão no seu time' : 'Lesão no adversário',
      lesao_iniciada: ehMeu ? 'Atenção no seu time...' : 'Atenção no time adversário...',
      substituicao: 'Substituição',
      penalti_sinalizado: ehMeu === null ? 'PÊNALTI!!!' : ehMeu ? 'PÊNALTI PARA O SEU TIME!!!' : 'PÊNALTI PARA O ADVERSÁRIO!!!',
      penalti_marcado: ehMeu === null ? 'GOOOL DE PÊNALTI!!!' : ehMeu ? 'GOOOL DE PÊNALTI DO SEU TIME!!!' : 'GOOOL DE PÊNALTI DO ADVERSÁRIO!!!',
      penalti_perdido: ehMeu ? 'Seu time perdeu o pênalti' : 'Adversário perdeu o pênalti',
      jogada_saida: 'Saída de bola',
      jogada_construcao: 'Construção',
      jogada_continuacao: 'Jogada em andamento',
      jogada_progressao: ehMeu ? 'Seu time ataca!' : 'Adversário ataca!',
      jogada_desarme: ehMeu ? 'Recuperamos a bola' : 'Adversário recuperou',
      jogada_pressao: ehMeu ? 'Pressão do adversário' : 'Pressão do seu time',
      jogada_fora: 'Chute para fora',
      jogada_defesa: ehMeu ? 'Defesa do adversário' : 'Boa defesa!',
      jogada_escanteio: 'Escanteio!',
      disputa_dura: 'Disputa de bola',
      falta: 'Falta marcada',
    }
    return {
      id: ev.id,
      tipo: ev.tipo,
      minuto: ev.minuto,
      titulo: titulos[ev.tipo] ?? ev.tipo,
      descricao: ev.descricao,
      ehMeu,
    }
  }

  function atualizarFala(ev, lado, idsMeus) {
    const ehMeu = ev.lado ? ev.lado === lado : (ev.elenco_jogador_id ? idsMeus.has(ev.elenco_jogador_id) : null)
    if (ev.tipo === 'gol' || ev.tipo === 'penalti_marcado') setFala(ehMeu ? 'Que golaço! Vamos manter esse ritmo!' : 'Tranquilo, ainda temos tempo. Foco na próxima jogada.')
    else if (ev.tipo === 'cartao_vermelho') setFala('Com um a menos, precisamos ajustar o time.')
    else if (ev.tipo === 'lesao' && ehMeu) setFala('Perdemos um jogador. Hora de pensar na substituição.')
    else if (ev.tipo === 'penalti_sinalizado' && ehMeu) setFala('Pênalti a nosso favor! Escolha bem quem vai cobrar.')
    else if (ev.tipo === 'jogada_progressao' && ehMeu) setFala('Estamos chegando lá! Vamos com calma.')
    else if (ev.tipo === 'jogada_progressao' && !ehMeu) setFala('Atenção na marcação, eles estão perigosos.')
  }

  const abrirModalPenalti = async (partida) => {
    try {
      const meusJogadores = (meuLado === 'away' ? partida.dados_jogadores_away : partida.dados_jogadores_home) || []
      const elencoData = await apiFetch('/api/elenco', { method: 'GET' }).catch(() => null)
      const fotosPorId = new Map()
      if (elencoData) {
        for (const j of [...(elencoData.titulares || []), ...(elencoData.reservas || [])]) {
          fotosPorId.set(j.id, j.foto)
        }
      }
      const titularesDeLinha = meusJogadores
        .filter((j) => j.titular !== false && j.posicao !== 'Goalkeeper')
        .map((j) => ({
          id: j.id,
          nome: j.nome,
          posicao: POSICAO_LABEL[j.posicao] ?? j.posicao,
          finalizacao: j.finalizacao,
          foto: fotosPorId.get(j.id) ?? null,
        }))
        .sort((a, b) => (b.finalizacao ?? 0) - (a.finalizacao ?? 0))

      setTitularesParaPenalti(titularesDeLinha)
      interagiuPenaltiRef.current = false
      tempoTotalPenaltiRef.current = DURACAO_SEM_ACAO
      tempoRestantePenaltiRef.current = DURACAO_SEM_ACAO
      setTempoTotalPenalti(DURACAO_SEM_ACAO)
      setTempoPenalti(DURACAO_SEM_ACAO)
      setPenaltiAberto(true)
    } catch (e) {
      setErro('Não foi possível carregar os jogadores para o pênalti.')
    }
  }

  useEffect(() => {
    if (!penaltiAberto) return
    timerPenaltiRef.current = setInterval(() => {
      tempoRestantePenaltiRef.current -= 1
      setTempoPenalti(tempoRestantePenaltiRef.current)
    }, 1000)
    return () => clearInterval(timerPenaltiRef.current)
  }, [penaltiAberto])

  const registrarInteracaoPenalti = () => {
    if (!interagiuPenaltiRef.current) {
      interagiuPenaltiRef.current = true
      tempoTotalPenaltiRef.current = DURACAO_COM_ACAO
      tempoRestantePenaltiRef.current = DURACAO_COM_ACAO
      setTempoTotalPenalti(DURACAO_COM_ACAO)
      setTempoPenalti(DURACAO_COM_ACAO)
      heartbeatDecisao(partidaId).catch(() => {})
    }
  }

  const escolherBatedor = async (jogador) => {
    try {
      clearInterval(timerPenaltiRef.current)
      setPenaltiAberto(false)
      await escolherBatedorPenalti(partidaId, jogador.id)
    } catch (e) {
      setErro(e.message || 'Não foi possível confirmar o batedor.')
    }
  }

  const abrirModalLesao = async (partida) => {
    try {
      const meusJogadores = (meuLado === 'away' ? partida.dados_jogadores_away : partida.dados_jogadores_home) || []
      const lesionado = meusJogadores.find((j) => j.aguardandoSubstituicao === true)
      setJogadorLesionadoNome(lesionado?.nome ?? null)

      const elencoData = await apiFetch('/api/elenco', { method: 'GET' }).catch(() => null)
      const fotosPorId = new Map()
      if (elencoData) {
        for (const j of [...(elencoData.titulares || []), ...(elencoData.reservas || [])]) {
          fotosPorId.set(j.id, j.foto)
        }
      }
      const reservasDeLinha = meusJogadores
        .filter((j) => j.titular === false)
        .map((j) => ({
          id: j.id,
          nome: j.nome,
          posicao: POSICAO_LABEL[j.posicao] ?? j.posicao,
          overall: j.overall ?? null,
          foto: fotosPorId.get(j.id) ?? null,
        }))
        .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))

      setReservasParaLesao(reservasDeLinha)
      interagiuLesaoRef.current = false
      tempoTotalLesaoRef.current = DURACAO_SEM_ACAO
      tempoRestanteLesaoRef.current = DURACAO_SEM_ACAO
      setTempoTotalLesao(DURACAO_SEM_ACAO)
      setTempoLesao(DURACAO_SEM_ACAO)
      setLesaoAberto(true)
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar os jogadores para a substituição.')
    }
  }

  useEffect(() => {
    if (!lesaoAberto) return
    timerLesaoRef.current = setInterval(() => {
      tempoRestanteLesaoRef.current -= 1
      setTempoLesao(tempoRestanteLesaoRef.current)
    }, 1000)
    return () => clearInterval(timerLesaoRef.current)
  }, [lesaoAberto])

  const registrarInteracaoLesao = () => {
    if (!interagiuLesaoRef.current) {
      interagiuLesaoRef.current = true
      tempoTotalLesaoRef.current = DURACAO_COM_ACAO
      tempoRestanteLesaoRef.current = DURACAO_COM_ACAO
      setTempoTotalLesao(DURACAO_COM_ACAO)
      setTempoLesao(DURACAO_COM_ACAO)
      heartbeatDecisao(partidaId).catch(() => {})
    }
  }

  const escolherSubstitutoNoPopup = async (jogador) => {
    try {
      clearInterval(timerLesaoRef.current)
      setLesaoAberto(false)
      await escolherSubstituto(partidaId, jogador.id)
    } catch (e) {
      setErro(e.message || 'Não foi possível confirmar o substituto.')
    }
  }

  const limiteAtingidoNoTempo = false
  const handleSolicitarPausaManual = async () => {
    setPausandoManual(true)
    setErro(null)
    try {
      await pausarManual(partidaId)
    } catch (e) {
      setErro(e.message || 'Não foi possível pausar a partida agora.')
      setPausandoManual(false)
    }
  }

  const corPorTime = (ehMeu) => {
    if (ehMeu === true) return { bg: '#ECFDF5', border: '#10B981' };
    if (ehMeu === false) return { bg: '#FEF2F2', border: '#EF4444' };
    return { bg: '#F3F4F6', border: '#9CA3AF' };
  };

  const ICONE_POR_TIPO_EVENTO = {
    gol: iconGol, penalti_marcado: iconGol,
    penalti_sinalizado: iconPenalti, penalti_perdido: iconPenalti,
    cartao_amarelo: iconAmarelo,
    cartao_vermelho: iconVermelho,
    falta: iconFalta,
  }

  const iconeEvento = (tipo, ehMeu) => {
    const { bg, border } = corPorTime(ehMeu);
    const src = ICONE_POR_TIPO_EVENTO[tipo] ?? iconMicrofone;
    return (
      <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${border}`, background: bg, flexShrink: 0 }}>
        <img src={src} alt={tipo} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
      </div>
    );
  };

  const TICK_FIM_PRIMEIRO_TEMPO = 30
  const minutoJogo = fase === 'primeiro'
    ? Math.round((tickVisual / TICK_FIM_PRIMEIRO_TEMPO) * 45)
    : fase === 'segundo'
      ? 45 + Math.round(((tickVisual - TICK_FIM_PRIMEIRO_TEMPO) / TICK_FIM_PRIMEIRO_TEMPO) * 45)
      : 90
  const progressoPct = fase === 'fim' ? 100 : Math.min(100, (minutoJogo / 90) * 100)
  const pctMeuTime = meuLado === 'away' ? 100 - dominioAtual : dominioAtual

  const pctPenalti = (tempoPenalti / tempoTotalPenalti) * 100
  const corBarraPenalti = pctPenalti > 50 ? '#10B981' : pctPenalti > 25 ? '#F59E0B' : '#EF4444'

  const pctLesao = (tempoLesao / tempoTotalLesao) * 100
  const corBarraLesao = pctLesao > 50 ? '#10B981' : pctLesao > 25 ? '#F59E0B' : '#EF4444'

  const substituicoesRestantes = LIMITE_SUBSTITUICOES_PARTIDA - substituicoesUsadas

  if (erro && carregando) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: '#fff', height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '16px', textAlign: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
        <button onClick={() => navigate('/jogar')} style={{ background: '#F97316', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 32px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          VOLTAR
        </button>
      </div>
    )
  }

  if (carregando) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: '#fff', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#9CA3AF' }}>Carregando partida...</span>
      </div>
    )
  }

  if (mostrandoIntroducao) {
    return (
      <div style={{
        maxWidth: '480px', margin: '0 auto',
        fontFamily: "'Inter', sans-serif",
        background: '#1C1C1C', height: '100dvh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '24px', padding: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <EscudoTime cor1={meuClube.cor1} cor2={meuClube.cor2} size={64} />
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#fff', textAlign: 'center' }}>{meuClube.nome.toUpperCase()}</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#F97316' }}>x</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {adversario.escudoUrl ? (
              <img src={adversario.escudoUrl} alt={adversario.nome} style={{ width: 64, height: 64, objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
            ) : <EscudoGenerico size={64} />}
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#fff', textAlign: 'center' }}>{adversario.nome.toUpperCase()}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '6px' }}>
            Tudo pronto para começar!
          </div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#F97316' }}>
            Juiz apita... bola rolando!
          </div>
        </div>

        <img src={mascote} alt="Seu Mister" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#FFFFFF', height: '100dvh',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      position: 'relative',
    }}>

      <div style={{ background: '#F5F5F5', padding: '10px 20px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: 1 }}>
            {meuLado === 'home' ? (
              <EscudoTime cor1={meuClube.cor1} cor2={meuClube.cor2} size={36} />
            ) : (
              adversario.escudoUrl ? (
                <img src={adversario.escudoUrl} alt={adversario.nome} style={{ width: 36, height: 36, objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
              ) : <EscudoGenerico size={36} />
            )}
            <span style={{ fontSize: '9px', fontWeight: '900', color: '#1C1C1C', textAlign: 'center' }}>
              {(meuLado === 'home' ? meuClube.nome : adversario.nome).toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '30px', fontWeight: '900', color: '#1C1C1C', lineHeight: 1 }}>
                {placarHome}
              </span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#F97316', lineHeight: 1 }}>x</span>
              <span style={{ fontSize: '30px', fontWeight: '900', color: '#1C1C1C', lineHeight: 1 }}>
                {placarFora}
              </span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#F97316' }}>
              {fase === 'fim' ? 'FIM DE JOGO' : `${minutoJogo}' · ${fase === 'primeiro' ? '1º TEMPO' : '2º TEMPO'}`}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flex: 1 }}>
            {meuLado === 'away' ? (
              <EscudoTime cor1={meuClube.cor1} cor2={meuClube.cor2} size={36} />
            ) : (
              adversario.escudoUrl ? (
                <img src={adversario.escudoUrl} alt={adversario.nome} style={{ width: 36, height: 36, objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none' }} />
              ) : <EscudoGenerico size={36} />
            )}
            <span style={{ fontSize: '9px', fontWeight: '900', color: '#1C1C1C', textAlign: 'center' }}>
              {(meuLado === 'away' ? meuClube.nome : adversario.nome).toUpperCase()}
            </span>
          </div>
        </div>
        <div style={{ height: '3px', background: '#E5E7EB' }}>
          <div style={{ height: '100%', background: '#F97316', width: `${progressoPct}%`, transition: 'width 1s linear' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
          <div style={{ flex: 1, height: '5px', borderRadius: '99px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${pctMeuTime}%`, background: '#10B981', height: '100%', transition: 'width 0.6s ease' }} />
            <div style={{ width: `${100 - pctMeuTime}%`, background: '#EF4444', height: '100%', transition: 'width 0.6s ease' }} />
          </div>
        </div>
      </div>

      {typeof forcaAtaque === 'number' && (
        <div style={{ display: 'flex', gap: '6px', padding: '6px 16px 0', flexShrink: 0 }}>
          {[
            { label: 'ATQ', valor: forcaAtaque, cor: '#EF4444' },
            { label: 'MEI', valor: forcaMeio, cor: '#F59E0B' },
            { label: 'DEF', valor: forcaDefesa, cor: '#3B82F6' },
          ].map((f) => (
            <div key={f.label} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '7px', fontWeight: '700', color: '#9CA3AF', flexShrink: 0 }}>{f.label}</span>
              <div style={{ flex: 1, height: '3px', borderRadius: '99px', background: '#E5E7EB', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, f.valor ?? 0)}%`, height: '100%', background: f.cor, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '8px 16px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ border: '1.5px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div ref={eventosRef} style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {eventos.length === 0 && (
              <div style={{ padding: '10px', textAlign: 'center', color: '#9CA3AF', fontSize: '11px' }}>
                A partida está começando...
              </div>
            )}
            {eventos.map((ev, idx) => {
              const ehFaseDiscreta = ['jogada_saida', 'jogada_construcao', 'jogada_continuacao', 'jogada_pressao'].includes(ev.tipo)
              const ehGol = ev.tipo === 'gol' || ev.tipo === 'penalti_marcado' || ev.tipo === 'penalti_sinalizado'
              const fundoLinha = ev.ehMeu === true ? '#ECFDF5' : ev.ehMeu === false ? '#FEF2F2' : 'transparent'
              return (
                <div key={ev.id} style={{
                  padding: ehGol ? '8px 12px' : '5px 12px',
                  borderBottom: idx < eventos.length - 1 ? '1px solid #F5F5F5' : 'none',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: ehGol ? (ev.ehMeu ? '#D1FAE5' : '#FEE2E2') : fundoLinha,
                }}>
                  {iconeEvento(ev.tipo, ev.ehMeu)}
                  <span style={{ fontSize: '10px', fontWeight: '800', color: ehGol ? (ev.ehMeu ? '#10B981' : '#EF4444') : '#F97316', flexShrink: 0 }}>{ev.minuto}'</span>
                  <span style={{
                    fontSize: ehGol ? '12px' : '11px',
                    fontWeight: ehGol ? '900' : ehFaseDiscreta ? '500' : '700',
                    color: ehGol ? (ev.ehMeu ? '#10B981' : '#EF4444') : '#1C1C1C',
                  }}>
                    {ehGol ? ev.titulo : (ev.descricao || ev.titulo)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {erro && !carregando && (
        <div style={{ padding: '6px 16px', flexShrink: 0 }}>
          <div style={{ background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '10px', padding: '8px 12px' }}>
            <span style={{ fontSize: '11px', color: '#9A5B13', fontWeight: '600' }}>{erro}</span>
          </div>
        </div>
      )}

      <div style={{ padding: '8px 16px', flexShrink: 0 }}>
        <div style={{ border: '1.5px solid #E5E7EB', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280' }}>
            {fase === 'fim'
              ? 'Partida encerrada'
              : `${substituicoesRestantes} substituiç${substituicoesRestantes === 1 ? 'ão' : 'ões'} restante${substituicoesRestantes === 1 ? '' : 's'}`}
          </span>
          <button
            onClick={handleSolicitarPausaManual}
            disabled={pausandoManual || fase === 'fim' || fase === 'intervalo'}
            style={{
              background: pausandoManual || fase === 'fim' || fase === 'intervalo' ? '#E5E7EB' : '#F97316',
              color: pausandoManual || fase === 'fim' || fase === 'intervalo' ? '#9CA3AF' : '#fff',
              border: 'none', borderRadius: '8px', padding: '7px 12px',
              fontSize: '12px', fontWeight: '700',
              cursor: pausandoManual || fase === 'fim' || fase === 'intervalo' ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {pausandoManual ? 'PAUSANDO...' : 'SUBSTITUIR'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', padding: '4px 0 5px', borderTop: '1px solid #E5E7EB', background: 'white', flexShrink: 0 }}>
        {NAV_ITEMS_ESQUERDA.map((item) => (
          <NavButton key={item.label} item={item} ativo={item.path === '/partida'} navigate={navigate} naoLidas={0} />
        ))}
        <BotaoJogar ativo={true} navigate={navigate} />
        {NAV_ITEMS_DIREITA.map((item) => (
          <NavButton key={item.label} item={item} ativo={item.path === '/partida'} navigate={navigate} naoLidas={0} />
        ))}
      </div>

      {penaltiAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', width: '100%', maxWidth: '420px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ textAlign: 'center', marginBottom: '6px' }}><img src={iconBallOrange} alt="pênalti" style={{ width: 28, height: 28 }} /></div>
            <div style={{ fontSize: '17px', fontWeight: '900', color: '#1C1C1C', textAlign: 'center', marginBottom: '2px' }}>PÊNALTI!</div>
            <div style={{ fontSize: '12px', fontWeight: '400', color: '#6B7280', textAlign: 'center', marginBottom: '14px' }}>Escolha quem vai cobrar</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: corBarraPenalti, minWidth: '24px' }}>{Math.max(0, tempoPenalti)}s</span>
              <div style={{ flex: 1, height: '6px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(0, pctPenalti)}%`, height: '100%', background: corBarraPenalti, borderRadius: '4px', transition: 'width 1s linear, background 0.3s' }} />
              </div>
            </div>

            <div onTouchStart={registrarInteracaoPenalti} onClick={registrarInteracaoPenalti} style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {titularesParaPenalti.map((jogador) => (
                <button key={jogador.id} onClick={() => escolherBatedor(jogador)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontFamily: "'Inter', sans-serif", textAlign: 'left' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#1C1C1C', flexShrink: 0, border: '2px solid #F5F5F5' }}>
                    <img
                      src={jogador.foto ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=1C1C1C&color=fff&bold=true&size=40`}
                      alt={jogador.nome}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=1C1C1C&color=fff&bold=true&size=40` }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C' }}>{jogador.nome}</div>
                    <div style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280' }}>{jogador.posicao}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#9CA3AF' }}>FIN</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#F97316' }}>{jogador.finalizacao}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {lesaoAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '18px', padding: '20px', width: '100%', maxWidth: '420px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ textAlign: 'center', marginBottom: '6px' }}><img src={iconInjury} alt="lesão" style={{ width: 28, height: 28 }} /></div>
            <div style={{ fontSize: '17px', fontWeight: '900', color: '#1C1C1C', textAlign: 'center', marginBottom: '2px' }}>LESÃO!</div>
            <div style={{ fontSize: '12px', fontWeight: '400', color: '#6B7280', textAlign: 'center', marginBottom: '14px' }}>
              {jogadorLesionadoNome ? `${jogadorLesionadoNome} saiu machucado — escolha o substituto` : 'Escolha o substituto'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: corBarraLesao, minWidth: '24px' }}>{Math.max(0, tempoLesao)}s</span>
              <div style={{ flex: 1, height: '6px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(0, pctLesao)}%`, height: '100%', background: corBarraLesao, borderRadius: '4px', transition: 'width 1s linear, background 0.3s' }} />
              </div>
            </div>

            <div onTouchStart={registrarInteracaoLesao} onClick={registrarInteracaoLesao} style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {reservasParaLesao.map((jogador) => (
                <button key={jogador.id} onClick={() => escolherSubstitutoNoPopup(jogador)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontFamily: "'Inter', sans-serif", textAlign: 'left' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#1C1C1C', flexShrink: 0, border: '2px solid #F5F5F5' }}>
                    <img
                      src={jogador.foto ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=1C1C1C&color=fff&bold=true&size=40`}
                      alt={jogador.nome}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=1C1C1C&color=fff&bold=true&size=40` }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C' }}>{jogador.nome}</div>
                    <div style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280' }}>{jogador.posicao}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#9CA3AF' }}>OVR</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#F97316' }}>{jogador.overall}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}