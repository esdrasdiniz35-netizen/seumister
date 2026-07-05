// src/pages/Login.jsx
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { apiFetch } from '../lib/api'

import logo from '../assets/logo.png'
import mascoteBusto from '../assets/busto_apito.png'
import iconEmail from '../assets/icons/icon-email.png'
import iconLock from '../assets/icons/icon-lock.png'
import iconEye from '../assets/icons/icon-eye.png'
import iconEyeOff from '../assets/icons/icon-eye-off.png'
import iconGoogle from '../assets/icons/icon-google.png'
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

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [carregandoGoogle, setCarregandoGoogle] = useState(false)
  const [erro, setErro] = useState('')

  async function handleEntrar() {
    if (carregando || carregandoGoogle) return

    if (!email || !senha) {
      setErro('Preenche e-mail e senha pra entrar.')
      return
    }

    setErro('')
    setCarregando(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErro('E-mail ou senha incorretos.')
        } else if (error.message.includes('Email not confirmed')) {
          setErro('Confirma seu e-mail antes de entrar. Verifica sua caixa de entrada.')
        } else {
          setErro('Não foi possível entrar. Tenta de novo.')
        }
        setCarregando(false)
        return
      }

      if (!data?.session) {
        setErro('Não foi possível entrar. Tenta de novo.')
        setCarregando(false)
        return
      }

      try {
        const tecnico = await apiFetch('/api/tecnicos/me')
        sessionStorage.setItem('tecnico', JSON.stringify(tecnico))
        navigate('/painel')
      } catch (errApi) {
        // Login no Supabase deu certo, mas o cadastro de técnico nunca
        // foi concluído (ex: confirmou o e-mail mas saiu antes de
        // terminar o Onboarding). Manda direto pro início do Onboarding
        // em vez de mostrar erro — decisão de 24/06/2026.
        if (errApi.status === 404) {
          navigate('/onboarding/1')
          return
        }
        throw errApi
      }
    } catch (err) {
      setErro('Não foi possível entrar. Verifica sua internet e tenta de novo.')
      setCarregando(false)
    }
  }

  async function handleEntrarComGoogle() {
    if (carregando || carregandoGoogle) return
    setErro('')
    setCarregandoGoogle(true)

    // OAuth de verdade via Supabase — precisa do provedor Google
    // habilitado no Supabase Dashboard (Authentication > Providers)
    // com Client ID/Secret do Google Cloud Console. Se não estiver
    // configurado, isso retorna um erro real aqui embaixo, em vez de
    // fingir que logou.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/painel` },
    })

    if (error) {
      setErro('Não foi possível entrar com Google. Tenta de novo ou usa e-mail e senha.')
      setCarregandoGoogle(false)
    }
    // Se não deu erro, o navegador é redirecionado pro Google — a
    // página sai daqui, não precisa navigate() nem desligar o loading.
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
            De volta, hein. Sabia que você voltaria.
          </div>
        </div>

        {/* TÍTULO */}
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1C1C1C', margin: '0 0 4px', lineHeight: '31px' }}>
          Bem-vindo de volta.
        </h1>
        <p style={{ fontSize: '13px', fontWeight: '400', color: '#6B7280', margin: '0 0 26px' }}>
          Entre e volte a mandar no futebol.
        </p>

        {/* CAMPO EMAIL */}
        <CampoComIcone icone={iconEmail} alt="email">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={carregando || carregandoGoogle}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '15px', fontWeight: '500', color: '#1C1C1C',
              fontFamily: "'Inter', sans-serif", width: '100%',
            }}
          />
        </CampoComIcone>

        {/* CAMPO SENHA */}
        <CampoComIcone icone={iconLock} alt="senha">
          <input
            type={mostrarSenha ? 'text' : 'password'}
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            disabled={carregando || carregandoGoogle}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '15px', fontWeight: '500', color: '#1C1C1C',
              fontFamily: "'Inter', sans-serif", width: '100%',
            }}
          />
          <button
            onClick={() => setMostrarSenha(!mostrarSenha)}
            type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}
          >
            <img src={mostrarSenha ? iconEyeOff : iconEye} alt="mostrar senha" style={{ width: '18px', height: '18px', opacity: 0.5 }} />
          </button>
        </CampoComIcone>

        {/* ESQUECEU A SENHA */}
        <div style={{ textAlign: 'right', marginBottom: '8px' }}>
          <button
            onClick={() => navigate('/recuperar-senha')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontSize: '12.5px', fontWeight: '600', color: '#6B7280',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Esqueceu a senha?
          </button>
        </div>

        {/* MENSAGEM DE ERRO */}
        {erro && (
          <p style={{
            fontSize: '13px', fontWeight: '600', color: '#EF4444',
            textAlign: 'center', margin: '4px 0 12px',
          }}>
            {erro}
          </p>
        )}

        {/* BOTÃO ENTRAR */}
        <button
          onClick={handleEntrar}
          disabled={carregando || carregandoGoogle}
          style={{
            width: '100%', background: '#F97316', color: '#fff',
            border: 'none', borderRadius: '12px', padding: '15px',
            fontSize: '15px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: (carregando || carregandoGoogle) ? 'default' : 'pointer',
            opacity: carregando ? 0.7 : 1,
            fontFamily: "'Inter', sans-serif",
            marginTop: '6px',
          }}
        >
          {carregando ? 'ENTRANDO...' : 'ENTRAR'}
        </button>

        {/* DIVISOR "OU" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#9CA3AF' }}>ou</span>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        </div>

        {/* BOTÃO GOOGLE — OAuth real via Supabase */}
        <button
          onClick={handleEntrarComGoogle}
          disabled={carregando || carregandoGoogle}
          style={{
            width: '100%', background: '#fff', color: '#1C1C1C',
            border: '1.5px solid #1C1C1C', borderRadius: '12px', padding: '14px',
            fontSize: '14px', fontWeight: '700',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            cursor: (carregando || carregandoGoogle) ? 'default' : 'pointer',
            opacity: carregandoGoogle ? 0.7 : 1,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <img src={iconGoogle} alt="Google" style={{ width: '20px', height: '20px' }} />
          {carregandoGoogle ? 'Conectando...' : 'Entrar com Google'}
        </button>

        {/* LINK CRIAR CONTA */}
        <div style={{ textAlign: 'center', margin: '24px 0 12px' }}>
          <span style={{ fontSize: '13.5px', fontWeight: '400', color: '#6B7280' }}>Não tem conta? </span>
          <button
            onClick={() => navigate('/cadastro')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13.5px', fontWeight: '700', color: '#F97316',
              fontFamily: "'Inter', sans-serif", padding: 0,
            }}
          >
            Criar conta grátis →
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