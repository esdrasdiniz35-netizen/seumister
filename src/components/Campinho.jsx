import { useState, useEffect, useRef } from 'react'
import iconGol from '../assets/icons/gol.png'
import iconPenalti from '../assets/icons/penalti.png'
import iconLesao from '../assets/icons/lesao.png'
import iconAmarelo from '../assets/icons/amarelo.png'
import iconVermelho from '../assets/icons/vermelho.png'

// ★ 05/07/2026 — Campinho visual, v2 (correção de 3 bugs reais achados
// jogando de verdade):
//
// BUG 1 — a cada tick, home e away geram evento quase ao mesmo tempo. O
// React batchava as duas atualizações de posição e só a última "vencia"
// visualmente — metade dos eventos sumia sem nunca aparecer na tela,
// dando a sensação de "bola teleportando entre pontos soltos". Corrigido
// com uma FILA: todo evento novo entra numa fila (useRef, não state), e
// um intervalo próprio consome um item de cada vez, sempre — nenhum
// evento é descartado só porque chegou perto de outro.
//
// BUG 2 — o campo `lado` do evento é o crédito narrativo (de quem é o
// escanteio, o cartão, etc.), que NEM SEMPRE é o time de quem a posição
// (x,y) foi gravada (ex: cartão é do defensor, mas a posição é de quem
// tava com a bola, do time atacante). Usar `lado` pra decidir se espelha
// o Y fazia a bola pular pro lado errado do campo em alguns tipos de
// evento. Corrigido usando `pos_lado` (campo novo, sempre correto) em
// vez de `lado` pra essa conta.
//
// BUG 3 — no gol, a posição gravada era de onde o jogador chutou, não de
// dentro do gol — por isso nunca "parecia" que a bola tinha entrado.
// Corrigido no motor (GOL_LINHA_Y), aqui só reflete isso.

function paraCoordenadaAbsoluta(evento) {
  if (evento.pos_x == null || evento.pos_y == null) return null
  const referencial = evento.pos_lado ?? evento.lado
  const x = evento.pos_x
  const y = referencial === 'home' ? evento.pos_y : 100 - evento.pos_y
  return { x, y }
}

const ICONE_POR_TIPO = {
  gol: iconGol,
  penalti_marcado: iconGol,
  penalti_sinalizado: iconPenalti,
  lesao: iconLesao,
  cartao_amarelo: iconAmarelo,
  cartao_vermelho: iconVermelho,
}

const DURACAO_ICONE_MS = 1600
const TAMANHO_RASTRO = 5
const INTERVALO_FILA_MS = 550

export default function Campinho({ eventos, meuLado = 'home' }) {
  const [posicaoBola, setPosicaoBola] = useState({ x: 50, y: 50 })
  const [rastro, setRastro] = useState([])
  const [corContorno, setCorContorno] = useState('#E5E7EB')
  const [iconeAtivo, setIconeAtivo] = useState(null)

  const quantidadeProcessada = useRef(0)
  const primeiraCargaRef = useRef(true)
  const filaRef = useRef([])
  const timeoutIconeRef = useRef(null)

  // Alimenta a fila (ou, na primeira carga, posiciona direto sem fila —
  // não faz sentido "reencenar" o jogo inteiro toda vez que a tela abre
  // ou o técnico dá refresh no meio da partida).
  useEffect(() => {
    if (!eventos || eventos.length === 0) return
    const novos = eventos.slice(quantidadeProcessada.current)
    if (novos.length === 0) return
    quantidadeProcessada.current = eventos.length

    if (primeiraCargaRef.current) {
      primeiraCargaRef.current = false
      for (let i = novos.length - 1; i >= 0; i--) {
        const coordenada = paraCoordenadaAbsoluta(novos[i])
        if (coordenada) {
          setPosicaoBola(coordenada)
          setRastro([coordenada])
          setCorContorno(novos[i].lado === meuLado ? '#F97316' : '#4B5563')
          break
        }
      }
      return
    }

    for (const evento of novos) {
      const coordenada = paraCoordenadaAbsoluta(evento)
      if (!coordenada) continue
      filaRef.current.push({
        coordenada,
        corContorno: evento.lado === meuLado ? '#F97316' : '#4B5563',
        icone: ICONE_POR_TIPO[evento.tipo] ?? null,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventos, meuLado])

  // Consome a fila em ritmo constante — cada item ganha seu momento na
  // tela, não importa quantos chegaram juntos do backend.
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (filaRef.current.length === 0) return
      const proximo = filaRef.current.shift()

      setPosicaoBola(proximo.coordenada)
      setRastro((atual) => [...atual, proximo.coordenada].slice(-TAMANHO_RASTRO))
      setCorContorno(proximo.corContorno)

      if (proximo.icone) {
        setIconeAtivo(proximo.icone)
        if (timeoutIconeRef.current) clearTimeout(timeoutIconeRef.current)
        timeoutIconeRef.current = setTimeout(() => setIconeAtivo(null), DURACAO_ICONE_MS)
      }
    }, INTERVALO_FILA_MS)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutIconeRef.current) clearTimeout(timeoutIconeRef.current)
    }
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        flex: 1,
        minHeight: 0,
        borderRadius: '12px',
        border: `3px solid ${corContorno}`,
        background: 'linear-gradient(180deg, #1E8A4C 0%, #1B7A43 100%)',
        overflow: 'hidden',
        transition: 'border-color 0.3s ease',
      }}
    >
      {/* Linhas do campo */}
      <div style={{
        position: 'absolute', left: '8%', right: '8%', top: 0, bottom: 0,
        borderLeft: '2px solid rgba(255,255,255,0.5)',
        borderRight: '2px solid rgba(255,255,255,0.5)',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '50%',
        borderTop: '2px solid rgba(255,255,255,0.5)',
      }} />
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        width: '18%', paddingBottom: '18%',
        border: '2px solid rgba(255,255,255,0.5)',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
      }} />

      {/* Grande área — topo (gol do away) */}
      <div style={{
        position: 'absolute', left: '25%', right: '25%', top: 0, height: '14%',
        border: '2px solid rgba(255,255,255,0.5)', borderTop: 'none',
      }} />
      {/* Grande área — embaixo (gol do home) */}
      <div style={{
        position: 'absolute', left: '25%', right: '25%', bottom: 0, height: '14%',
        border: '2px solid rgba(255,255,255,0.5)', borderBottom: 'none',
      }} />

      {/* ★ Gol de verdade — retângulo com "rede" (linhas cruzadas) bem na
          linha de fundo, mais estreito que a grande área, pra ficar
          claro onde a bola precisa entrar. */}
      <div style={{
        position: 'absolute', left: '40%', right: '40%', top: 0, height: '5%',
        border: '2px solid #FFFFFF',
        borderTop: 'none',
        background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 2px, transparent 2px 6px)',
      }} />
      <div style={{
        position: 'absolute', left: '40%', right: '40%', bottom: 0, height: '5%',
        border: '2px solid #FFFFFF',
        borderBottom: 'none',
        background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 2px, transparent 2px 6px)',
      }} />

      {/* Rastro da bola (fade-out) */}
      {rastro.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: '10px',
            height: '10px',
            marginLeft: '-5px',
            marginTop: '-5px',
            borderRadius: '50%',
            background: '#FFFFFF',
            opacity: ((i + 1) / TAMANHO_RASTRO) * 0.35,
            transition: `left ${INTERVALO_FILA_MS - 100}ms ease, top ${INTERVALO_FILA_MS - 100}ms ease`,
          }}
        />
      ))}

      {/* Bola */}
      <div
        style={{
          position: 'absolute',
          left: `${posicaoBola.x}%`,
          top: `${posicaoBola.y}%`,
          width: '16px',
          height: '16px',
          marginLeft: '-8px',
          marginTop: '-8px',
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '1.5px solid #1C1C1C',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          transition: `left ${INTERVALO_FILA_MS - 100}ms ease, top ${INTERVALO_FILA_MS - 100}ms ease`,
          zIndex: 2,
        }}
      />

      {/* Ícone grande centralizado (gol, pênalti, cartão, lesão) */}
      {iconeAtivo && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 3,
        }}>
          <img
            src={iconeAtivo}
            alt=""
            style={{ width: '64px', height: '64px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
          />
        </div>
      )}
    </div>
  )
}