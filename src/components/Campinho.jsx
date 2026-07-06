import { useState, useEffect, useRef } from 'react'
import iconGol from '../assets/icons/gol.png'
import iconPenalti from '../assets/icons/penalti.png'
import iconLesao from '../assets/icons/lesao.png'
import iconAmarelo from '../assets/icons/amarelo.png'
import iconVermelho from '../assets/icons/vermelho.png'

// ★ 05/07/2026 — Campinho visual (passo 2 da reforma de narração).
//
// Lê os eventos da partida (mesmo array que já alimenta o feed de texto
// em Partida.jsx) e anima uma bolinha com rastro indo de posição em
// posição real no campo, seguindo pos_x/pos_y gravados pelo motor.
//
// PONTO CRÍTICO: pos_x/pos_y são relativos a quem está com a bola nesse
// evento (y baixo = perto do gol ADVERSÁRIO daquele lado específico) —
// não são coordenada absoluta do campinho. Convertemos aqui pra
// coordenada absoluta fixa: home ataca pra cima (y_abs=0 é o gol do
// away, no topo), away ataca pra baixo (y_abs=100 é o gol do home, embaixo).
// Por isso o Y do away é sempre espelhado (100 - pos_y) e o do home vai
// direto — sem essa conversão a bola pularia de lado toda vez que a
// posse trocasse de time.
function paraCoordenadaAbsoluta(evento) {
  if (evento.pos_x == null || evento.pos_y == null) return null
  const x = evento.pos_x
  const y = evento.lado === 'home' ? evento.pos_y : 100 - evento.pos_y
  return { x, y }
}

// Tipos de evento que merecem um ícone grande centralizado por cima do
// campinho (reaproveita os ícones de produto que já existem — nunca
// emoji, nunca SVG novo).
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

export default function Campinho({ eventos, meuLado = 'home' }) {
  const [posicaoBola, setPosicaoBola] = useState({ x: 50, y: 50 })
  const [rastro, setRastro] = useState([])
  const [corContorno, setCorContorno] = useState('#E5E7EB')
  const [iconeAtivo, setIconeAtivo] = useState(null)
  const quantidadeProcessada = useRef(0)
  const timeoutIconeRef = useRef(null)

  useEffect(() => {
    if (!eventos || eventos.length === 0) return
    // Só processa os eventos novos desde a última renderização — evita
    // reprocessar tudo de novo a cada novo evento que chega.
    const novos = eventos.slice(quantidadeProcessada.current)
    if (novos.length === 0) return
    quantidadeProcessada.current = eventos.length

    for (const evento of novos) {
      const coordenada = paraCoordenadaAbsoluta(evento)
      if (!coordenada) continue

      setPosicaoBola(coordenada)
      setRastro((atual) => [...atual, coordenada].slice(-TAMANHO_RASTRO))
      setCorContorno(evento.lado === meuLado ? '#F97316' : '#4B5563')

      const icone = ICONE_POR_TIPO[evento.tipo]
      if (icone) {
        setIconeAtivo(icone)
        if (timeoutIconeRef.current) clearTimeout(timeoutIconeRef.current)
        timeoutIconeRef.current = setTimeout(() => setIconeAtivo(null), DURACAO_ICONE_MS)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventos, meuLado])

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
      {/* Grande área — gol do away (topo) */}
      <div style={{
        position: 'absolute', left: '25%', right: '25%', top: 0, height: '14%',
        border: '2px solid rgba(255,255,255,0.5)', borderTop: 'none',
      }} />
      {/* Grande área — gol do home (embaixo) */}
      <div style={{
        position: 'absolute', left: '25%', right: '25%', bottom: 0, height: '14%',
        border: '2px solid rgba(255,255,255,0.5)', borderBottom: 'none',
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
            transition: 'left 0.6s ease, top 0.6s ease',
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
          transition: 'left 0.6s ease, top 0.6s ease',
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