// src/pages/EmailEnviado.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

import logo from '../assets/logo.png'
import mascoteApontando from '../assets/apontando.png'
import iconEmail from '../assets/icons/icon-email.png'
import iconSemAnuncio from '../assets/sem anuncio.png'

export default function EmailEnviado() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email ?? ''

  const [reenviando, setReenviando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function handleReenviar() {
    if (reenviando) return

    // Sem e-mail em mãos (ex: alguém deu refresh na página e perdeu o
    // location.state), não tem como reenviar — manda de volta pro
    // formulário em vez de fingir que reenviou.
    if (!email) {
      navigate('/recuperar-senha')
      return
    }

    setMensagem('')
    setReenviando(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/nova-senha`,
      })

      if (error) {
        setMensagem('Não foi possível reenviar agora. Tenta de novo em instantes.')
      } else {
        setMensagem('Link reenviado! Confere sua caixa de entrada.')
      }
    } catch (err) {
      setMensagem('Não foi possível reenviar. Verifica sua internet.')
    } finally {
      setReenviando(false)
    }
  }

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#FFFFFF',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
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

      {/* MIOLO — flex:1, rola se precisar, conteúdo centralizado */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '32px 24px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', boxSizing: 'border-box',
      }}>

        <img
          src={mascoteApontando}
          alt="Seu Mister"
          style={{ width: '170px', height: '170px', objectFit: 'contain', marginBottom: '16px' }}
        />

        <div style={{
          border: '2px solid #1C1C1C', borderRadius: '14px',
          padding: '11px 18px', fontSize: '14.5px', fontWeight: '700',
          color: '#1C1C1C', marginBottom: '24px', maxWidth: '320px',
        }}>
          Verifique seu e-mail, treinador!
        </div>

        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: '#F97316', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: '22px',
        }}>
          <img src={iconEmail} alt="" style={{ width: '30px', height: '30px', filter: 'brightness(0) invert(1)' }} />
        </div>

        <div style={{ fontSize: '23px', fontWeight: '900', color: '#1C1C1C', marginBottom: '12px' }}>
          Link enviado!
        </div>

        <div style={{ fontSize: '15px', fontWeight: '400', color: '#6B7280', lineHeight: '23px', marginBottom: '6px', maxWidth: '360px' }}>
          Mandamos um link de recuperação para
        </div>

        {email && (
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#F97316', marginBottom: '22px' }}>
            {email}
          </div>
        )}

        <div style={{ fontSize: '14px', fontWeight: '400', color: '#6B7280', lineHeight: '21px', marginBottom: '16px', maxWidth: '360px' }}>
          Clique no link pra criar uma senha nova. Não esquece de checar a caixa de spam.
        </div>

        {mensagem && (
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#F97316', marginBottom: '18px' }}>
            {mensagem}
          </div>
        )}

        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%', maxWidth: '340px',
            background: '#F97316', color: '#fff',
            border: 'none', borderRadius: '12px', padding: '15px',
            fontSize: '15px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            marginBottom: '16px',
          }}
        >
          VOLTAR PARA O LOGIN
        </button>

        <button
          onClick={handleReenviar}
          disabled={reenviando}
          style={{
            background: 'transparent', border: 'none',
            color: '#6B7280', fontSize: '14px', fontWeight: '600',
            cursor: reenviando ? 'default' : 'pointer',
            fontFamily: "'Inter', sans-serif",
            opacity: reenviando ? 0.6 : 1,
          }}
        >
          {reenviando ? 'Reenviando...' : 'Não recebeu? Reenviar link'}
        </button>

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