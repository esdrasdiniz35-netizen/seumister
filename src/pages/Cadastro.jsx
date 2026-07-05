// src/pages/Cadastro.jsx
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

import logo from '../assets/logo.png'
import mascote from '../assets/busto_joia.png'
import iconUser from '../assets/icons/icon-user.png'
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

function Cadastro() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [carregandoGoogle, setCarregandoGoogle] = useState(false)
  const [erro, setErro] = useState('')

  async function handleCriarConta() {
    if (carregando) return

    if (!nome.trim()) {
      setErro('Coloca seu nome completo.')
      return
    }
    if (!email.trim()) {
      setErro('Coloca seu e-mail.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setErro('')
    setCarregando(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome },
          emailRedirectTo: window.location.origin + '/login',
        },
      })

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          setErro('Esse e-mail já está cadastrado. Tenta entrar em vez de criar conta nova.')
        } else if (error.message.includes('Password')) {
          setErro('Senha muito fraca. Tenta uma senha mais forte.')
        } else {
          setErro('Não foi possível criar a conta. Tenta de novo.')
        }
        setCarregando(false)
        return
      }

      if (!data?.user) {
        setErro('Não foi possível criar a conta. Tenta de novo.')
        setCarregando(false)
        return
      }

      navigate('/confirme-seu-email', { state: { email } })
    } catch (err) {
      setErro('Não foi possível criar a conta. Verifica sua internet e tenta de novo.')
      setCarregando(false)
    }
  }

  async function handleCriarContaComGoogle() {
    if (carregando || carregandoGoogle) return
    setErro('')
    setCarregandoGoogle(true)

    // OAuth de verdade via Supabase — precisa do provedor Google
    // habilitado no Supabase Dashboard (Authentication > Providers)
    // com Client ID/Secret do Google Cloud Console. Se não estiver
    // configurado, isso retorna um erro real aqui embaixo, em vez de
    // fingir que criou conta (era exatamente isso que o botão fazia
    // antes: navigate('/onboarding/1') direto, sem autenticar nada).
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/onboarding/1` },
    })

    if (error) {
      setErro('Não foi possível criar conta com Google. Tenta de novo ou usa e-mail e senha.')
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

      {/* HEADER COM LOGO — fixo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '20px 20px 16px', borderBottom: '1px solid #F0F0F0',
        flexShrink: 0,
      }}>
        <img src={logo} alt="Logo" style={{ width: '40px', height: '40px' }} />
        <span style={{ fontSize: '20px', fontWeight: '900', color: '#1C1C1C', fontStyle: 'italic', letterSpacing: '0.5px' }}>
          SEU MISTER
        </span>
      </div>

      {/* MIOLO — flex:1, rola se precisar, rodapé sempre coladinho */}
      <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>

        {/* MASCOTE + BALÃO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <img src={mascote} alt="Seu Mister" style={{ width: '120px', height: '120px', objectFit: 'contain', flexShrink: 0 }} />
          <div style={{
            border: '2.5px solid #1C1C1C', borderRadius: '16px',
            padding: '12px 16px', fontSize: '15px', fontWeight: '700',
            color: '#1C1C1C', lineHeight: '20px', position: 'relative',
          }}>
            Bem-vindo, futuro campeão.
          </div>
        </div>

        {/* TÍTULO */}
        <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#1C1C1C', margin: '0 0 6px', lineHeight: '36px' }}>
          Cria sua conta. É rápido.
        </h1>
        <p style={{ fontSize: '14px', fontWeight: '400', color: '#6B7280', margin: '0 0 20px' }}>
          Comece grátis. Sem propaganda.
        </p>

        {/* CAMPO NOME */}
        <CampoComIcone icone={iconUser} alt="nome">
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={e => setNome(e.target.value)}
            disabled={carregando || carregandoGoogle}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '15px', fontWeight: '500', color: '#1C1C1C',
              fontFamily: "'Inter', sans-serif", width: '100%',
            }}
          />
        </CampoComIcone>

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

        {/* CAMPO CONFIRMAR SENHA */}
        <CampoComIcone icone={iconLock} alt="confirmar senha">
          <input
            type={mostrarConfirmar ? 'text' : 'password'}
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChange={e => setConfirmarSenha(e.target.value)}
            disabled={carregando || carregandoGoogle}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '15px', fontWeight: '500', color: '#1C1C1C',
              fontFamily: "'Inter', sans-serif", width: '100%',
            }}
          />
          <button
            onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
            type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}
          >
            <img src={mostrarConfirmar ? iconEyeOff : iconEye} alt="mostrar confirmação" style={{ width: '18px', height: '18px', opacity: 0.5 }} />
          </button>
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

        {/* BOTÃO CRIAR CONTA */}
        <button
          onClick={handleCriarConta}
          disabled={carregando || carregandoGoogle}
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
          {carregando ? 'CRIANDO CONTA...' : 'CRIAR CONTA GRÁTIS'}
        </button>

        {/* DIVISOR "OU" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#9CA3AF' }}>ou</span>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        </div>

        {/* BOTÃO GOOGLE — OAuth real via Supabase */}
        <button
          onClick={handleCriarContaComGoogle}
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
          {carregandoGoogle ? 'Conectando...' : 'Criar conta com Google'}
        </button>

        {/* LINK JÁ TEM CONTA */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '14px', fontWeight: '400', color: '#6B7280' }}>Já tem conta? </span>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: '700', color: '#F97316',
              fontFamily: "'Inter', sans-serif", padding: 0,
            }}
          >
            Entrar →
          </button>
        </div>

      </div>

      {/* RODAPÉ — fixo */}
      <div style={{
        padding: '14px 20px', borderTop: '1px solid #F0F0F0',
        background: '#FAFAFA', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '6px', flexShrink: 0,
      }}>
        <img src={iconSemAnuncio} alt="" style={{ width: '16px', height: '16px' }} />
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#6B7280' }}>Sem propaganda. Nunca.</span>
      </div>

    </div>
  )
}

export default Cadastro