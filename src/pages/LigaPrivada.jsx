// src/pages/LigaPrivada.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTecnicoMe } from '../lib/cacheTecnico'
import {
  criarLiga,
  listarLigasAbertas,
  listarMinhasLigas,
  buscarDetalheLiga,
  entrarNaLiga,
  sairDaLiga,
  darPlayNaLiga,
  alternarTipoLiga,
} from '../lib/ligasApi'

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

const NAV_ITEMS_ESQUERDA = [
  { iconNormal: iconHomeCinza,  iconActive: iconHomeLaranja,  label: 'Início',    path: '/painel',    hasBadge: false },
  { iconNormal: iconBalaoCinza, iconActive: iconBalaoLaranja, label: 'Vestiário', path: '/vestiario', hasBadge: true  },
]

const NAV_ITEMS_DIREITA = [
  { iconNormal: iconTrofeuCinza, iconActive: iconTrofeuLaranja, label: 'Liga',   path: '/liga-privada', hasBadge: false },
  { iconNormal: iconPerfilCinza, iconActive: iconPerfilLaranja, label: 'Perfil', path: '/perfil',       hasBadge: false },
]

const POLL_MS = 5000
const POLL_DETALHE_MS = 3000

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

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 40, contorno = '#1C1C1C' }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor1}/>
    <path d="M32 2V70C48 66 60 54 60 38V14L32 2Z" fill={cor2}/>
    <line x1="32" y1="2" x2="32" y2="70" stroke={contorno} strokeWidth="2"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke={contorno} strokeWidth="3" fill="none"/>
  </svg>
)

const STATUS_LABEL = { lobby: 'AGUARDANDO', em_andamento: 'EM ANDAMENTO', finalizada: 'FINALIZADA' }
const STATUS_COR = { lobby: '#F97316', em_andamento: '#10B981', finalizada: '#6B7280' }

function formatarSegundosRestantes(autostartAt) {
  if (!autostartAt) return null
  const restante = Math.ceil((new Date(autostartAt).getTime() - Date.now()) / 1000)
  return restante > 0 ? restante : 0
}

export default function LigaPrivada() {
  const navigate = useNavigate()
  const path = '/liga-privada' // essa própria tela é o destino do botão "Liga" do rodapé agora

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [moedas, setMoedas] = useState(0)

  const [minhasLigas, setMinhasLigas] = useState([])
  const [ligasAbertas, setLigasAbertas] = useState([])

  const [showCriar, setShowCriar] = useState(false)
  const [showEntrar, setShowEntrar] = useState(false)
  const [nomeLiga, setNomeLiga] = useState('')
  const [tipoNovaLiga, setTipoNovaLiga] = useState('fechada')
  const [numeroEntrar, setNumeroEntrar] = useState('')
  const [senhaEntrar, setSenhaEntrar] = useState('')
  const [enviandoCriar, setEnviandoCriar] = useState(false)
  const [enviandoEntrar, setEnviandoEntrar] = useState(false)
  const [erroForm, setErroForm] = useState(null)

  const [ligaSelecionadaId, setLigaSelecionadaId] = useState(null)
  const [detalheLiga, setDetalheLiga] = useState(null)
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false)
  const [processandoAcao, setProcessandoAcao] = useState(false)
  const [erroDetalhe, setErroDetalhe] = useState(null)
  const [, forcarRerender] = useState(0) // só pra atualizar o countdown a cada segundo

  const pollRef = useRef(null)
  const pollDetalheRef = useRef(null)
  const countdownRef = useRef(null)

  const carregarListas = useCallback(async () => {
    try {
      const [minhas, abertas] = await Promise.all([
        listarMinhasLigas(),
        listarLigasAbertas(),
      ])
      setMinhasLigas(minhas?.ligas || [])
      setLigasAbertas(abertas?.ligas || [])
    } catch (e) {
      // Falha pontual no polling não deve travar a tela.
      console.error('Erro ao atualizar listas de ligas:', e)
    }
  }, [])

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      try {
        const [tecnicoData] = await Promise.all([
          getTecnicoMe(),
          carregarListas(),
        ])
        if (cancelado) return
        setMoedas(tecnicoData?.tecnico?.clube_proprio?.moedas ?? 0)
        setCarregando(false)
      } catch (e) {
        if (cancelado) return
        setErro(e.message || 'Não foi possível carregar as ligas.')
        setCarregando(false)
      }
    }

    carregar()
    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    pollRef.current = setInterval(carregarListas, POLL_MS)
    return () => clearInterval(pollRef.current)
  }, [carregarListas])

  const carregarDetalhe = useCallback(async (ligaId) => {
    try {
      const resultado = await buscarDetalheLiga(ligaId)
      setDetalheLiga(resultado)
    } catch (e) {
      setErroDetalhe(e.message || 'Não foi possível carregar a liga.')
    }
  }, [])

  const abrirDetalhe = async (ligaId) => {
    setLigaSelecionadaId(ligaId)
    setDetalheLiga(null)
    setErroDetalhe(null)
    setCarregandoDetalhe(true)
    await carregarDetalhe(ligaId)
    setCarregandoDetalhe(false)
  }

  const fecharDetalhe = () => {
    setLigaSelecionadaId(null)
    setDetalheLiga(null)
    setErroDetalhe(null)
  }

  useEffect(() => {
    if (!ligaSelecionadaId) return
    pollDetalheRef.current = setInterval(() => carregarDetalhe(ligaSelecionadaId), POLL_DETALHE_MS)
    return () => clearInterval(pollDetalheRef.current)
  }, [ligaSelecionadaId, carregarDetalhe])

  // Contagem regressiva do autostart — só um tick de UI, quem decide de
  // verdade quando a liga começa é o backend (lib/ligasMotor.js).
  useEffect(() => {
    if (!detalheLiga?.liga?.autostart_at) return
    countdownRef.current = setInterval(() => forcarRerender((n) => n + 1), 1000)
    return () => clearInterval(countdownRef.current)
  }, [detalheLiga?.liga?.autostart_at])

  async function handleCriar() {
    if (!nomeLiga.trim() || enviandoCriar) return
    setEnviandoCriar(true)
    setErroForm(null)
    try {
      const resultado = await criarLiga(nomeLiga.trim(), tipoNovaLiga)
      setNomeLiga('')
      setShowCriar(false)
      await carregarListas()
      if (resultado?.liga?.id) {
        abrirDetalhe(resultado.liga.id)
      }
    } catch (e) {
      setErroForm(e.message || 'Não foi possível criar a liga.')
    } finally {
      setEnviandoCriar(false)
    }
  }

  async function handleEntrarComCodigo() {
    if (!numeroEntrar.trim() || enviandoEntrar) return
    setEnviandoEntrar(true)
    setErroForm(null)
    try {
      const resultado = await entrarNaLiga(numeroEntrar.trim(), senhaEntrar.trim())
      setNumeroEntrar('')
      setSenhaEntrar('')
      setShowEntrar(false)
      await carregarListas()
      if (resultado?.liga_id) {
        abrirDetalhe(resultado.liga_id)
      }
    } catch (e) {
      setErroForm(e.message || 'Não foi possível entrar na liga.')
    } finally {
      setEnviandoEntrar(false)
    }
  }

  async function handleEntrarDireto(numero) {
    setProcessandoAcao(true)
    setErroDetalhe(null)
    try {
      const resultado = await entrarNaLiga(numero)
      await carregarListas()
      if (resultado?.liga_id) {
        abrirDetalhe(resultado.liga_id)
      }
    } catch (e) {
      setErro(e.message || 'Não foi possível entrar na liga.')
    } finally {
      setProcessandoAcao(false)
    }
  }

  async function handleSair() {
    if (!ligaSelecionadaId || processandoAcao) return
    setProcessandoAcao(true)
    setErroDetalhe(null)
    try {
      await sairDaLiga(ligaSelecionadaId)
      fecharDetalhe()
      await carregarListas()
    } catch (e) {
      setErroDetalhe(e.message || 'Não foi possível sair da liga.')
    } finally {
      setProcessandoAcao(false)
    }
  }

  async function handleDarPlay() {
    if (!ligaSelecionadaId || processandoAcao) return
    setProcessandoAcao(true)
    setErroDetalhe(null)
    try {
      await darPlayNaLiga(ligaSelecionadaId)
      await carregarDetalhe(ligaSelecionadaId)
      await carregarListas()
    } catch (e) {
      setErroDetalhe(e.message || 'Não foi possível dar play na liga.')
    } finally {
      setProcessandoAcao(false)
    }
  }

  async function handleAlternarTipo() {
    if (!ligaSelecionadaId || processandoAcao) return
    setProcessandoAcao(true)
    setErroDetalhe(null)
    try {
      await alternarTipoLiga(ligaSelecionadaId)
      await carregarDetalhe(ligaSelecionadaId)
      await carregarListas()
    } catch (e) {
      setErroDetalhe(e.message || 'Não foi possível mudar o tipo da liga.')
    } finally {
      setProcessandoAcao(false)
    }
  }

  function copiar(texto) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(texto).catch(() => {})
    }
  }

  if (carregando) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: '#fff', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#9CA3AF' }}>Carregando ligas...</span>
      </div>
    )
  }

  if (erro && minhasLigas.length === 0 && ligasAbertas.length === 0) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: '#fff', height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '16px', textAlign: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
        <button onClick={() => navigate('/painel')} style={{ background: '#F97316', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 32px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          VOLTAR
        </button>
      </div>
    )
  }

  const liga = detalheLiga?.liga
  const membros = detalheLiga?.membros || []
  const souCriador = liga && liga.meu_tecnico_id === liga.criador_id
  const segundosAutostart = liga ? formatarSegundosRestantes(liga.autostart_at) : null

  const classificacaoOrdenada = liga?.classificacao
    ? Object.entries(liga.classificacao).sort(([, a], [, b]) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos
        const saldoA = a.gols_pro - a.gols_contra
        const saldoB = b.gols_pro - b.gols_contra
        if (saldoB !== saldoA) return saldoB - saldoA
        return b.gols_pro - a.gols_pro
      })
    : []

  const nomeDoCampeao = liga?.campeao_tecnico_id
    ? membros.find((m) => m.tecnico_id === liga.campeao_tecnico_id)?.nome ?? 'Técnico'
    : null

  const STATUS_LABEL_PARTIDA = { aguardando: 'AGUARDANDO', em_andamento: 'AO VIVO', concluida: 'ENCERRADA' }
  const STATUS_COR_PARTIDA = { aguardando: '#F97316', em_andamento: '#10B981', concluida: '#6B7280' }

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#FFFFFF', height: '100dvh',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* HEADER */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C' }}>Ligas Privadas</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <img src={iconCoin} alt="" style={{ width: '16px', height: '16px' }} />
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C' }}>{moedas.toLocaleString('pt-BR')}</span>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* BOTÕES CRIAR / ENTRAR */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button
            onClick={() => { setShowCriar((v) => !v); setShowEntrar(false); setErroForm(null) }}
            style={{
              flex: 1, padding: '14px 0',
              background: '#F97316', color: '#FFFFFF',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '700', fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span> CRIAR LIGA
          </button>
          <button
            onClick={() => { setShowEntrar((v) => !v); setShowCriar(false); setErroForm(null) }}
            style={{
              flex: 1, padding: '14px 0',
              background: '#FFFFFF', color: '#1C1C1C',
              border: '2px solid #1C1C1C', borderRadius: '10px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '700', fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <span style={{ fontSize: '16px' }}>↪</span> ENTRAR COM NÚMERO
          </button>
        </div>

        {/* FORM CRIAR LIGA */}
        {showCriar && (
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C', marginBottom: '10px' }}>
              Nome da liga
            </div>
            <input
              type="text"
              placeholder="Ex: Liga dos Brabos"
              value={nomeLiga}
              onChange={(e) => setNomeLiga(e.target.value)}
              maxLength={40}
              style={{
                width: '100%', padding: '12px', boxSizing: 'border-box',
                border: '1.5px solid #E5E7EB', borderRadius: '8px',
                fontSize: '14px', fontFamily: "'Inter', sans-serif",
                outline: 'none', marginBottom: '10px',
              }}
            />
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', marginBottom: '8px' }}>
              Tipo da liga
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => setTipoNovaLiga('fechada')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  border: tipoNovaLiga === 'fechada' ? '2px solid #F97316' : '1.5px solid #E5E7EB',
                  background: tipoNovaLiga === 'fechada' ? '#FFF7ED' : '#fff',
                  color: '#1C1C1C', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                🔒 Fechada (senha)
              </button>
              <button
                onClick={() => setTipoNovaLiga('aberta')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px',
                  border: tipoNovaLiga === 'aberta' ? '2px solid #F97316' : '1.5px solid #E5E7EB',
                  background: tipoNovaLiga === 'aberta' ? '#FFF7ED' : '#fff',
                  color: '#1C1C1C', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                🌐 Aberta (lista pública)
              </button>
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '12px', lineHeight: '1.4' }}>
              Custa 10 moedas pra entrar (você já entra ao criar). Até 8 participantes. Quem vencer leva o pote inteiro.
            </div>
            {erroForm && (
              <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: '600', marginBottom: '10px' }}>{erroForm}</div>
            )}
            <button
              onClick={handleCriar}
              disabled={!nomeLiga.trim() || enviandoCriar}
              style={{
                width: '100%', padding: '12px',
                background: (!nomeLiga.trim() || enviandoCriar) ? '#FDBA74' : '#F97316', color: '#FFFFFF',
                border: 'none', borderRadius: '8px', cursor: (!nomeLiga.trim() || enviandoCriar) ? 'default' : 'pointer',
                fontSize: '14px', fontWeight: '700', fontFamily: "'Inter', sans-serif",
              }}
            >
              {enviandoCriar ? 'CRIANDO...' : 'CRIAR'}
            </button>
          </div>
        )}

        {/* FORM ENTRAR COM NÚMERO */}
        {showEntrar && (
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C', marginBottom: '10px' }}>
              Número da liga
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex: 482913"
              value={numeroEntrar}
              onChange={(e) => setNumeroEntrar(e.target.value.replace(/\D/g, ''))}
              style={{
                width: '100%', padding: '12px', boxSizing: 'border-box',
                border: '1.5px solid #E5E7EB', borderRadius: '8px',
                fontSize: '14px', fontFamily: "'Inter', sans-serif",
                outline: 'none', marginBottom: '10px',
                letterSpacing: '2px',
              }}
            />
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C', marginBottom: '10px' }}>
              Senha (só se for liga fechada)
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex: 4821"
              value={senhaEntrar}
              onChange={(e) => setSenhaEntrar(e.target.value.replace(/\D/g, ''))}
              maxLength={4}
              style={{
                width: '100%', padding: '12px', boxSizing: 'border-box',
                border: '1.5px solid #E5E7EB', borderRadius: '8px',
                fontSize: '14px', fontFamily: "'Inter', sans-serif",
                outline: 'none', marginBottom: '10px',
                letterSpacing: '2px',
              }}
            />
            {erroForm && (
              <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: '600', marginBottom: '10px' }}>{erroForm}</div>
            )}
            <button
              onClick={handleEntrarComCodigo}
              disabled={!numeroEntrar.trim() || enviandoEntrar}
              style={{
                width: '100%', padding: '12px',
                background: (!numeroEntrar.trim() || enviandoEntrar) ? '#4B5563' : '#1C1C1C', color: '#FFFFFF',
                border: 'none', borderRadius: '8px', cursor: (!numeroEntrar.trim() || enviandoEntrar) ? 'default' : 'pointer',
                fontSize: '14px', fontWeight: '700', fontFamily: "'Inter', sans-serif",
              }}
            >
              {enviandoEntrar ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </div>
        )}

        {/* MINHAS LIGAS PRIVADAS */}
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C', marginBottom: '12px' }}>
          MINHAS LIGAS PRIVADAS
        </div>

        {minhasLigas.length === 0 && (
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>
            Você ainda não criou nem entrou em nenhuma liga privada.
          </div>
        )}

        {minhasLigas.map((l) => (
          <button
            key={l.id}
            onClick={() => abrirDetalhe(l.id)}
            style={{
              width: '100%', textAlign: 'left',
              background: '#FFFFFF', border: '1px solid #E5E7EB',
              borderRadius: '12px', padding: '14px', marginBottom: '12px',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1C' }}>{l.nome}</span>
              <span style={{ fontSize: '18px', color: '#6B7280' }}>›</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: STATUS_COR[l.status], background: '#F5F5F5', padding: '3px 8px', borderRadius: '99px' }}>
                {STATUS_LABEL[l.status] ?? l.status}
              </span>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>{l.tipo === 'fechada' ? '🔒 Fechada' : '🌐 Aberta'}</span>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>{l.participantes}/{l.max_participantes}</span>
              <span style={{ fontSize: '12px', color: '#F97316', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <img src={iconCoin} alt="" style={{ width: '12px', height: '12px' }} /> {l.pote}
              </span>
            </div>
          </button>
        ))}

        {/* LIGAS ABERTAS PRA ENTRAR */}
        {ligasAbertas.filter((l) => !minhasLigas.some((m) => m.id === l.id)).length > 0 && (
          <>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C', margin: '20px 0 12px' }}>
              LIGAS ABERTAS PRA ENTRAR
            </div>
            {ligasAbertas.filter((l) => !minhasLigas.some((m) => m.id === l.id)).map((l) => (
              <div key={l.id} style={{
                background: '#FFFFFF', border: '1px solid #E5E7EB',
                borderRadius: '12px', padding: '14px', marginBottom: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C', marginBottom: '4px' }}>{l.nome}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>{l.participantes}/{l.max_participantes} participantes</span>
                    <span style={{ fontSize: '12px', color: '#F97316', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <img src={iconCoin} alt="" style={{ width: '12px', height: '12px' }} /> {l.pote}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleEntrarDireto(l.numero)}
                  disabled={processandoAcao}
                  style={{
                    padding: '8px 16px',
                    background: '#FFFFFF', color: '#F97316',
                    border: '1.5px solid #F97316', borderRadius: '8px',
                    fontSize: '12px', fontWeight: '700', cursor: processandoAcao ? 'default' : 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  ENTRAR
                </button>
              </div>
            ))}
          </>
        )}

        {/* CARD EXPLICATIVO */}
        <div style={{
          background: '#F9FAFB', border: '1px solid #E5E7EB',
          borderRadius: '12px', padding: '14px',
          display: 'flex', alignItems: 'center', gap: '12px',
          marginTop: '8px', marginBottom: '8px',
        }}>
          <span style={{ fontSize: '32px', opacity: 0.6 }}>🔒</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C', marginBottom: '2px' }}>
              Como funciona
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>
              Todos jogam contra todos. Os 2 melhores disputam a final. Quem vencer leva o pote inteiro.
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM NAV */}
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end',
        padding: '4px 0 5px', borderTop: '1px solid #E5E7EB', background: 'white',
        flexShrink: 0,
      }}>
        {NAV_ITEMS_ESQUERDA.map(item => (
          <NavButton key={item.label} item={item} ativo={item.path === path} navigate={navigate} naoLidas={0} />
        ))}
        <BotaoJogar ativo={path === '/jogar'} navigate={navigate} />
        {NAV_ITEMS_DIREITA.map(item => (
          <NavButton key={item.label} item={item} ativo={item.path === path} navigate={navigate} naoLidas={0} />
        ))}
      </div>

      {/* POPUP DE DETALHE DA LIGA */}
      {ligaSelecionadaId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px',
            width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto',
            boxSizing: 'border-box',
          }}>
            {carregandoDetalhe && (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <span style={{ fontSize: '13px', color: '#9CA3AF' }}>Carregando...</span>
              </div>
            )}

            {!carregandoDetalhe && liga && (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#1C1C1C' }}>{liga.nome}</span>
                  <button onClick={fecharDetalhe} style={{ background: 'none', border: 'none', fontSize: '22px', color: '#9CA3AF', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: STATUS_COR[liga.status], background: '#F5F5F5', padding: '3px 8px', borderRadius: '99px' }}>
                    {STATUS_LABEL[liga.status] ?? liga.status}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>{liga.tipo === 'fechada' ? '🔒 Fechada' : '🌐 Aberta'}</span>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>{liga.participantes}/{liga.max_participantes}</span>
                </div>

                {/* POTE */}
                <div style={{
                  background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '12px',
                  padding: '12px 14px', marginBottom: '16px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <img src={iconCoin} alt="" style={{ width: '20px', height: '20px' }} /> {liga.pote}
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#9A3412', letterSpacing: '0.5px' }}>NO POTE — LEVA TUDO QUEM VENCER</div>
                </div>

                {/* NÚMERO E SENHA — só quando ainda tá no lobby, pra compartilhar */}
                {liga.status === 'lobby' && (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <div onClick={() => copiar(liga.numero)} style={{
                      flex: 1, background: '#F5F5F5', borderRadius: '10px', padding: '10px', textAlign: 'center', cursor: 'pointer',
                    }}>
                      <div style={{ fontSize: '9px', fontWeight: '700', color: '#6B7280', marginBottom: '2px' }}>NÚMERO (toque pra copiar)</div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C', letterSpacing: '2px' }}>{liga.numero}</div>
                    </div>
                    {liga.tipo === 'fechada' && liga.senha && (
                      <div onClick={() => copiar(liga.senha)} style={{
                        flex: 1, background: '#F5F5F5', borderRadius: '10px', padding: '10px', textAlign: 'center', cursor: 'pointer',
                      }}>
                        <div style={{ fontSize: '9px', fontWeight: '700', color: '#6B7280', marginBottom: '2px' }}>SENHA (toque pra copiar)</div>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C', letterSpacing: '2px' }}>{liga.senha}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* COUNTDOWN DE AUTOSTART */}
                {liga.status === 'lobby' && segundosAutostart !== null && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '10px 12px', marginBottom: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#EF4444' }}>
                      Liga cheia! Começa automático em {segundosAutostart}s
                    </span>
                  </div>
                )}

                {/* LISTA DE MEMBROS */}
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  PARTICIPANTES
                </div>
                <div style={{ marginBottom: '16px' }}>
                  {membros.map((m) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                      <EscudoTime cor1={m.clube?.cor_primaria ?? '#F97316'} cor2={m.clube?.cor_secundaria ?? '#1C1C1C'} size={32} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C' }}>{m.nome}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>{m.clube?.nome ?? 'Sem clube'}</div>
                      </div>
                      {m.tecnico_id === liga.criador_id && (
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#F97316' }}>CRIADOR</span>
                      )}
                    </div>
                  ))}
                </div>

                {erroDetalhe && (
                  <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>{erroDetalhe}</div>
                )}

                {/* AÇÕES — só fazem sentido enquanto a liga tá no lobby */}
                {liga.status === 'lobby' && (
                  <>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!souCriador && (
                        <button
                          onClick={handleSair}
                          disabled={processandoAcao}
                          style={{
                            flex: 1, padding: '13px',
                            background: '#fff', color: '#EF4444', border: '1.5px solid #FCA5A5', borderRadius: '10px',
                            fontSize: '13px', fontWeight: '700', cursor: processandoAcao ? 'default' : 'pointer',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          SAIR DA LIGA
                        </button>
                      )}
                      {souCriador && (
                        <button
                          onClick={handleDarPlay}
                          disabled={processandoAcao || liga.participantes < 2}
                          style={{
                            flex: 1, padding: '13px',
                            background: (processandoAcao || liga.participantes < 2) ? '#FDBA74' : '#F97316', color: '#fff', border: 'none', borderRadius: '10px',
                            fontSize: '13px', fontWeight: '700', cursor: (processandoAcao || liga.participantes < 2) ? 'default' : 'pointer',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          DAR PLAY
                        </button>
                      )}
                    </div>
                    {souCriador && (
                      <button
                        onClick={handleAlternarTipo}
                        disabled={processandoAcao}
                        style={{
                          width: '100%', marginTop: '8px', padding: '11px',
                          background: 'transparent', color: '#6B7280', border: '1.5px solid #E5E7EB', borderRadius: '10px',
                          fontSize: '12px', fontWeight: '700', cursor: processandoAcao ? 'default' : 'pointer',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {liga.tipo === 'fechada' ? 'TORNAR ABERTA' : 'TORNAR FECHADA'}
                      </button>
                    )}
                    {!souCriador && (
                      <div style={{ textAlign: 'center', padding: '8px', fontSize: '11px', color: '#9CA3AF' }}>
                        Só o criador pode dar play ou mudar o tipo da liga.
                      </div>
                    )}
                  </>
                )}

                {liga.status === 'finalizada' && liga.campeao_tecnico_id && (
                  <div style={{
                    background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '12px',
                    padding: '14px', marginBottom: '16px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>🏆</div>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#15803D', letterSpacing: '0.5px', marginBottom: '2px' }}>
                      CAMPEÃO DA LIGA
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '900', color: '#166534' }}>{nomeDoCampeao}</div>
                  </div>
                )}

                {classificacaoOrdenada.length > 0 && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', marginBottom: '8px', letterSpacing: '0.5px' }}>
                      CLASSIFICAÇÃO
                    </div>
                    <div style={{ marginBottom: '16px', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead>
                          <tr style={{ color: '#9CA3AF' }}>
                            <th style={{ textAlign: 'left', padding: '4px 4px', fontWeight: '700' }}>#</th>
                            <th style={{ textAlign: 'left', padding: '4px 4px', fontWeight: '700' }}>Clube</th>
                            <th style={{ padding: '4px 4px', fontWeight: '700' }}>P</th>
                            <th style={{ padding: '4px 4px', fontWeight: '700' }}>V</th>
                            <th style={{ padding: '4px 4px', fontWeight: '700' }}>E</th>
                            <th style={{ padding: '4px 4px', fontWeight: '700' }}>D</th>
                            <th style={{ padding: '4px 4px', fontWeight: '700' }}>SG</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classificacaoOrdenada.map(([clubeId, c], idx) => (
                            <tr key={clubeId} style={{ background: idx < 2 ? '#FFF7ED' : 'transparent', textAlign: 'center' }}>
                              <td style={{ padding: '6px 4px', fontWeight: '700', textAlign: 'left', color: '#1C1C1C' }}>{idx + 1}</td>
                              <td style={{ padding: '6px 4px', fontWeight: '600', textAlign: 'left', color: '#1C1C1C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                                {c.nome}
                              </td>
                              <td style={{ padding: '6px 4px', fontWeight: '900', color: '#1C1C1C' }}>{c.pontos}</td>
                              <td style={{ padding: '6px 4px', color: '#6B7280' }}>{c.vitorias}</td>
                              <td style={{ padding: '6px 4px', color: '#6B7280' }}>{c.empates}</td>
                              <td style={{ padding: '6px 4px', color: '#6B7280' }}>{c.derrotas}</td>
                              <td style={{ padding: '6px 4px', color: '#6B7280' }}>{c.gols_pro - c.gols_contra}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {detalheLiga?.partidas?.length > 0 && (
                  <>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', marginBottom: '8px', letterSpacing: '0.5px' }}>
                      CONFRONTOS
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      {detalheLiga.partidas.map((p) => {
                        const ehFinal = p.fase === 'final'
                        return (
                          <div key={p.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                            padding: '9px 10px', marginBottom: '6px', borderRadius: '10px',
                            background: ehFinal ? '#FFF7ED' : '#F5F5F5',
                            border: ehFinal ? '1px solid #FDBA74' : 'none',
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {ehFinal && (
                                <div style={{ fontSize: '9px', fontWeight: '900', color: '#F97316', marginBottom: '2px', letterSpacing: '0.5px' }}>
                                  🏆 FINAL
                                </div>
                              )}
                              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.tecnico_home_nome} x {p.tecnico_away_nome}
                              </div>
                            </div>
                            {p.status === 'concluida' ? (
                              <div style={{ fontSize: '14px', fontWeight: '900', color: '#1C1C1C', flexShrink: 0 }}>
                                {p.placar_home} - {p.placar_away}
                              </div>
                            ) : (
                              <div style={{
                                fontSize: '9px', fontWeight: '700', color: STATUS_COR_PARTIDA[p.status] ?? '#6B7280',
                                background: '#fff', padding: '3px 8px', borderRadius: '99px', flexShrink: 0, whiteSpace: 'nowrap',
                              }}>
                                {STATUS_LABEL_PARTIDA[p.status] ?? p.status}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}

                {liga.status === 'em_andamento' && classificacaoOrdenada.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#6B7280' }}>
                    A liga já começou. As partidas em sequência chegam na próxima atualização.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}