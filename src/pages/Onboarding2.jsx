// src/pages/Onboarding2.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import mascote from '../assets/busto_joia.png'
import iconSemAnuncio from '../assets/sem anuncio.png'

const STORAGE_KEY = 'seumister_onboarding'

function lerDadosSalvos() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function salvarDados(dados) {
  try {
    const atuais = lerDadosSalvos()
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...atuais, ...dados }))
  } catch {
    // ignora
  }
}

const CORES = [
  { id: 'vermelho',    hex: '#EF4444' },
  { id: 'laranja',     hex: '#F97316' },
  { id: 'amarelo',     hex: '#EAB308' },
  { id: 'verdeEscuro', hex: '#16A34A' },
  { id: 'verdeClaro',  hex: '#22C55E' },
  { id: 'azul',        hex: '#3B82F6' },
  { id: 'azulClaro',   hex: '#38BDF8' },
  { id: 'roxo',        hex: '#A855F7' },
  { id: 'rosa',        hex: '#EC4899' },
  { id: 'preto',       hex: '#1C1C1C' },
  { id: 'branco',      hex: '#FFFFFF' },
  { id: 'cinza',       hex: '#6B7280' },
]

const FORMATOS_ESCUDO = {
  classico: {
    nome: 'Clássico',
    path: 'M50 5 L90 20 L90 60 C90 85 50 105 50 105 C50 105 10 85 10 60 L10 20 Z',
  },
  redondo: {
    nome: 'Redondo',
    path: 'M50 5 C75 5 95 25 95 55 C95 85 50 105 50 105 C50 105 5 85 5 55 C5 25 25 5 50 5 Z',
  },
  moderno: {
    nome: 'Moderno',
    path: 'M50 3 L88 25 L95 65 L70 102 L30 102 L5 65 L12 25 Z',
  },
  quadrado: {
    nome: 'Quadrado',
    path: 'M15 5 L85 5 C90 5 90 10 90 10 L90 80 C90 95 50 105 50 105 C50 105 10 95 10 80 L10 10 C10 10 10 5 15 5 Z',
  },
}

function EscudoSVG({ formato = 'classico', corPrincipal, corSecundaria }) {
  const cp = corPrincipal || '#FFFFFF'
  const cs = corSecundaria || corPrincipal || '#FFFFFF'
  const path = FORMATOS_ESCUDO[formato]?.path || FORMATOS_ESCUDO.classico.path
  const clipId = `escudo-clip-${formato}`

  return (
    <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <clipPath id={clipId}>
          <path d={path} />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="50" height="110" fill={cp} clipPath={`url(#${clipId})`} />
      <rect x="50" y="0" width="50" height="110" fill={cs} clipPath={`url(#${clipId})`} />
      <path d={path} fill="none" stroke="#1C1C1C" strokeWidth="3" />
    </svg>
  )
}

function PopupFormatos({ formatoAtual, corPrincipal, corSecundaria, onEscolher, onFechar }) {
  return (
    <div
      onClick={onFechar}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '18px', padding: '20px',
          width: '100%', maxWidth: '380px',
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C', textAlign: 'center', marginBottom: '4px' }}>
          Escolha o formato
        </div>
        <div style={{ fontSize: '12px', fontWeight: '400', color: '#6B7280', textAlign: 'center', marginBottom: '16px' }}>
          Você pode trocar a cor depois
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {Object.entries(FORMATOS_ESCUDO).map(([id, formato]) => {
            const selecionado = formatoAtual === id
            return (
              <button
                key={id}
                onClick={() => onEscolher(id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '14px', borderRadius: '14px',
                  border: selecionado ? '2.5px solid #F97316' : '1.5px solid #E5E7EB',
                  background: selecionado ? '#FFF7ED' : '#fff',
                  cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                }}
              >
                <div style={{ width: '56px', height: '60px' }}>
                  <EscudoSVG formato={id} corPrincipal={corPrincipal} corSecundaria={corSecundaria} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1C' }}>{formato.nome}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Onboarding2() {
  const navigate = useNavigate()
  const dadosSalvos = lerDadosSalvos()

  const corSalvaPrincipal = CORES.find(c => c.hex === dadosSalvos.corPrimaria) || null
  const corSalvaSecundaria = CORES.find(c => c.hex === dadosSalvos.corSecundaria) || null

  const [corPrincipal, setCorPrincipal] = useState(corSalvaPrincipal)
  const [corSecundaria, setCorSecundaria] = useState(corSalvaSecundaria)
  const [formatoEscudo, setFormatoEscudo] = useState(dadosSalvos.formatoEscudo || 'classico')
  const [popupAberto, setPopupAberto] = useState(false)

  const nomeTime = dadosSalvos.nomeTime || 'SEU TIME'

  const handleCor = (cor) => {
    if (!corPrincipal) {
      setCorPrincipal(cor)
    } else if (!corSecundaria) {
      if (cor.id === corPrincipal.id) return
      setCorSecundaria(cor)
    } else {
      setCorPrincipal(cor)
      setCorSecundaria(null)
    }
  }

  const handleEscolherFormato = (id) => {
    setFormatoEscudo(id)
    setPopupAberto(false)
  }

  const handleProximo = () => {
    if (!corPrincipal) return alert('Escolhe pelo menos uma cor!')
    salvarDados({
      corPrimaria: corPrincipal.hex,
      corSecundaria: corSecundaria ? corSecundaria.hex : corPrincipal.hex,
      formatoEscudo,
    })
    navigate('/onboarding/3')
  }

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#FFFFFF', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* HEADER COM LOGO */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '18px 20px 14px', borderBottom: '1px solid #F0F0F0', flexShrink: 0,
      }}>
        <img src={logo} alt="Seu Mister" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
        <span style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C', letterSpacing: '0.2px' }}>
          SEU <span style={{ color: '#F97316' }}>MISTER</span>
        </span>
      </div>

      {/* CONTEÚDO PRINCIPAL — scroll apenas como rede de segurança, não esperado no caso normal */}
      <div style={{
        flex: 1, padding: '14px 24px', display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>

        {/* BARRA DE PROGRESSO */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexShrink: 0 }}>
          <div style={{ flex: 1, height: '5px', borderRadius: '4px', background: '#E5E7EB' }} />
          <div style={{ flex: 1, height: '5px', borderRadius: '4px', background: '#F97316' }} />
          <div style={{ flex: 1, height: '5px', borderRadius: '4px', background: '#E5E7EB' }} />
        </div>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textAlign: 'center', marginBottom: '12px', flexShrink: 0 }}>
          Passo 2 de 3
        </div>

        {/* MASCOTE + BALÃO */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
          <img src={mascote} alt="Seu Mister" style={{ width: '76px', height: '76px', objectFit: 'contain', marginBottom: '8px' }} />
          <div style={{
            border: '2px solid #1C1C1C', borderRadius: '14px',
            padding: '9px 14px', fontSize: '13px', fontWeight: '700',
            color: '#1C1C1C', lineHeight: '17px', textAlign: 'center',
          }}>
            Agora escolha as cores.<br />Isso diz muito sobre um técnico.
          </div>
        </div>

        {/* TÍTULO */}
        <h1 style={{ fontSize: '21px', fontWeight: '900', color: '#1C1C1C', margin: '0 0 4px', lineHeight: '25px', textAlign: 'center', flexShrink: 0 }}>
          As cores do seu time.
        </h1>
        <p style={{ fontSize: '13px', fontWeight: '400', color: '#6B7280', margin: '0 0 14px', textAlign: 'center', flexShrink: 0 }}>
          Escolha a cor principal e a cor secundária.
        </p>

        {/* GRID DE CORES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '14px', flexShrink: 0 }}>
          {CORES.map((cor) => {
            const isPrincipal = corPrincipal?.id === cor.id
            const isSecundaria = corSecundaria?.id === cor.id
            return (
              <button
                key={cor.id}
                onClick={() => handleCor(cor)}
                style={{
                  width: '100%', aspectRatio: '1', borderRadius: '50%',
                  background: cor.hex,
                  border: isPrincipal
                    ? '3px solid #F97316'
                    : isSecundaria
                    ? '3px solid #1C1C1C'
                    : cor.hex === '#FFFFFF' ? '1.5px solid #E5E7EB' : '3px solid #F3F4F6',
                  cursor: 'pointer', padding: 0,
                  boxSizing: 'border-box',
                }}
              />
            )
          })}
        </div>

        {/* PRÉVIA DO ESCUDO */}
        <button
          onClick={() => setPopupAberto(true)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
            background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '14px',
            padding: '12px 14px', marginBottom: '14px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", textAlign: 'left', flexShrink: 0,
          }}
        >
          <div style={{ width: '42px', height: '48px', flexShrink: 0 }}>
            <EscudoSVG formato={formatoEscudo} corPrincipal={corPrincipal?.hex} corSecundaria={corSecundaria?.hex} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.5px', marginBottom: '2px' }}>
              PRÉVIA · TOQUE PARA MUDAR FORMATO
            </div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: '#1C1C1C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nomeTime.toUpperCase()}
            </div>
          </div>
          <span style={{ fontSize: '18px', color: '#9CA3AF', flexShrink: 0 }}>›</span>
        </button>

        {/* Espaçador flexível — só age quando há espaço de sobra */}
        <div style={{ flex: 1, minHeight: '8px' }} />

        {/* BOTÃO PRÓXIMO */}
        <button
          onClick={handleProximo}
          style={{
            width: '100%', background: '#F97316', color: '#fff',
            border: 'none', borderRadius: '12px', padding: '14px',
            fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            flexShrink: 0,
          }}
        >
          PRÓXIMO →
        </button>

        {/* LINK VOLTAR */}
        <div style={{ textAlign: 'center', marginTop: '12px', marginBottom: '4px', flexShrink: 0 }}>
          <button
            onClick={() => navigate('/onboarding/1')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', color: '#6B7280',
              fontFamily: "'Inter', sans-serif", display: 'inline-flex',
              alignItems: 'center', gap: '6px', padding: 0,
            }}
          >
            ← Voltar
          </button>
        </div>

      </div>

      {/* RODAPÉ */}
      <div style={{
        padding: '12px 24px', borderTop: '1px solid #F0F0F0',
        background: '#FAFAFA', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '6px', flexShrink: 0,
      }}>
        <img src={iconSemAnuncio} alt="Sem propaganda" style={{ width: '15px', height: '15px' }} />
        <span style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280' }}>Sem propaganda. Nunca.</span>
      </div>

      {popupAberto && (
        <PopupFormatos
          formatoAtual={formatoEscudo}
          corPrincipal={corPrincipal?.hex}
          corSecundaria={corSecundaria?.hex}
          onEscolher={handleEscolherFormato}
          onFechar={() => setPopupAberto(false)}
        />
      )}

    </div>
  )
}

export default Onboarding2