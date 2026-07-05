// src/pages/Onboarding1.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import mascote from '../assets/busto_joia.png'
import iconSemAnuncio from '../assets/sem anuncio.png'

const STORAGE_KEY = 'seumister_onboarding'
const MAX_CARACTERES = 30

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

function Onboarding1() {
  const navigate = useNavigate()
  const dadosSalvos = lerDadosSalvos()
  const [nomeTime, setNomeTime] = useState(dadosSalvos.nomeTime || '')

  const handleProximo = () => {
    if (!nomeTime.trim()) return alert('Coloca um nome pro seu time!')
    salvarDados({ nomeTime: nomeTime.trim() })
    navigate('/onboarding/2')
  }

  const handlePular = () => {
    salvarDados({ nomeTime: '' })
    navigate('/onboarding/2')
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

      {/* CONTEÚDO PRINCIPAL — distribuído com space-between para preencher a tela */}
      <div style={{
        flex: 1, padding: '24px 24px 0', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', overflowY: 'auto',
      }}>

        {/* BLOCO SUPERIOR */}
        <div>
          {/* BARRA DE PROGRESSO */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1, height: '5px', borderRadius: '4px', background: '#F97316' }} />
            <div style={{ flex: 1, height: '5px', borderRadius: '4px', background: '#E5E7EB' }} />
            <div style={{ flex: 1, height: '5px', borderRadius: '4px', background: '#E5E7EB' }} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', textAlign: 'center', marginBottom: '28px' }}>
            Passo 1 de 3
          </div>

          {/* MASCOTE GRANDE + BALÃO */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <img src={mascote} alt="Seu Mister" style={{ width: '150px', height: '150px', objectFit: 'contain', marginBottom: '14px' }} />
            <div style={{
              border: '2.5px solid #1C1C1C', borderRadius: '16px',
              padding: '12px 18px', fontSize: '15px', fontWeight: '700',
              color: '#1C1C1C', lineHeight: '20px', textAlign: 'center',
            }}>
              Primeiro, como vai<br />se chamar seu time?
            </div>
          </div>

          {/* TÍTULO */}
          <h1 style={{ fontSize: '27px', fontWeight: '900', color: '#1C1C1C', margin: '0 0 10px', lineHeight: '32px', textAlign: 'center' }}>
            Dá um nome pro seu time.
          </h1>
          <p style={{ fontSize: '14px', fontWeight: '400', color: '#6B7280', margin: '0 0 24px', textAlign: 'center', lineHeight: '20px' }}>
            Pode ser criativo.<br />Só não pode ser nome de time que já existe.
          </p>

          {/* CAMPO NOME DO TIME — sem ícone lateral, é só o input mesmo */}
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1.5px solid #E5E7EB', borderRadius: '12px',
            padding: '15px 16px', marginBottom: '6px', background: '#fff',
          }}>
            <input
              type="text"
              placeholder="Ex: Raposa FC"
              value={nomeTime}
              onChange={(e) => setNomeTime(e.target.value.slice(0, MAX_CARACTERES))}
              maxLength={MAX_CARACTERES}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: '16px', fontWeight: '500', color: '#1C1C1C',
                fontFamily: "'Inter', sans-serif", width: '100%',
              }}
            />
          </div>

          {/* CONTADOR DE CARACTERES */}
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#9CA3AF' }}>
              {nomeTime.length}/{MAX_CARACTERES}
            </span>
          </div>
        </div>

        {/* BLOCO INFERIOR */}
        <div style={{ paddingBottom: '20px' }}>
          {/* BOTÃO PRÓXIMO */}
          <button
            onClick={handleProximo}
            style={{
              width: '100%', background: '#F97316', color: '#fff',
              border: 'none', borderRadius: '12px', padding: '16px',
              fontSize: '15px', fontWeight: '700', letterSpacing: '0.5px',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            PRÓXIMO →
          </button>

          {/* LINK PULAR */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={handlePular}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: '600', color: '#6B7280',
                fontFamily: "'Inter', sans-serif", padding: 0,
                textDecoration: 'underline',
              }}
            >
              Pular por agora
            </button>
          </div>
        </div>

      </div>

      {/* RODAPÉ */}
      <div style={{
        padding: '14px 24px', borderTop: '1px solid #F0F0F0',
        background: '#FAFAFA', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '6px', flexShrink: 0,
      }}>
        <img src={iconSemAnuncio} alt="Sem propaganda" style={{ width: '16px', height: '16px' }} />
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#6B7280' }}>Sem propaganda. Nunca.</span>
      </div>

    </div>
  )
}

export default Onboarding1