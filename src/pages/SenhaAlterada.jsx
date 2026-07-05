// src/pages/SenhaAlterada.jsx
import { useNavigate } from 'react-router-dom'

import logo from '../assets/logo.png'
import mascoteComemorando from '../assets/comemorando.png'
import iconSemAnuncio from '../assets/sem anuncio.png'

export default function SenhaAlterada() {
  const navigate = useNavigate()

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

      {/* MIOLO — flex:1, rola se precisar, conteúdo alinhado no topo */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '32px 24px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', boxSizing: 'border-box',
      }}>

        <img
          src={mascoteComemorando}
          alt="Seu Mister"
          style={{ width: '170px', height: '170px', objectFit: 'contain', marginBottom: '16px' }}
        />

        <div style={{
          border: '2px solid #1C1C1C', borderRadius: '14px',
          padding: '11px 18px', fontSize: '14.5px', fontWeight: '700',
          color: '#1C1C1C', marginBottom: '24px', maxWidth: '320px',
        }}>
          Boa! Nova senha, novo jogo.
        </div>

        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: '#10B981', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: '22px',
        }}>
          <span style={{ fontSize: '30px', color: '#fff', fontWeight: '900', lineHeight: 1 }}>✓</span>
        </div>

        <div style={{ fontSize: '23px', fontWeight: '900', color: '#1C1C1C', marginBottom: '12px' }}>
          Senha alterada!
        </div>

        <div style={{ fontSize: '15px', fontWeight: '400', color: '#6B7280', lineHeight: '23px', marginBottom: '28px', maxWidth: '340px' }}>
          Sua senha foi trocada com sucesso. Já pode entrar com a senha nova.
        </div>

        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%', maxWidth: '340px',
            background: '#F97316', color: '#fff',
            border: 'none', borderRadius: '12px', padding: '15px',
            fontSize: '15px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >
          IR PARA O LOGIN
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