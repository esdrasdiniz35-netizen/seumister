// src/pages/Onboarding3.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import mascote from '../assets/busto_joia.png'
import iconSemAnuncio from '../assets/sem anuncio.png'
import iconUser from '../assets/icons/icon-user.png'
import iconNivelIniciante from '../assets/icons/iniciante.png'
import { apiFetch } from '../lib/api'

const STORAGE_KEY = 'seumister_onboarding'
const MAX_CARACTERES = 20

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

function limparDados() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignora
  }
}

const FORMATOS_ESCUDO = {
  classico: 'M50 5 L90 20 L90 60 C90 85 50 105 50 105 C50 105 10 85 10 60 L10 20 Z',
  redondo: 'M50 5 C75 5 95 25 95 55 C95 85 50 105 50 105 C50 105 5 85 5 55 C5 25 25 5 50 5 Z',
  moderno: 'M50 3 L88 25 L95 65 L70 102 L30 102 L5 65 L12 25 Z',
  quadrado: 'M15 5 L85 5 C90 5 90 10 90 10 L90 80 C90 95 50 105 50 105 C50 105 10 95 10 80 L10 10 C10 10 10 5 15 5 Z',
}

function EscudoSVG({ formato = 'classico', corPrincipal, corSecundaria }) {
  const cp = corPrincipal || '#F3F4F6'
  const cs = corSecundaria || corPrincipal || '#F3F4F6'
  const path = FORMATOS_ESCUDO[formato] || FORMATOS_ESCUDO.classico
  const clipId = `escudo-clip-ob3-${formato}`

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

// Data mínima/máxima só pra travar o seletor nativo numa faixa humana
// plausível (o backend valida de novo, isso aqui é só UX). Sem idade
// mínima — o jogo é aberto pra criançada também. Mantido em sincronia
// manual com IDADE_MAXIMA em tecnicos.js.
const HOJE = new Date()
const DATA_MAX = HOJE.toISOString().slice(0, 10)
const DATA_MIN = new Date(HOJE.getFullYear() - 100, HOJE.getMonth(), HOJE.getDate())
  .toISOString().slice(0, 10)

function Onboarding3() {
  const navigate = useNavigate()
  const dadosSalvos = lerDadosSalvos()

  const [nomeTecnico, setNomeTecnico] = useState(dadosSalvos.nomeTecnico || '')
  const [nomeTime, setNomeTime] = useState(dadosSalvos.nomeTime || '')
  const [dataNascimento, setDataNascimento] = useState(dadosSalvos.dataNascimento || '')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sugestoes, setSugestoes] = useState([])

  async function handleComecar() {
    if (carregando) return

    if (!nomeTecnico.trim()) {
      setErro('Coloca seu nome de técnico!')
      return
    }

    setErro('')
    setSugestoes([])
    setCarregando(true)
    salvarDados({ nomeTecnico: nomeTecnico.trim(), dataNascimento })

    try {
      await apiFetch('/api/tecnicos', {
        method: 'POST',
        body: {
          nome: nomeTecnico.trim(),
          nomeTime: nomeTime.trim(),
          corPrimaria: dadosSalvos.corPrimaria,
          corSecundaria: dadosSalvos.corSecundaria,
          formatoEscudo: dadosSalvos.formatoEscudo,
          dataNascimento: dataNascimento || undefined,
        },
      })

      limparDados()
      navigate('/draft')
    } catch (err) {
      if (err.status === 409 && err.corpo?.sugestoes) {
        setErro(err.corpo.erro)
        setSugestoes(err.corpo.sugestoes)
      } else {
        setErro(err.message || 'Não foi possível concluir o cadastro. Tenta de novo.')
      }
      setCarregando(false)
    }
  }

  function handleEscolherSugestao(sugestao) {
    setNomeTime(sugestao)
    salvarDados({ nomeTime: sugestao })
    setErro('')
    setSugestoes([])
  }

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#FFFFFF', height: '100vh',
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

      {/* CONTEÚDO PRINCIPAL — scroll como rede de segurança */}
      <div style={{
        flex: 1, padding: '14px 24px', display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>

        {/* BARRA DE PROGRESSO */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexShrink: 0 }}>
          <div style={{ flex: 1, height: '5px', borderRadius: '4px', background: '#E5E7EB' }} />
          <div style={{ flex: 1, height: '5px', borderRadius: '4px', background: '#E5E7EB' }} />
          <div style={{ flex: 1, height: '5px', borderRadius: '4px', background: '#F97316' }} />
        </div>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textAlign: 'center', marginBottom: '12px', flexShrink: 0 }}>
          Passo 3 de 3
        </div>

        {/* MASCOTE + BALÃO */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
          <img src={mascote} alt="Seu Mister" style={{ width: '76px', height: '76px', objectFit: 'contain', marginBottom: '8px' }} />
          <div style={{
            border: '2px solid #1C1C1C', borderRadius: '14px',
            padding: '9px 14px', fontSize: '13px', fontWeight: '700',
            color: '#1C1C1C', lineHeight: '17px', textAlign: 'center',
          }}>
            E você? Como quer<br />ser chamado no campo?
          </div>
        </div>

        {/* TÍTULO */}
        <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#1C1C1C', margin: '0 0 4px', lineHeight: '24px', textAlign: 'center', flexShrink: 0 }}>
          Qual é o seu nome de técnico?
        </h1>
        <p style={{ fontSize: '13px', fontWeight: '400', color: '#6B7280', margin: '0 0 14px', textAlign: 'center', lineHeight: '17px', flexShrink: 0 }}>
          É como você vai aparecer<br />para os outros jogadores.
        </p>

        {/* CAMPO NOME DO TÉCNICO */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          border: '1.5px solid #E5E7EB', borderRadius: '12px',
          padding: '13px 14px', marginBottom: '6px', background: '#fff', flexShrink: 0,
        }}>
          <img src={iconUser} alt="técnico" style={{ width: '20px', height: '20px', opacity: 0.5, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Ex: Mister Diniz"
            value={nomeTecnico}
            onChange={(e) => setNomeTecnico(e.target.value.slice(0, MAX_CARACTERES))}
            maxLength={MAX_CARACTERES}
            disabled={carregando}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '15px', fontWeight: '500', color: '#1C1C1C',
              fontFamily: "'Inter', sans-serif", width: '100%',
            }}
          />
        </div>

        {/* CONTADOR DE CARACTERES */}
        <div style={{ textAlign: 'right', marginBottom: '14px', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
            {nomeTecnico.length}/{MAX_CARACTERES}
          </span>
        </div>

        {/* CAMPO DATA DE NASCIMENTO — opcional */}
        <div style={{ marginBottom: '4px', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
            Data de nascimento <span style={{ fontWeight: '400', color: '#9CA3AF' }}>(opcional)</span>
          </span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center',
          border: '1.5px solid #E5E7EB', borderRadius: '12px',
          padding: '13px 14px', marginBottom: '6px', background: '#fff', flexShrink: 0,
        }}>
          <input
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            min={DATA_MIN}
            max={DATA_MAX}
            disabled={carregando}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '15px', fontWeight: '500', color: '#1C1C1C',
              fontFamily: "'Inter', sans-serif", width: '100%',
            }}
          />
        </div>
        <div style={{ marginBottom: '12px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: '400', color: '#9CA3AF' }}>
            Usamos só pra estatísticas do jogo. Pode pular se preferir.
          </span>
        </div>

        {/* CARD DE PRÉVIA */}
        <div style={{
          background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '14px',
          padding: '14px', marginBottom: '14px', flexShrink: 0,
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.5px', marginBottom: '10px', textAlign: 'center' }}>
            COMO VAI APARECER PARA OUTROS JOGADORES
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ width: '42px', height: '46px', flexShrink: 0 }}>
              <EscudoSVG
                formato={dadosSalvos.formatoEscudo}
                corPrincipal={dadosSalvos.corPrimaria}
                corSecundaria={dadosSalvos.corSecundaria}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#6B7280' }}>Técnico:</div>
              <div style={{ fontSize: '15px', fontWeight: '900', color: '#1C1C1C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {nomeTecnico || '—'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: '#6B7280' }}>Nível:</span>
            <img src={iconNivelIniciante} alt="iniciante" style={{ width: '17px', height: '17px' }} />
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#10B981' }}>Iniciante</span>
          </div>
        </div>

        {/* MENSAGEM DE ERRO + SUGESTÕES */}
        {erro && (
          <div style={{
            background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '10px',
            padding: '10px 12px', marginBottom: '12px', flexShrink: 0,
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#EF4444', marginBottom: sugestoes.length ? '8px' : 0 }}>
              {erro}
            </div>
            {sugestoes.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {sugestoes.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleEscolherSugestao(s)}
                    style={{
                      background: '#fff', border: '1.5px solid #F97316', color: '#F97316',
                      borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: '700',
                      cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOME DO TIME ESCOLHIDO */}
        {nomeTime && !erro && (
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textAlign: 'center', marginBottom: '12px', flexShrink: 0 }}>
            Time: <span style={{ color: '#1C1C1C', fontWeight: '700' }}>{nomeTime}</span>
          </div>
        )}

        {/* Espaçador flexível — só age quando há espaço de sobra */}
        <div style={{ flex: 1, minHeight: '8px' }} />

        {/* BOTÃO COMEÇAR A JOGAR */}
        <button
          onClick={handleComecar}
          disabled={carregando}
          style={{
            width: '100%', background: '#F97316', color: '#fff',
            border: 'none', borderRadius: '12px', padding: '14px',
            fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: carregando ? 'default' : 'pointer',
            opacity: carregando ? 0.7 : 1,
            fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            flexShrink: 0,
          }}
        >
          {carregando ? 'CRIANDO SEU TIME...' : 'COMEÇAR A JOGAR →'}
        </button>

        {/* LINK VOLTAR */}
        <div style={{ textAlign: 'center', marginTop: '12px', marginBottom: '4px', flexShrink: 0 }}>
          <button
            onClick={() => { salvarDados({ nomeTecnico: nomeTecnico.trim(), dataNascimento }); navigate('/onboarding/2') }}
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

    </div>
  )
}

export default Onboarding3