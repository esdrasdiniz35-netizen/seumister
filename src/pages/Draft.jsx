// src/pages/Draft.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import mascote from '../assets/pensando.png'
import logo from '../assets/logo.png'
import iconCoin from '../assets/icons/icon-coin.png'
import iconSearch from '../assets/icons/icon-search.png'
import iconHomeCinza from '../assets/icons/home_cinza.png'
import iconHomeLaranja from '../assets/icons/home_laranja.png'
import iconBalaoCinza from '../assets/icons/balao_cinza.png'
import iconBalaoLaranja from '../assets/icons/balao_laranja.png'
import iconBolaCinza from '../assets/icons/bola_cinza.png'
import iconTrofeuCinza from '../assets/icons/trofeu_cinza.png'
import iconTrofeuLaranja from '../assets/icons/trofeu_laranja.png'
import iconPerfilCinza from '../assets/icons/perfil_cinza.png'
import iconPerfilLaranja from '../assets/icons/perfil_laranja.png'
import { apiFetch } from '../lib/api'

// Mapeamento posição real (API-Football, em inglês) → sigla em
// português usada na UI.
const POSICAO_LABEL = {
  Goalkeeper: 'GOL',
  Defender: 'ZAG',
  Midfielder: 'MEI',
  Attacker: 'ATA',
}

// Filtros de posição. "LAT" não existe como valor de posicao no banco —
// é um sub-tipo de Defender (coluna sub_posicao), então o filtro de
// Lateral manda posicao=Defender + subPosicao=lateral, e o filtro de
// Zagueiro manda posicao=Defender sem subPosicao (o backend então
// exclui quem tem sub_posicao='lateral'), para as duas abas baterem
// com o catálogo completo de defensores sem se sobrepor.
const FILTROS = [
  { label: 'Todos', posicao: null, subPosicao: null },
  { label: 'GOL', posicao: 'Goalkeeper', subPosicao: null },
  { label: 'ZAG', posicao: 'Defender', subPosicao: null },
  { label: 'LAT', posicao: 'Defender', subPosicao: 'lateral' },
  { label: 'MEI', posicao: 'Midfielder', subPosicao: null },
  { label: 'ATA', posicao: 'Attacker', subPosicao: null },
]

const MAX_JOGADORES = 21
const MIN_JOGADORES = 11
const MOEDAS_INICIAIS = 1000
const ATRASO_BUSCA_MS = 400

const COR_POSICAO = {
  Goalkeeper: '#F97316', Defender: '#3B82F6',
  Midfielder: '#10B981', Attacker: '#EF4444',
}

// ─── BOTTOM NAV — padrão real do app (igual Painel.jsx / Elenco.jsx) ───────
// Sem abas "Elenco" ou "Partida" — essas nunca existiram no padrão real,
// eram invenção da versão antiga desta tela. O nav é sempre: Início,
// Vestiário, Jogar (botão central), Liga, Perfil.

const TEM_NOTIFICACAO_NAO_LIDA = true

const NAV_ITEMS_ESQUERDA = [
  { iconNormal: iconHomeCinza,  iconActive: iconHomeLaranja,  label: 'Início',    path: '/painel',    hasBadge: false },
  { iconNormal: iconBalaoCinza, iconActive: iconBalaoLaranja, label: 'Vestiário', path: '/vestiario', hasBadge: true  },
]

const NAV_ITEMS_DIREITA = [
  { iconNormal: iconTrofeuCinza, iconActive: iconTrofeuLaranja, label: 'Liga',   path: '/liga-privada', hasBadge: false },
  { iconNormal: iconPerfilCinza, iconActive: iconPerfilLaranja, label: 'Perfil', path: '/perfil',       hasBadge: false },
]

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

// Cabeçalho de coluna clicável para ordenação. Mostra uma seta indicando
// a direção atual quando esta é a coluna ativa.
function CabecalhoOrdenavel({ label, colunaAtiva, colunaPropria, direcao, onClick }) {
  const ativa = colunaAtiva === colunaPropria
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px',
        color: ativa ? '#F97316' : '#9CA3AF', fontFamily: "'Inter', sans-serif",
      }}
    >
      {label}
      <span style={{ fontSize: '9px', opacity: ativa ? 1 : 0.4 }}>
        {ativa && direcao === 'asc' ? '▲' : '▼'}
      </span>
    </button>
  )
}

export default function Draft() {
  const navigate = useNavigate()
  // Draft não é uma das rotas do bottom nav — nada fica destacado
  // enquanto o técnico está montando o elenco, igual antes.
  const path = '/draft'
  const [aba, setAba] = useState('catalogo') // 'catalogo' | 'meuElenco'
  const [filtro, setFiltro] = useState(FILTROS[0])
  const [busca, setBusca] = useState('')
  const [elenco, setElenco] = useState([])
  const [jogadoresDisponiveis, setJogadoresDisponiveis] = useState([])
  const [carregandoLista, setCarregandoLista] = useState(true)
  const [carregandoMais, setCarregandoMais] = useState(false)
  const [erroLista, setErroLista] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const [erroConfirmar, setErroConfirmar] = useState('')

  // Ordenação do catálogo geral e do "Meu elenco" são independentes,
  // como pedido — cada aba guarda seu próprio par coluna/direção.
  const [ordenacaoCatalogo, setOrdenacaoCatalogo] = useState({ coluna: 'overall', direcao: 'desc' })
  const [ordenacaoElenco, setOrdenacaoElenco] = useState({ coluna: 'overall', direcao: 'desc' })

  // Estado de paginação para o scroll infinito.
  const [pagina, setPagina] = useState(0)
  const [temMais, setTemMais] = useState(true)

  const buscaTimeoutRef = useRef(null)
  const sentinelaRef = useRef(null)

  const moedas = MOEDAS_INICIAIS - elenco.reduce((soma, j) => soma + j.valor_base, 0)

  const buscarJogadores = useCallback(async (numeroPagina, substituir) => {
    if (numeroPagina === 0) {
      setCarregandoLista(true)
    } else {
      setCarregandoMais(true)
    }
    setErroLista('')
    try {
      const params = new URLSearchParams()
      if (filtro.posicao) params.set('posicao', filtro.posicao)
      if (filtro.subPosicao) params.set('subPosicao', filtro.subPosicao)
      if (busca.trim()) params.set('busca', busca.trim())
      params.set('ordenarPor', ordenacaoCatalogo.coluna)
      params.set('ordem', ordenacaoCatalogo.direcao)
      params.set('pagina', String(numeroPagina))

      const resultado = await apiFetch(`/api/draft/jogadores?${params.toString()}`)
      setJogadoresDisponiveis(prev =>
        substituir ? (resultado.jogadores || []) : [...prev, ...(resultado.jogadores || [])]
      )
      setTemMais(Boolean(resultado.temMais))
      setPagina(numeroPagina)
    } catch (err) {
      setErroLista(err.message || 'Não foi possível carregar os jogadores.')
    } finally {
      setCarregandoLista(false)
      setCarregandoMais(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, busca, ordenacaoCatalogo])

  // Sempre que o filtro de posição ou a ordenação mudam, recomeça do
  // zero (página 0, substituindo a lista atual).
  useEffect(() => {
    buscarJogadores(0, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, ordenacaoCatalogo])

  // Busca por nome/time tem debounce — evita disparar uma requisição a
  // cada tecla digitada, já que o catálogo tem +3.000 jogadores reais.
  useEffect(() => {
    clearTimeout(buscaTimeoutRef.current)
    buscaTimeoutRef.current = setTimeout(() => {
      buscarJogadores(0, true)
    }, ATRASO_BUSCA_MS)
    return () => clearTimeout(buscaTimeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca])

  // Scroll infinito: observa um elemento "sentinela" no fim da lista e,
  // quando ele entra na tela, pede a próxima página — sem botão, sem
  // contagem de página, sem travar carregando milhares de jogadores
  // de uma vez.
  useEffect(() => {
    if (aba !== 'catalogo') return
    const elemento = sentinelaRef.current
    if (!elemento) return

    const observador = new IntersectionObserver((entradas) => {
      const [entrada] = entradas
      if (entrada.isIntersecting && temMais && !carregandoLista && !carregandoMais) {
        buscarJogadores(pagina + 1, false)
      }
    }, { rootMargin: '200px' })

    observador.observe(elemento)
    return () => observador.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba, temMais, carregandoLista, carregandoMais, pagina, filtro, busca, ordenacaoCatalogo])

  const jaEscalado = (id) => elenco.some(j => j.id === id)

  const handleToggle = (jogador) => {
    if (jaEscalado(jogador.id)) {
      setElenco(elenco.filter(j => j.id !== jogador.id))
    } else {
      if (elenco.length >= MAX_JOGADORES) return alert('Elenco cheio!')
      if (moedas < jogador.valor_base) return alert('Moedas insuficientes!')
      setElenco([...elenco, jogador])
    }
  }

  async function handleConfirmar() {
    if (elenco.length < MIN_JOGADORES) {
      alert(`Você precisa de pelo menos ${MIN_JOGADORES} jogadores!`)
      return
    }
    if (!elenco.some((j) => j.posicao === 'Goalkeeper')) {
      alert('Seu elenco precisa de pelo menos 1 goleiro!')
      return
    }
    if (confirmando) return

    setErroConfirmar('')
    setConfirmando(true)

    try {
      // Escalação inicial automática no esquema 4-3-3 (1 GOL + 4 ZAG +
      // 3 MEI + 3 ATA), respeitando a posição REAL de cada jogador — não
      // mais "os 11 primeiros cliques" (isso deixava o elenco torto: time
      // incompleto ou goleiro escalado fora do gol). Escolhe sempre os de
      // maior overall dentro de cada posição; se faltar gente numa
      // posição, o próximo grupo da linha (ZAG -> MEI -> ATA) completa o
      // que sobrar. O técnico reorganiza tudo depois na tela de Elenco.
      const COMPOSICAO_4_3_3 = { Defender: 4, Midfielder: 3, Attacker: 3 }
      const ORDEM_LINHA = ['Defender', 'Midfielder', 'Attacker']
      const porOverallDesc = (a, b) => b.overall - a.overall

      const titularesIds = new Set()

      const melhorGoleiro = elenco.filter((j) => j.posicao === 'Goalkeeper').sort(porOverallDesc)[0]
      if (melhorGoleiro) titularesIds.add(melhorGoleiro.id)

      const poolLinha = ORDEM_LINHA.flatMap((pos) =>
        elenco.filter((j) => j.posicao === pos).sort(porOverallDesc)
      )
      const vagasLinha = Object.values(COMPOSICAO_4_3_3).reduce((a, b) => a + b, 0) // 10

      for (const jogador of poolLinha) {
        if (titularesIds.size >= vagasLinha + (melhorGoleiro ? 1 : 0)) break
        titularesIds.add(jogador.id)
      }

      const payload = elenco.map((j) => ({
        jogador_base_id: j.id,
        titular: titularesIds.has(j.id),
      }))

      await apiFetch('/api/draft', { method: 'POST', body: { jogadores: payload } })
      navigate('/painel')
    } catch (err) {
      setErroConfirmar(err.message || 'Não foi possível confirmar o elenco. Tenta de novo.')
      setConfirmando(false)
    }
  }

  function alternarOrdenacao(abaAtual, coluna) {
    const setOrdenacao = abaAtual === 'catalogo' ? setOrdenacaoCatalogo : setOrdenacaoElenco
    const ordenacaoAtual = abaAtual === 'catalogo' ? ordenacaoCatalogo : ordenacaoElenco
    if (ordenacaoAtual.coluna === coluna) {
      setOrdenacao({ coluna, direcao: ordenacaoAtual.direcao === 'desc' ? 'asc' : 'desc' })
    } else {
      setOrdenacao({ coluna, direcao: 'desc' })
    }
  }

  // "Meu elenco" é ordenado no próprio frontend (a lista já está
  // inteira em memória — não há necessidade de ir ao backend de novo).
  const elencoOrdenado = [...elenco].sort((a, b) => {
    const valorA = ordenacaoElenco.coluna === 'overall' ? a.overall : a.valor_base
    const valorB = ordenacaoElenco.coluna === 'overall' ? b.overall : b.valor_base
    return ordenacaoElenco.direcao === 'desc' ? valorB - valorA : valorA - valorB
  })

  const gastoTotal = MOEDAS_INICIAIS - moedas
  const porcentagem = (moedas / MOEDAS_INICIAIS) * 100

  // Lista exibida depende da aba ativa.
  const listaExibida = aba === 'catalogo' ? jogadoresDisponiveis : elencoOrdenado
  const ordenacaoAtiva = aba === 'catalogo' ? ordenacaoCatalogo : ordenacaoElenco

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#FFFFFF',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* HEADER */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <img src={logo} alt="Seu Mister" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
          <span style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C', letterSpacing: '0.2px' }}>
            SEU <span style={{ color: '#F97316' }}>MISTER</span>
          </span>
        </div>
        <div style={{ background: '#F5F5F5', borderRadius: '12px', padding: '10px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={iconCoin} alt="moeda" style={{ width: '20px', height: '20px' }} />
              <span style={{ fontWeight: '500', fontSize: '13px', color: '#1C1C1C' }}>
                moedas disponíveis
              </span>
            </div>
            <div>
              <span style={{ fontWeight: '900', fontSize: '15px', color: '#F97316' }}>{moedas}</span>
              <span style={{ fontWeight: '400', fontSize: '11px', color: '#9CA3AF' }}> / {MOEDAS_INICIAIS}</span>
            </div>
          </div>
          <div style={{ background: '#E5E7EB', borderRadius: '4px', height: '7px', overflow: 'hidden' }}>
            <div style={{
              background: '#F97316', height: '100%',
              width: `${porcentagem}%`, borderRadius: '4px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* MASCOTE + BALÃO (compacto) */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', gap: '10px', flexShrink: 0 }}>
        <img src={mascote} alt="Seu Mister"
          style={{ width: '54px', height: '54px', objectFit: 'contain', flexShrink: 0 }} />
        <div style={{
          border: '2px solid #1C1C1C', borderRadius: '12px',
          padding: '8px 12px', fontSize: '12px', fontWeight: '500',
          color: '#1C1C1C', flex: 1, lineHeight: '15px',
        }}>
          {aba === 'catalogo'
            ? 'Monta seu time! Toca no + pra escalar e no ✓ pra tirar.'
            : `Você já escalou ${elenco.length} jogador${elenco.length === 1 ? '' : 'es'}. Toca no ✕ pra tirar alguém.`}
        </div>
      </div>

      {/* ABAS: Catálogo vs Meu Elenco */}
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => setAba('catalogo')}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
            background: aba === 'catalogo' ? '#1C1C1C' : '#F5F5F5',
            color: aba === 'catalogo' ? 'white' : '#6B7280',
            fontWeight: '700', fontSize: '13px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Catálogo
        </button>
        <button
          onClick={() => setAba('meuElenco')}
          style={{
            flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
            background: aba === 'meuElenco' ? '#1C1C1C' : '#F5F5F5',
            color: aba === 'meuElenco' ? 'white' : '#6B7280',
            fontWeight: '700', fontSize: '13px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          Meu elenco
          <span style={{
            background: aba === 'meuElenco' ? '#F97316' : '#E5E7EB',
            color: aba === 'meuElenco' ? 'white' : '#6B7280',
            borderRadius: '10px', fontSize: '11px', fontWeight: '700',
            padding: '1px 7px', minWidth: '18px', textAlign: 'center',
          }}>
            {elenco.length}
          </span>
        </button>
      </div>

      {/* BUSCA — só faz sentido no Catálogo, já que Meu Elenco já é a lista inteira */}
      {aba === 'catalogo' && (
        <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#F5F5F5', borderRadius: '12px', padding: '10px 12px',
          }}>
            <img src={iconSearch} alt="buscar" style={{ width: '16px', height: '16px', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Busque por jogador, time ou seleção..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: '14px', fontWeight: '500', color: '#1C1C1C',
                fontFamily: "'Inter', sans-serif", width: '100%',
              }}
            />
            {busca && (
              <button onClick={() => setBusca('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '16px' }}>
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* FILTROS — só no Catálogo; Meu Elenco já mostra todas as posições juntas */}
      {aba === 'catalogo' && (
        <div style={{
          padding: '0 16px 8px', display: 'flex', gap: '8px',
          overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0,
        }}>
          {FILTROS.map(f => {
            const ativo = filtro.label === f.label
            return (
              <button key={f.label} onClick={() => setFiltro(f)} style={{
                padding: '7px 16px', borderRadius: '20px',
                border: ativo ? 'none' : '1px solid #E5E7EB',
                background: ativo ? '#F97316' : '#F5F5F5',
                color: ativo ? 'white' : '#6B7280',
                fontWeight: ativo ? '700' : '500',
                fontSize: '13px', cursor: 'pointer',
                whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif",
                flexShrink: 0,
              }}>
                {f.label}
              </button>
            )
          })}
        </div>
      )}

      {/* LEGENDA (com ordenação clicável em OVR e Preço) */}
      <div style={{
        padding: '6px 16px',
        display: 'grid',
        gridTemplateColumns: '46px 1fr 42px 80px 40px',
        gap: '8px',
        alignItems: 'center',
        borderBottom: '1px solid #E5E7EB',
        flexShrink: 0,
      }}>
        <div />
        <span style={{ fontSize: '10px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Jogador
        </span>
        <CabecalhoOrdenavel
          label="OVR"
          colunaAtiva={ordenacaoAtiva.coluna}
          colunaPropria="overall"
          direcao={ordenacaoAtiva.direcao}
          onClick={() => alternarOrdenacao(aba, 'overall')}
        />
        <CabecalhoOrdenavel
          label="Preço"
          colunaAtiva={ordenacaoAtiva.coluna}
          colunaPropria="valor_base"
          direcao={ordenacaoAtiva.direcao}
          onClick={() => alternarOrdenacao(aba, 'valor_base')}
        />
        <div />
      </div>

      {/* LISTA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {carregandoLista && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '13px' }}>
            Carregando jogadores...
          </div>
        )}

        {!carregandoLista && erroLista && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#EF4444', fontSize: '13px' }}>
            {erroLista}
          </div>
        )}

        {!carregandoLista && !erroLista && listaExibida.length === 0 && aba === 'catalogo' && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280', fontSize: '14px' }}>
            Nenhum jogador encontrado
          </div>
        )}

        {!carregandoLista && !erroLista && listaExibida.length === 0 && aba === 'meuElenco' && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280', fontSize: '14px' }}>
            Você ainda não escalou nenhum jogador.<br />Volta pro Catálogo e toca no +.
          </div>
        )}

        {!carregandoLista && !erroLista && listaExibida.map(jogador => (
          <div key={jogador.id} style={{
            display: 'grid',
            gridTemplateColumns: '46px 1fr 42px 80px 40px',
            gap: '8px',
            alignItems: 'center',
            padding: '9px 0',
            borderBottom: '1px solid #F5F5F5',
            background: aba === 'catalogo' && jaEscalado(jogador.id) ? '#FFF7F0' : 'white',
          }}>
            <img
              src={jogador.foto_url}
              alt={jogador.nome}
              style={{ width: '46px', height: '46px', borderRadius: '10px', objectFit: 'cover', background: '#F5F5F5' }}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=F5F5F5&color=1C1C1C&bold=true&size=46`
              }}
            />

            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#1C1C1C', lineHeight: '17px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {jogador.tem_estrela ? '⭐ ' : ''}{jogador.nome}
              </div>
              <div style={{ fontWeight: '700', fontSize: '11px', color: COR_POSICAO[jogador.posicao] }}>
                {jogador.sub_posicao === 'lateral' ? 'LAT' : (POSICAO_LABEL[jogador.posicao] || jogador.posicao)}
              </div>
            </div>

            <span style={{ textAlign: 'center', fontWeight: '900', fontSize: '22px', color: '#1C1C1C' }}>
              {jogador.overall}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <img src={iconCoin} alt="moeda" style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: '700', fontSize: '14px', color: '#F97316' }}>{jogador.valor_base}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => handleToggle(jogador)}
                style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: aba === 'meuElenco' ? '#EF4444' : (jaEscalado(jogador.id) ? '#10B981' : '#F97316'),
                  border: 'none', color: 'white', fontSize: '20px',
                  fontWeight: '700', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {aba === 'meuElenco' ? '✕' : (jaEscalado(jogador.id) ? '✓' : '+')}
              </button>
            </div>
          </div>
        ))}

        {/* SENTINELA do scroll infinito — invisível, só dispara a próxima
            página quando entra na viewport. Só existe no Catálogo. */}
        {aba === 'catalogo' && <div ref={sentinelaRef} style={{ height: '1px' }} />}

        {carregandoMais && (
          <div style={{ textAlign: 'center', padding: '14px 0', color: '#9CA3AF', fontSize: '12px' }}>
            Carregando mais jogadores...
          </div>
        )}
      </div>

      {/* MENSAGEM DE ERRO AO CONFIRMAR */}
      {erroConfirmar && (
        <div style={{ padding: '8px 16px 0', flexShrink: 0 }}>
          <div style={{
            background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '10px',
            padding: '8px 12px', fontSize: '12px', fontWeight: '600', color: '#EF4444', textAlign: 'center',
          }}>
            {erroConfirmar}
          </div>
        </div>
      )}

      {/* RODAPÉ COM RESUMO */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', background: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '13px', color: '#1C1C1C' }}>
              {elenco.length}/{MAX_JOGADORES} jogadores escolhidos
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Gasto: <span style={{ color: '#F97316', fontWeight: '700' }}>{gastoTotal} moedas</span>
            </div>
          </div>
          <button
            onClick={handleConfirmar}
            disabled={elenco.length < MIN_JOGADORES || confirmando}
            style={{
              background: elenco.length >= MIN_JOGADORES && !confirmando ? '#F97316' : '#E5E7EB',
              color: elenco.length >= MIN_JOGADORES && !confirmando ? 'white' : '#6B7280',
              border: 'none', borderRadius: '12px',
              padding: '13px 18px', fontWeight: '700',
              fontSize: '14px', cursor: elenco.length >= MIN_JOGADORES && !confirmando ? 'pointer' : 'not-allowed',
              fontFamily: "'Inter', sans-serif",
            }}>
            {confirmando ? 'CONFIRMANDO...' : 'CONFIRMAR ELENCO'}
          </button>
        </div>
      </div>

      {/* BOTTOM NAV — padrão real do app */}
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