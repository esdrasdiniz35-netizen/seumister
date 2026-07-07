// src/pages/Mercado.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { getTecnicoMe, invalidateTecnicoCache } from '../lib/cacheTecnico'
import mascote from '../assets/busto_apito.png'

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

function BotaoOrdenacao({ label, colunaPropria, ordenacao, onClick }) {
  const ativa = ordenacao.coluna === colunaPropria
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '6px 14px', borderRadius: '20px',
      border: ativa ? 'none' : '1.5px solid #E5E7EB',
      background: ativa ? '#F97316' : '#fff',
      color: ativa ? '#fff' : '#6B7280',
      fontSize: '12px', fontWeight: ativa ? '700' : '500',
      cursor: 'pointer', fontFamily: "'Inter', sans-serif",
      whiteSpace: 'nowrap',
    }}>
      {label}
      <span style={{ fontSize: '10px', opacity: ativa ? 1 : 0.5 }}>
        {ativa && ordenacao.direcao === 'asc' ? '▲' : '▼'}
      </span>
    </button>
  )
}

const POSICAO_LABEL = { Goalkeeper: 'GOL', Defender: 'ZAG', Midfielder: 'MEI', Attacker: 'ATA' }
const COR_POSICAO = { GOL: '#F97316', ZAG: '#3B82F6', MEI: '#10B981', ATA: '#EF4444' }

const POSICOES_FILTRO = [
  { valor: '', label: 'Todas as posições' },
  { valor: 'Goalkeeper', label: 'GOL' },
  { valor: 'Defender', label: 'ZAG' },
  { valor: 'Midfielder', label: 'MEI' },
  { valor: 'Attacker', label: 'ATA' },
]
const PRECOS_FILTRO = [
  { valor: '', label: 'Preço: Qualquer' },
  { valor: '200', label: 'Até 200' },
  { valor: '300', label: 'Até 300' },
  { valor: '400', label: 'Até 400' },
]

const ATRASO_BUSCA_MS = 400

export default function Mercado() {
  const navigate = useNavigate()
  const path = '/mercado'

  const [carregandoClube, setCarregandoClube] = useState(true)
  const [erro, setErro] = useState(null)
  const [meuClube, setMeuClube] = useState(null)
  const [nivel, setNivel] = useState('Iniciante')
  const [moedas, setMoedas] = useState(0)

  const [aba, setAba] = useState('comprar')
  const [busca, setBusca] = useState('')
  const [posicao, setPosicao] = useState('')
  const [precoMax, setPrecoMax] = useState('')

  const [ordenacao, setOrdenacao] = useState({ coluna: 'overall', direcao: 'desc' })

  const alternarOrdenacao = (coluna) => {
    setOrdenacao((prev) => prev.coluna === coluna
      ? { coluna, direcao: prev.direcao === 'desc' ? 'asc' : 'desc' }
      : { coluna, direcao: 'desc' })
  }

  const [catalogo, setCatalogo] = useState([])
  const [carregandoCatalogo, setCarregandoCatalogo] = useState(false)
  const [carregandoMais, setCarregandoMais] = useState(false)
  const [pagina, setPagina] = useState(0)
  const [temMais, setTemMais] = useState(true)
  const [comprando, setComprando] = useState(null)

  const [meuElenco, setMeuElenco] = useState([])
  const [carregandoElenco, setCarregandoElenco] = useState(false)
  const [vendendo, setVendendo] = useState(null)

  const buscaTimeoutRef = useRef(null)
  const sentinelaRef = useRef(null)

  useEffect(() => {
    let cancelado = false
    async function carregar() {
      try {
        const tecnicoData = await getTecnicoMe()
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
        setCarregandoClube(false)
      } catch (e) {
        if (cancelado) return
        setErro(e.message || 'Não foi possível carregar os dados do clube.')
        setCarregandoClube(false)
      }
    }
    carregar()
    return () => { cancelado = true }
  }, [])

  const buscarCatalogo = useCallback(async (numeroPagina, substituir) => {
    if (numeroPagina === 0) setCarregandoCatalogo(true)
    else setCarregandoMais(true)
    setErro(null)
    try {
      const params = new URLSearchParams()
      if (posicao) params.set('posicao', posicao)
      if (busca.trim()) params.set('busca', busca.trim())
      if (precoMax) params.set('precoMax', precoMax)
      params.set('ordenarPor', ordenacao.coluna === 'valor' ? 'valor_base' : 'overall')
      params.set('ordem', ordenacao.direcao)
      params.set('pagina', String(numeroPagina))

      const resultado = await apiFetch(`/api/mercado/jogadores?${params.toString()}`)
      setCatalogo((prev) => substituir ? (resultado.jogadores || []) : [...prev, ...(resultado.jogadores || [])])
      setTemMais(Boolean(resultado.temMais))
      setPagina(numeroPagina)
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar os jogadores.')
    } finally {
      setCarregandoCatalogo(false)
      setCarregandoMais(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posicao, busca, precoMax, ordenacao])

  useEffect(() => {
    if (aba !== 'comprar') return
    buscarCatalogo(0, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba, posicao, precoMax, ordenacao])

  useEffect(() => {
    if (aba !== 'comprar') return
    clearTimeout(buscaTimeoutRef.current)
    buscaTimeoutRef.current = setTimeout(() => {
      buscarCatalogo(0, true)
    }, ATRASO_BUSCA_MS)
    return () => clearTimeout(buscaTimeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca])

  useEffect(() => {
    if (aba !== 'comprar') return
    const elemento = sentinelaRef.current
    if (!elemento) return

    const observador = new IntersectionObserver((entradas) => {
      const [entrada] = entradas
      if (entrada.isIntersecting && temMais && !carregandoCatalogo && !carregandoMais) {
        buscarCatalogo(pagina + 1, false)
      }
    }, { rootMargin: '200px' })

    observador.observe(elemento)
    return () => observador.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba, temMais, carregandoCatalogo, carregandoMais, pagina, posicao, busca, precoMax, ordenacao])

  const buscarMeuElenco = useCallback(async () => {
    setCarregandoElenco(true)
    setErro(null)
    try {
      const elencoData = await apiFetch('/api/elenco', { method: 'GET' })
      const todos = [...(elencoData.titulares || []), ...(elencoData.reservas || [])]
      setMeuElenco(todos)
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar seu elenco.')
    } finally {
      setCarregandoElenco(false)
    }
  }, [])

  // Busca de novo toda vez que a aba Vender é aberta — garante que
  // jogadores comprados recentemente já apareçam na lista pra vender.
  useEffect(() => {
    if (aba === 'vender') {
      buscarMeuElenco()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba])

  const handleComprar = async (jogador) => {
    if (moedas < jogador.valor_base) {
      setErro('Moedas insuficientes para comprar este jogador.')
      return
    }
    setComprando(jogador.id)
    setErro(null)
    try {
      const resultado = await apiFetch('/api/mercado/comprar', {
        method: 'POST',
        body: { jogador_base_id: jogador.id },
      })
      setMoedas(resultado.moedas_restantes)
      setCatalogo((prev) => prev.filter((j) => j.id !== jogador.id))
      invalidateTecnicoCache()
    } catch (e) {
      setErro(e.message || 'Não foi possível comprar este jogador.')
    } finally {
      setComprando(null)
    }
  }

  const handleVender = async (jogador) => {
    setVendendo(jogador.id)
    setErro(null)
    try {
      const resultado = await apiFetch('/api/mercado/vender', {
        method: 'POST',
        body: { id: jogador.id },
      })
      setMoedas(resultado.moedas_atuais)
      setMeuElenco((prev) => prev.filter((j) => j.id !== jogador.id))
      invalidateTecnicoCache()
    } catch (e) {
      setErro(e.message || 'Não foi possível vender este jogador.')
    } finally {
      setVendendo(null)
    }
  }

  const listaExibida = aba === 'comprar' ? catalogo : meuElenco
  const carregandoLista = aba === 'comprar' ? carregandoCatalogo : carregandoElenco

  const listaFiltrada = aba === 'vender'
    ? listaExibida
        .filter((j) => {
          const matchBusca = !busca.trim() || j.nome.toLowerCase().includes(busca.toLowerCase())
          const matchPosicao = !posicao || j.posicao === posicao
          const matchPreco = !precoMax || (j.valor_atual ?? 0) <= Number(precoMax)
          return matchBusca && matchPosicao && matchPreco
        })
        .sort((a, b) => {
          const valorA = ordenacao.coluna === 'valor' ? (a.valor_atual ?? 0) : a.overall
          const valorB = ordenacao.coluna === 'valor' ? (b.valor_atual ?? 0) : b.overall
          return ordenacao.direcao === 'desc' ? valorB - valorA : valorA - valorB
        })
    : listaExibida

  if (carregandoClube) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: '#fff', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#9CA3AF' }}>Carregando mercado...</span>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#FFFFFF', height: '100dvh',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* HEADER — fixo, fora do miolo que rola */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', background: '#fff',
        flexShrink: 0,
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
        <div style={{
          border: '1.5px solid #E5E7EB', borderRadius: '12px',
          padding: '8px 16px', background: '#fff', minWidth: '120px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <img src={iconCoin} alt="moedas" style={{ width: '26px', height: '26px' }} />
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#1C1C1C', lineHeight: 1 }}>
              {moedas.toLocaleString('pt-BR')}
            </span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280', marginTop: '3px', textAlign: 'center' }}>
            moedas
          </div>
        </div>
      </div>

      {/* MIOLO — flex:1, rola se precisar, mantém o rodapé sempre colado. */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
          {['comprar', 'vender'].map(a => (
            <button key={a} onClick={() => setAba(a)} style={{
              flex: 1, padding: '14px',
              background: aba === a ? '#F97316' : '#fff',
              color: aba === a ? '#fff' : '#6B7280',
              border: 'none', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
            }}>
              {a.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px', flexShrink: 0 }}>
          <img src={mascote} alt="Seu Mister" style={{ width: '80px', height: '80px', objectFit: 'contain', flexShrink: 0 }} />
          <div style={{
            border: '2.5px solid #1C1C1C', borderRadius: '14px',
            padding: '10px 14px', fontSize: '14px', fontWeight: '500',
            color: '#1C1C1C', lineHeight: '22px', flex: 1,
          }}>
            {aba === 'comprar'
              ? 'Negocia bem.\nDinheiro não cresce em árvore.'
              : 'Vende bem. Quem não precisa não segura.'}
          </div>
        </div>

        {erro && (
          <div style={{ padding: '0 16px 10px', flexShrink: 0 }}>
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '8px 12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
            </div>
          </div>
        )}

        <div style={{ padding: '0 16px 10px', display: 'flex', gap: '8px', flexShrink: 0 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
            background: '#F5F5F5', borderRadius: '10px',
            padding: '10px 14px', border: '1.5px solid #E5E7EB',
          }}>
            <img src={iconSearch} alt="busca" style={{ width: '18px', height: '18px', opacity: 0.4 }} />
            <input
              type="text"
              placeholder="Buscar jogador..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: '14px', fontWeight: '400', color: '#1C1C1C',
                fontFamily: "'Inter', sans-serif", width: '100%',
              }}
            />
          </div>
        </div>

        <div style={{ padding: '0 16px 10px', display: 'flex', gap: '8px', flexShrink: 0 }}>
          <select
            value={posicao}
            onChange={e => setPosicao(e.target.value)}
            style={{
              flex: 1, padding: '9px 12px', border: '1.5px solid #E5E7EB',
              borderRadius: '10px', fontSize: '13px', fontWeight: '500',
              color: '#1C1C1C', background: '#fff', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", outline: 'none',
            }}
          >
            {POSICOES_FILTRO.map(p => <option key={p.valor} value={p.valor}>{p.label}</option>)}
          </select>
          <select
            value={precoMax}
            onChange={e => setPrecoMax(e.target.value)}
            style={{
              flex: 1, padding: '9px 12px', border: '1.5px solid #E5E7EB',
              borderRadius: '10px', fontSize: '13px', fontWeight: '500',
              color: '#1C1C1C', background: '#fff', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", outline: 'none',
            }}
          >
            {PRECOS_FILTRO.map(p => <option key={p.valor} value={p.valor}>{p.label}</option>)}
          </select>
        </div>

        <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.5px' }}>
            ORDENAR:
          </span>
          <BotaoOrdenacao label="Overall" colunaPropria="overall" ordenacao={ordenacao} onClick={() => alternarOrdenacao('overall')} />
          <BotaoOrdenacao label="Moedas" colunaPropria="valor" ordenacao={ordenacao} onClick={() => alternarOrdenacao('valor')} />
        </div>

        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          {carregandoLista && listaFiltrada.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280', fontSize: '14px' }}>
              Carregando...
            </div>
          )}

          {!carregandoLista && listaFiltrada.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280', fontSize: '14px' }}>
              {aba === 'comprar' ? 'Nenhum jogador encontrado' : 'Você não tem jogadores para vender com esses filtros'}
            </div>
          )}

          {listaFiltrada.map(jogador => {
            const posicaoLabel = POSICAO_LABEL[jogador.posicao] ?? jogador.posicao
            const preco = aba === 'comprar' ? jogador.valor_base : (jogador.valor_atual ?? 0)
            const processando = aba === 'comprar' ? comprando === jogador.id : vendendo === jogador.id
            const stats = [
              { label: 'VEL', val: jogador.velocidade },
              { label: 'FIN', val: jogador.finalizacao },
              { label: 'PAS', val: jogador.passe },
              { label: 'DRI', val: jogador.drible },
              { label: 'DEF', val: jogador.defesa },
              { label: 'FIS', val: jogador.fisico },
            ]
            return (
              <div key={jogador.id} style={{
                background: '#fff', border: '1.5px solid #E5E7EB',
                borderRadius: '14px', padding: '12px',
                display: 'flex', alignItems: 'center', gap: '12px',
                opacity: processando ? 0.6 : 1,
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '10px',
                  overflow: 'hidden', background: '#F5F5F5', flexShrink: 0,
                }}>
                  <img src={jogador.foto_url ?? jogador.foto} alt={jogador.nome}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(jogador.nome)}&background=F5F5F5&color=1C1C1C&bold=true&size=64` }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1C' }}>{jogador.tem_estrela ? '⭐ ' : ''}{jogador.nome}</span>
                    {posicaoLabel && (
                      <span style={{ fontSize: '12px', fontWeight: '700', color: COR_POSICAO[posicaoLabel] }}>
                        {posicaoLabel}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: '#1C1C1C', lineHeight: 1 }}>
                      {jogador.overall}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#9CA3AF' }}>GERAL</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {stats.map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', fontWeight: '500', color: '#9CA3AF' }}>{s.label}</div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1C' }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <img src={iconCoin} alt="moeda" style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#F97316' }}>{preco}</span>
                  </div>
                  <button
                    onClick={() => aba === 'comprar' ? handleComprar(jogador) : handleVender(jogador)}
                    disabled={processando}
                    style={{
                      background: '#F97316',
                      color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '8px 14px', fontSize: '12px', fontWeight: '700',
                      cursor: processando ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.5px', whiteSpace: 'nowrap',
                    }}
                  >
                    {processando ? '...' : (aba === 'comprar' ? 'COMPRAR' : 'VENDER')}
                  </button>
                </div>
              </div>
            )
          })}

          {aba === 'comprar' && (
            <div ref={sentinelaRef} style={{ height: '1px' }} />
          )}

          {carregandoMais && (
            <div style={{ textAlign: 'center', padding: '12px 0', color: '#9CA3AF', fontSize: '12px' }}>
              Carregando mais jogadores...
            </div>
          )}
        </div>
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