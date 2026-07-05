// src/pages/NovaSenha.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

import logo from '../assets/logo.png'
import mascoteBusto from '../assets/busto_apito.png'
import iconLock from '../assets/icons/icon-lock.png'
import iconEye from '../assets/icons/icon-eye.png'
import iconEyeOff from '../assets/icons/icon-eye-off.png'
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

function calcularForca(senha) {
  if (senha.length === 0) return null
  let pontos = 0
  if (senha.length >= 8) pontos++
  if (/[A-Z]/.test(senha)) pontos++
  if (/[0-9]/.test(senha)) pontos++
  if (/[^A-Za-z0-9]/.test(senha)) pontos++
  if (pontos <= 1) return { label: 'Fraca', cor: '#EF4444', largura: '33%' }
  if (pontos <= 2) return { label: 'Média', cor: '#F97316', largura: '66%' }
  return { label: 'Forte', cor: '#10B981', largura: '100%' }
}

export default function NovaSenha() {
  const navigate = useNavigate()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarNova, setMostrarNova] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const forca = calcularForca(novaSenha)

  async function handleSalvar() {
    if (carregando) return

    if (!novaSenha || !confirmarSenha) {
      setErro('Preenche os dois campos.')
      return
    }
    if (novaSenha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setErro('')
    setCarregando(true)

    try {
      // Troca real de senha via Supabase — usa a sessão de recovery
      // criada automaticamente quando o link do e-mail é aberto. Antes
      // disso a tela só validava os campos e navegava direto pra
      // "senha alterada" sem trocar nada de verdade.
      const { error } = await supabase.auth.updateUser({ password: novaSenha })

      if (error) {
        setErro('Não foi possível salvar a nova senha. O link pode ter expirado — pede um novo link e tenta de novo.')
        setCarregando(false)
        return
      }

      navigate('/senha-alterada')
    } catch (err) {
      setErro('Não foi possível salvar. Verifica sua internet e tenta de novo.')
      setCarregando(false)
    }
  }

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#FFFFFF', height: '100dvh',
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
            Quase lá! Escolhe uma senha forte.
          </div>
        </div>

        {/* TÍTULO */}
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1C1C1C', margin: '0 0 4px', lineHeight: '31px' }}>
          Nova senha.
        </h1>
        <p style={{ fontSize: '13px', fontWeight: '400', color: '#6B7280', margin: '0 0 26px' }}>
          Crie uma senha nova pra proteger sua conta.
        </p>

        {/* CAMPO NOVA SENHA */}
        <CampoComIcone icone={iconLock} alt="nova senha">
          <input
            type={mostrarNova ? 'text' : 'password'}
            placeholder="Nova senha"
            value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)}
            disabled={carregando}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '15px', fontWeight: '500', color: '#1C1C1C',
              fontFamily: "'Inter', sans-serif", width: '100%',
            }}
          />
          <button
            onClick={() => setMostrarNova(!mostrarNova)}
            type="button"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}
          >
            <img src={mostrarNova ? iconEyeOff : iconEye} alt="mostrar senha" style={{ width: '18px', height: '18px', opacity: 0.5 }} />
          </button>
        </CampoComIcone>

        {/* BARRA DE FORÇA — real, calculada no cliente */}
        {forca && (
          <div style={{ marginTop: '-4px', marginBottom: '14px' }}>
            <div style={{ height: '5px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: forca.largura, height: '100%', background: forca.cor,
                borderRadius: '4px', transition: 'width 0.3s ease, background 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: forca.cor, marginTop: '4px', display: 'inline-block' }}>
              {forca.label}
            </span>
          </div>
        )}

        {/* CAMPO CONFIRMAR SENHA */}
        <CampoComIcone icone={iconLock} alt="confirmar senha">
          <input
            type={mostrarConfirmar ? 'text' : 'password'}
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={e => setConfirmarSenha(e.target.value)}
            disabled={carregando}
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

        {/* BOTÃO SALVAR */}
        <button
          onClick={handleSalvar}
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
          {carregando ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}
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