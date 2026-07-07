// src/pages/ResultadoPartida.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { getTecnicoMe } from '../lib/cacheTecnico'
import {
  buscarPartidaAtual,
  buscarEventosDaPartida,
  buscarClube,
  descobrirPartidaAtivaDoTecnico,
} from '../lib/partidaRealtime'
import { verificarSeFinalDeLiga } from '../lib/ligasApi'

import iconBallOrange from '../assets/icons/icon-ball-orange.png'
import iconInjury from '../assets/icons/lesao.png'
import iconSubstitution from '../assets/icons/subistituicao.png'
import iconTarget from '../assets/icons/alvo.png'
import iconGol from '../assets/icons/golnarrado.png'
import iconAmarelo from '../assets/icons/cartaoamarelo.png'
import iconVermelho from '../assets/icons/cartaovermelho.png'
import iconPenaltiIcon from '../assets/icons/penalidade.png'
import iconMicrofone from '../assets/icons/narrador.png'
import iconFalta from '../assets/icons/falta.png'

const RECOMPENSA_MOEDAS_VS_MAQUINA = { vitoria: 10, empate: 5, derrota: 0 }
const RECOMPENSA_XP_VS_MAQUINA = { vitoria: 30, empate: 15, derrota: 5 }
const RECOMPENSA_MOEDAS_ONLINE = { vitoria: 15, empate: 5, derrota: 0 }
const RECOMPENSA_XP_ONLINE = { vitoria: 90, empate: 45, derrota: 15 }

const NOTA_MINIMA_PARA_EVOLUIR = 8.5

const POSICAO_LABEL = { Goalkeeper: 'GOL', Defender: 'ZAG', Midfielder: 'MEI', Attacker: 'ATA' }

const EscudoTime = ({ cor1 = '#F97316', cor2 = '#1C1C1C', size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill={cor1}/>
    <path d="M32 2V70C48 66 60 54 60 38V14L32 2Z" fill={cor2}/>
    <line x1="32" y1="2" x2="32" y2="70" stroke="white" strokeWidth="2"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke="white" strokeWidth="2.5" fill="none"/>
  </svg>
)

const EscudoGenerico = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 72" fill="none">
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" fill="#3B82F6"/>
    <path d="M32 2L4 14V38C4 54 16 66 32 70C48 66 60 54 60 38V14L32 2Z" stroke="white" strokeWidth="2.5" fill="none"/>
    <circle cx="32" cy="37" r="13" fill="white"/>
    <circle cx="32" cy="37" r="4.5" fill="#1C1C1C"/>
  </svg>
)

export default function ResultadoPartida() {
  const navigate = useNavigate()
  const location = useLocation()
  const partidaIdRecebido = location.state?.partidaId

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [ultimaCompeticao, setUltimaCompeticao] = useState(null)
  const [partidaFinalizadaEm, setPartidaFinalizadaEm] = useState(null)

  const [meuClube, setMeuClube] = useState(null)
  const [adversario, setAdversario] = useState(null)
  const [placarMeu, setPlacarMeu] = useState(0)
  const [placarAdversario, setPlacarAdversario] = useState(0)
  const [eventos, setEventos] = useState([])
  const [recompensaMoedas, setRecompensaMoedas] = useState(0)
  const [recompensaXp, setRecompensaXp] = useState(0)
  const [jogadoresEvoluidos, setJogadoresEvoluidos] = useState([])
  const [ligaFinalizada, setLigaFinalizada] = useState(null)

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

        if (partida.finalizada_at) setPartidaFinalizadaEm(partida.finalizada_at)

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

        const placarHome = partida.placar_home ?? 0
        const placarAway = partida.placar_away ?? 0
        const meuPlacar = lado === 'home' ? placarHome : placarAway
        const placarDoOutro = lado === 'home' ? placarAway : placarHome

        const resultado = meuPlacar > placarDoOutro ? 'vitoria' : meuPlacar === placarDoOutro ? 'empate' : 'derrota'
        const ehOnline = partida.modo === 'online'
        const ehApostada = partida.modo === 'apostada'
        const ehLiga = partida.modo === 'liga'

        let moedasExibidas;
        if (ehApostada) {
          const valorAposta = partida.valor_aposta || 0
          const tabelaApostada = { vitoria: valorAposta * 2, empate: valorAposta, derrota: 0 }
          moedasExibidas = tabelaApostada[resultado] ?? 0
        } else {
          const tabelaMoedas = (ehOnline || ehLiga) ? RECOMPENSA_MOEDAS_ONLINE : RECOMPENSA_MOEDAS_VS_MAQUINA
          moedasExibidas = tabelaMoedas[resultado] ?? 0
        }
        const tabelaXp = (ehOnline || ehApostada || ehLiga) ? RECOMPENSA_XP_ONLINE : RECOMPENSA_XP_VS_MAQUINA

        const meusJogadores = (lado === 'home' ? partida.dados_jogadores_home : partida.dados_jogadores_away) || []
        const idsMeusJogadores = new Set(meusJogadores.map((j) => j.id))
        const evoluidos = meusJogadores
          .filter((j) => j.titular !== false && (j.notaFinal ?? 0) >= NOTA_MINIMA_PARA_EVOLUIR)
          .map((j) => ({ id: j.id, nome: j.nome, posicao: POSICAO_LABEL[j.posicao] ?? j.posicao, notaFinal: j.notaFinal }))

        const eventosExistentes = await buscarEventosDaPartida(idDaPartida)
        if (cancelado) return

        setMeuClube({ nome: clube.nome, cor1: clube.cor_primaria ?? '#F97316', cor2: clube.cor_secundaria ?? '#1C1C1C' })
        setAdversario({ nome: clubeAdversario.nome, escudoUrl: clubeAdversario.escudo_url ?? null })
        setPlacarMeu(meuPlacar)
        setPlacarAdversario(placarDoOutro)
        setRecompensaMoedas(moedasExibidas)
        setRecompensaXp(tabelaXp[resultado] ?? 0)
        setJogadoresEvoluidos(evoluidos)
        setEventos((eventosExistentes || []).map((ev) => formatarEvento(ev, lado, idsMeusJogadores)))

        try {
          const dadosTorneio = await apiFetch('/api/competicao/ultima')
          if (!cancelado) setUltimaCompeticao(dadosTorneio?.competicao ?? false)
        } catch {
          if (!cancelado) setUltimaCompeticao(false)
        }

        if (ehLiga) {
          try {
            const infoLiga = await verificarSeFinalDeLiga(idDaPartida)
            if (!cancelado && infoLiga?.ehFinalDeLiga && infoLiga.liga?.status === 'finalizada') {
              setLigaFinalizada({
                ...infoLiga.liga,
                souCampeao: infoLiga.liga.campeao_tecnico_id === tecnicoData?.tecnico?.id,
              })
            }
          } catch (e) {
            console.error('Erro ao verificar final de liga:', e)
          }
        }

        setCarregando(false)
      } catch (e) {
        if (cancelado) return
        setErro(e.message || 'Não foi possível carregar o resultado da partida.')
        setCarregando(false)
      }
    }

    carregar()
    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function formatarEvento(ev, lado, idsMeusJogadores) {
    const ehMeu = ev.lado
      ? ev.lado === lado
      : (ev.elenco_jogador_id ? idsMeusJogadores.has(ev.elenco_jogador_id) : null)

    const titulos = {
      gol: ehMeu === null ? 'GOOOL!!!' : ehMeu ? 'GOOOL DO SEU TIME!!!' : 'GOOOL DO ADVERSÁRIO!!!',
      cartao_amarelo: 'Cartão amarelo',
      cartao_vermelho: 'Cartão vermelho — expulsão!',
      lesao: ehMeu ? 'Lesão no seu time' : 'Lesão no adversário',
      lesao_iniciada: ehMeu ? 'Atenção no seu time' : 'Atenção no adversário',
      substituicao: 'Substituição',
      penalti_sinalizado: ehMeu === null ? 'PÊNALTI!!!' : ehMeu ? 'PÊNALTI PARA O SEU TIME!!!' : 'PÊNALTI PARA O ADVERSÁRIO!!!',
      penalti_marcado: ehMeu === null ? 'GOOOL DE PÊNALTI!!!' : ehMeu ? 'GOOOL DE PÊNALTI DO SEU TIME!!!' : 'GOOOL DE PÊNALTI DO ADVERSÁRIO!!!',
      penalti_perdido: ehMeu ? 'Seu time perdeu o pênalti' : 'Adversário perdeu o pênalti',
      jogada_saida: 'Saída de bola',
      jogada_construcao: 'Construção',
      jogada_continuacao: 'Jogada em andamento',
      jogada_progressao: ehMeu ? 'Seu time atacou' : 'Adversário atacou',
      jogada_desarme: ehMeu ? 'Recuperou a bola' : 'Adversário recuperou',
      jogada_pressao: ehMeu ? 'Pressão do adversário' : 'Pressão do seu time',
      jogada_fora: 'Chute para fora',
      jogada_defesa: ehMeu ? 'Defesa do adversário' : 'Boa defesa!',
      jogada_escanteio: 'Escanteio',
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

  const corPorTime = (ehMeu) => {
    if (ehMeu === true) return { bg: '#ECFDF5', border: '#10B981' }
    if (ehMeu === false) return { bg: '#FEF2F2', border: '#EF4444' }
    return { bg: '#F3F4F6', border: '#9CA3AF' }
  }

  const IconeBolaComX = ({ bg, border }) => (
    <div style={{ width: 32, height: 32, borderRadius: '50%', background: bg, border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke={border} strokeWidth="1.5" fill="none"/>
        <path d="M4 4L16 16M16 4L4 16" stroke={border} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  )

  const iconeEvento = (tipo, ehMeu) => {
    const { bg, border } = corPorTime(ehMeu)
    const wrap = (children) => (
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: bg, border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {children}
      </div>
    )
    if (tipo === 'gol' || tipo === 'penalti_marcado')
      return (
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: bg, border: `3px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={iconGol} alt="gol" style={{ width: 23, height: 23 }} />
        </div>
      )
    if (tipo === 'penalti_sinalizado')
      return (
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: bg, border: `3px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={iconPenaltiIcon} alt="penalti" style={{ width: 21, height: 21 }} />
        </div>
      )
    if (tipo === 'cartao_amarelo')
      return wrap(<img src={iconAmarelo} alt="amarelo" style={{ width: 17, height: 17 }} />)
    if (tipo === 'cartao_vermelho')
      return wrap(<img src={iconVermelho} alt="vermelho" style={{ width: 17, height: 17 }} />)
    if (tipo === 'lesao')
      return wrap(<img src={iconInjury} alt="lesao" style={{ width: 19, height: 19 }} />)
    if (tipo === 'substituicao')
      return wrap(<img src={iconSubstitution} alt="substituicao" style={{ width: 19, height: 19 }} />)
    if (tipo === 'penalti_perdido')
      return wrap(<img src={iconPenaltiIcon} alt="penalti perdido" style={{ width: 17, height: 17 }} />)
    if (tipo === 'jogada_saida' || tipo === 'jogada_construcao' || tipo === 'jogada_continuacao' || tipo === 'jogada_pressao')
      return wrap(<img src={iconMicrofone} alt="narração" style={{ width: 15, height: 15 }} />)
    if (tipo === 'jogada_progressao')
      return wrap(<img src={iconBallOrange} alt="ataque" style={{ width: 15, height: 15 }} />)
    if (tipo === 'jogada_desarme' || tipo === 'jogada_defesa')
      return wrap(<img src={iconTarget} alt="defesa" style={{ width: 15, height: 15 }} />)
    if (tipo === 'jogada_fora')
      return <IconeBolaComX bg={bg} border={border} />
    if (tipo === 'jogada_escanteio')
      return wrap(<img src={iconBallOrange} alt="escanteio" style={{ width: 15, height: 15 }} />)
    if (tipo === 'disputa_dura')
      return wrap(<img src={iconTarget} alt="disputa" style={{ width: 15, height: 15 }} />)
    if (tipo === 'falta')
      return wrap(<img src={iconFalta} alt="falta" style={{ width: 17, height: 17 }} />)
    if (tipo === 'lesao_iniciada')
      return wrap(<img src={iconInjury} alt="atenção" style={{ width: 15, height: 15, opacity: 0.6 }} />)
    return null
  }

  const handleSair = () => navigate('/jogar')

  const competicaoLigadaAEstaPartida = ultimaCompeticao && partidaFinalizadaEm
    ? Math.abs(new Date(ultimaCompeticao.updated_at).getTime() - new Date(partidaFinalizadaEm).getTime()) < 15000
    : false

  const statusFinalDoTorneio = ultimaCompeticao && competicaoLigadaAEstaPartida && ['eliminado', 'campeao'].includes(ultimaCompeticao.status)
    ? ultimaCompeticao.status
    : null
  const torneioAindaAtivo = ultimaCompeticao && !['eliminado', 'campeao'].includes(ultimaCompeticao.status)

  const handleJogarNovamente = () => {
    if (torneioAindaAtivo) {
      navigate('/torneio-carreira')
    } else if (statusFinalDoTorneio) {
      navigate('/modo-carreira')
    } else {
      navigate('/buscando-partida')
    }
  }

  if (carregando) {
    return (
      <div style={{
        maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif",
        background: '#FFFFFF', height: '100dvh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280' }}>Carregando resultado...</span>
      </div>
    )
  }

  if (erro) {
    return (
      <div style={{
        maxWidth: '480px', margin: '0 auto', fontFamily: "'Inter', sans-serif",
        background: '#FFFFFF', height: '100dvh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px', gap: '16px', boxSizing: 'border-box', textAlign: 'center',
      }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
        <button
          onClick={handleSair}
          style={{
            background: '#F97316', color: '#fff', border: 'none', borderRadius: '12px',
            padding: '12px 28px', fontSize: '13px', fontWeight: '700',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          VOLTAR
        </button>
      </div>
    )
  }

  const venceu = placarMeu > placarAdversario
  const empatou = placarMeu === placarAdversario
  const corResultado = venceu ? '#10B981' : empatou ? '#F59E0B' : '#EF4444'
  const labelResultado = venceu ? 'VITÓRIA!' : empatou ? 'EMPATE' : 'DERROTA'

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#FFFFFF', height: '100dvh',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      <div style={{ background: '#F5F5F5', padding: '24px 20px', flexShrink: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <span style={{
            fontSize: '14px', fontWeight: '900', color: corResultado,
            letterSpacing: '2px',
          }}>
            {labelResultado}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
            <EscudoTime cor1={meuClube?.cor1} cor2={meuClube?.cor2} size={56} />
            <span style={{ fontSize: '12px', fontWeight: '900', color: '#1C1C1C', textAlign: 'center' }}>
              {(meuClube?.nome ?? '').toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
            <span style={{ fontSize: '40px', fontWeight: '900', color: '#1C1C1C' }}>{placarMeu}</span>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#F97316' }}>x</span>
            <span style={{ fontSize: '40px', fontWeight: '900', color: '#1C1C1C' }}>{placarAdversario}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
            {adversario?.escudoUrl ? (
              <img
                src={adversario.escudoUrl}
                alt={adversario.nome}
                style={{ width: 56, height: 56, objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <EscudoGenerico size={56} />
            )}
            <span style={{ fontSize: '12px', fontWeight: '900', color: '#1C1C1C', textAlign: 'center' }}>
              {(adversario?.nome ?? '').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
        <div style={{
          background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '12px',
          padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '17px', fontWeight: '900', color: '#F97316' }}>
              {recompensaMoedas > 0 ? `+${recompensaMoedas}` : recompensaMoedas}
            </div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#9A3412', letterSpacing: '0.5px' }}>MOEDAS</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: '#FDBA74' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '17px', fontWeight: '900', color: '#F97316' }}>+{recompensaXp}</div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#9A3412', letterSpacing: '0.5px' }}>XP</div>
          </div>
        </div>
      </div>

      {jogadoresEvoluidos.length > 0 && (
        <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
          <div style={{
            background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '12px',
            padding: '10px 14px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', marginBottom: '6px', letterSpacing: '0.5px' }}>
              📈 EVOLUÍRAM NESTA PARTIDA
            </div>
            {jogadoresEvoluidos.map((j) => (
              <div key={j.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1C' }}>
                  {j.nome} <span style={{ color: '#10B981' }}>({j.posicao})</span>
                </span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#047857' }}>nota {j.notaFinal.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '13px', fontWeight: '800', color: '#1C1C1C', marginBottom: '10px' }}>
          RESUMO DA PARTIDA
        </div>

        <div style={{
          border: '1.5px solid #E5E7EB', borderRadius: '14px',
          flex: 1, overflowY: 'auto',
        }}>
          {eventos.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
              Nenhum evento de destaque nesta partida.
            </div>
          )}
          {eventos.map((ev, idx) => {
            const ehGol = ev.tipo === 'gol' || ev.tipo === 'penalti_marcado' || ev.tipo === 'penalti_sinalizado'
            const fundoLinha = ev.ehMeu === true ? '#ECFDF5' : ev.ehMeu === false ? '#FEF2F2' : 'transparent'
            return (
              <div key={ev.id} style={{
                padding: ehGol ? '12px 14px' : '10px 14px',
                borderBottom: idx < eventos.length - 1 ? '1px solid #F5F5F5' : 'none',
                display: 'flex', alignItems: 'center', gap: '10px',
                background: ehGol ? (ev.ehMeu ? '#D1FAE5' : '#FEE2E2') : fundoLinha,
              }}>
                {iconeEvento(ev.tipo, ev.ehMeu)}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: ehGol ? '14px' : '12px', fontWeight: '800', color: ehGol ? (ev.ehMeu ? '#10B981' : '#EF4444') : '#F97316' }}>{ev.minuto}'</span>
                    <span style={{ fontSize: ehGol ? '14px' : '12px', fontWeight: ehGol ? '900' : '700', color: ehGol ? (ev.ehMeu ? '#10B981' : '#EF4444') : '#1C1C1C' }}>
                      {ehGol ? ev.titulo : (ev.descricao || ev.titulo)}
                    </span>
                  </div>
                  {ehGol && ev.descricao && (
                    <span style={{ fontSize: '11px', color: '#1C1C1C', fontWeight: '500' }}>{ev.descricao}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '16px', flexShrink: 0, display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSair}
          style={{
            flex: 1, background: '#fff', color: '#1C1C1C',
            border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '14px',
            fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          SAIR
        </button>
        <button
          onClick={handleJogarNovamente}
          style={{
            flex: 1, background: '#F97316', color: '#fff',
            border: 'none', borderRadius: '12px', padding: '14px',
            fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          {torneioAindaAtivo ? 'PRÓXIMO JOGO' : statusFinalDoTorneio ? 'ESCOLHER NOVO TORNEIO' : 'JOGAR DE NOVO'}
        </button>
      </div>

      {statusFinalDoTorneio && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '18px', padding: '28px 24px',
            width: '100%', maxWidth: '380px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              {statusFinalDoTorneio === 'campeao' ? '🏆' : '😔'}
            </div>
            <div style={{
              fontSize: '18px', fontWeight: '900',
              color: statusFinalDoTorneio === 'campeao' ? '#10B981' : '#EF4444',
              marginBottom: '8px',
            }}>
              {statusFinalDoTorneio === 'campeao' ? 'Campeão!' : 'Eliminado'}
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5', marginBottom: '24px' }}>
              {statusFinalDoTorneio === 'campeao'
                ? `Você venceu o Modo ${ultimaCompeticao?.modo === 'avancado' ? 'Avançado' : 'Normal'} e levou o prêmio de campeão para casa.`
                : `Sua campanha no Modo ${ultimaCompeticao?.modo === 'avancado' ? 'Avançado' : 'Normal'} terminou aqui. As moedas e XP já ganhos continuam valendo.`}
            </div>
            <button
              onClick={() => navigate('/modo-carreira')}
              style={{
                width: '100%', background: '#F97316', color: '#fff',
                border: 'none', borderRadius: '12px', padding: '14px',
                fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              ENTRAR EM OUTRO TORNEIO
            </button>
          </div>
        </div>
      )}

      {ligaFinalizada && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '18px', padding: '28px 24px',
            width: '100%', maxWidth: '380px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              {ligaFinalizada.souCampeao ? '🏆' : '🥈'}
            </div>
            <div style={{
              fontSize: '18px', fontWeight: '900',
              color: ligaFinalizada.souCampeao ? '#10B981' : '#6B7280',
              marginBottom: '8px',
            }}>
              {ligaFinalizada.souCampeao ? 'Campeão da Liga!' : 'Liga encerrada'}
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5', marginBottom: '24px' }}>
              {ligaFinalizada.souCampeao
                ? `Você venceu a liga "${ligaFinalizada.nome}" e levou o pote de ${ligaFinalizada.pote} moedas para casa.`
                : `A liga "${ligaFinalizada.nome}" terminou. O pote de ${ligaFinalizada.pote} moedas foi para o campeão.`}
            </div>
            <button
              onClick={() => navigate('/liga-privada')}
              style={{
                width: '100%', background: '#F97316', color: '#fff',
                border: 'none', borderRadius: '12px', padding: '14px',
                fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              VER LIGAS
            </button>
          </div>
        </div>
      )}

    </div>
  )
}