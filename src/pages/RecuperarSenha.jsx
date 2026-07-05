// src/pages/RecuperarSenha.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

import logo from '../assets/logo.png'
import mascoteBusto from '../assets/busto_apito.png'
import iconEmail from '../assets/icons/icon-email.png'
import iconSemAnuncio from '../assets/sem anuncio.png'

function CampoComIcone({ icone, alt, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      border: '1.5px solid #E5E7EB', borderRadius: '12px',
      padding: '13px 14px', marginBottom: '12px', background: '#fff',
    }}>
      <img src={icone} alt={alt} style={{ width: '20px', height: '20px', opacity: 0.5, flexShrink: 0 }} />
      {children}
    </div>
  )
}

export default function RecuperarSenha() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleEnviar() {
    if (carregando) return

    if (!email.trim()) {
      setErro('Coloca seu e-mail pra gente mandar o link.')
      return
    }

    setErro('')
    setCarregando(true)

    try {
      // Envio real pelo Supabase Auth — antes disso a tela só validava
      // se o campo não estava vazio e navegava direto pra "email
      // enviado" sem mandar e-mail nenhum. Agora manda de verdade.
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/nova-senha`,
      })

      if (error) {
        setErro('Não foi possível enviar o link. Tenta de novo.')
        setCarregando(false)
        return
      }

      navigate('/email-enviado', { state: { email: email.trim() } })
    } catch (err) {
      setErro('Não foi possível enviar o link. Verifica sua internet e tenta de novo.')
      setCarregando(false)
    }
  }

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#FFFFFF', height: '100vh',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* HEADER — fixo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '18px 20px 14px', borderBottom: '1px solid #F0F0F0',
        flexShrink: 0,
      }}>
        <img src={logo} alt="Seu Mister" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
        <span style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C', letterSpacing: '0.2px' }}>
          SEU <span style={{ color: '#F97316' }}>MISTER</span>
        </span>
      </div>

      {/* MIOLO — flex:1, rola se precisar, rodapé sempre coladinho */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '28px 20px 8px',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* MASCOTE + BALÃO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <img src={mascoteBusto} alt="Seu Mister" style={{ width: '104px', height: '104px', objectFit: 'contain', flexShrink: 0 }} />
          <div style={{
            border: '2px solid #1C1C1C', borderRadius: '14px',
            padding: '10px 14px', fontSize: '13px', fontWeight: '600',
            color: '#1C1C1C', lineHeight: '17px', flex: 1,
          }}>
            Esqueceu? Acontece com os melhores.
          </div>
        </div>

        {/* TÍTULO */}
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1C1C1C', margin: '0 0 4px', lineHeight: '31px' }}>
          Recuperar senha.
        </h1>
        <p style={{ fontSize: '13px', fontWeight: '400', color: '#6B7280', margin: '0 0 26px' }}>
          Digite seu email e te mandamos o link.
        </p>

        {/* CAMPO EMAIL */}
        <CampoComIcone icone={iconEmail} alt="email">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={carregando}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '15px', fontWeight: '500', color: '#1C1C1C',
              fontFamily: "'Inter', sans-serif", width: '100%',
            }}
          />
        </CampoComIcone>

        {/* MENSAGEM DE ERRO */}
        {erro && (
          <p style={{
            fontSize: '13px', fontWeight: '600', color: '#EF4444',
            textAlign: 'center', margin: '4px 0 12px',
          }}>
            {erro}
          </p>
        )}

        {/* BOTÃO ENVIAR LINK */}
        <button
          onClick={handleEnviar}
          disabled={carregando}
          style={{
            width: '100%', background: '#F97316', color: '#fff',
            border: 'none', borderRadius: '12px', padding: '15px',
            fontSize: '15px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: carregando ? 'default' : 'pointer',
            opacity: carregando ? 0.7 : 1,
            fontFamily: "'Inter', sans-serif",
            marginTop: '6px',
          }}
        >
          {carregando ? 'ENVIANDO...' : 'ENVIAR LINK'}
        </button>

        {/* LINK VOLTAR PARA O LOGIN */}
        <div style={{ textAlign: 'center', margin: '20px 0 12px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: '13.5px', fontWeight: '600', color: '#6B7280',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            ← Voltar para o login
          </button>
        </div>

      </div>

      {/* RODAPÉ — fixo */}
      <div style={{
        padding: '12px 20px', borderTop: '1px solid #F0F0F0',
        background: '#FAFAFA', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '6px', flexShrink: 0,
      }}>
        <img src={iconSemAnuncio} alt="" style={{ width: '16px', height: '16px' }} />
        <span style={{ fontSize: '12.5px', fontWeight: '500', color: '#6B7280' }}>Sem propaganda. Nunca.</span>
      </div>

    </div>
  )
}