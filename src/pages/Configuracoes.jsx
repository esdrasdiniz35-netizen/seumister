// src/pages/Configuracoes.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import iconLogout from '../assets/icons/icon-logout.png'
import iconEye from '../assets/icons/icon-eye.png'
import iconEyeOff from '../assets/icons/icon-eye-off.png' // confirmar grafia exata: icon-eye-off.png (dois "f")

// ─── COMPONENTE TOGGLE ──────────────────────────────────────────────────────

function Toggle({ ativo, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '44px', height: '26px', borderRadius: '99px',
        background: ativo ? '#F97316' : '#E5E7EB',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.15s', flexShrink: 0, padding: 0,
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#fff', position: 'absolute', top: '3px',
        left: ativo ? '21px' : '3px',
        transition: 'left 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}

// ─── CAMPO DE INPUT EDITÁVEL ─────────────────────────────────────────────────

function CampoEditavel({ label, valor, onChange, tipo = 'text', placeholder }) {
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const ehSenha = tipo === 'password'

  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={ehSenha && !mostrarSenha ? 'password' : 'text'}
          value={valor}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            border: '1.5px solid #E5E7EB',
            borderRadius: '10px',
            padding: '11px 12px',
            paddingRight: ehSenha ? '40px' : '12px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#1C1C1C',
            fontFamily: "'Inter', sans-serif",
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {ehSenha && (
          <button
            onClick={() => setMostrarSenha(!mostrarSenha)}
            style={{
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              display: 'flex', alignItems: 'center',
            }}
          >
            <img src={mostrarSenha ? iconEye : iconEyeOff} alt="mostrar senha" style={{ width: '18px', height: '18px' }} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function Configuracoes() {
  const navigate = useNavigate()

  const [nomeTime, setNomeTime] = useState('Raposa FC')
  const [nomeTecnico, setNomeTecnico] = useState('Mister Diniz')
  const [email, setEmail] = useState('esdras@email.com')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')

  const [notificacoes, setNotificacoes] = useState({
    timeOficial: true,
    proximaRodada: true,
    copaRelampago: true,
    propostas: true,
    amigos: true,
    jogadorCritico: true,
    eventosVestiario: false,
  })

  const [salvo, setSalvo] = useState(false)

  function toggleNotificacao(chave) {
    setNotificacoes(prev => ({ ...prev, [chave]: !prev[chave] }))
  }

  function handleSalvar() {
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#F5F5F5',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* HEADER */}
      <div style={{
        padding: '14px 16px',
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', gap: '12px',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/perfil')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: '#1C1C1C', padding: '4px', lineHeight: 1 }}
        >
          ‹
        </button>
        <span style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C' }}>Configurações</span>
      </div>

      {/* CONTEÚDO */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* DADOS DO TIME */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C', marginBottom: '12px' }}>
            DADOS DO TIME
          </div>
          <CampoEditavel label="Nome do time" valor={nomeTime} onChange={setNomeTime} />
          <CampoEditavel label="Nome do técnico" valor={nomeTecnico} onChange={setNomeTecnico} />
        </div>

        {/* CONTA */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C', marginBottom: '12px' }}>
            CONTA
          </div>
          <CampoEditavel label="E-mail" valor={email} onChange={setEmail} />
          <CampoEditavel label="Senha atual" valor={senhaAtual} onChange={setSenhaAtual} tipo="password" placeholder="••••••••" />
          <CampoEditavel label="Nova senha" valor={novaSenha} onChange={setNovaSenha} tipo="password" placeholder="Deixe em branco para não alterar" />
        </div>

        {/* BOTÃO SALVAR */}
        <button
          onClick={handleSalvar}
          style={{
            width: '100%', background: salvo ? '#10B981' : '#F97316', color: '#fff',
            border: 'none', borderRadius: '12px', padding: '13px',
            fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            marginBottom: '14px', transition: 'background 0.2s',
          }}
        >
          {salvo ? '✓ ALTERAÇÕES SALVAS' : 'SALVAR ALTERAÇÕES'}
        </button>

        {/* NOTIFICAÇÕES */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '16px', marginBottom: '14px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1C1C1C', marginBottom: '4px' }}>
            NOTIFICAÇÕES
          </div>
          <div style={{ fontSize: '11px', fontWeight: '400', color: '#6B7280', marginBottom: '12px' }}>
            Escolha o que aparece no seu Vestiário
          </div>

          {[
            { chave: 'timeOficial', label: 'Convites de time oficial' },
            { chave: 'proximaRodada', label: 'Próxima rodada disponível' },
            { chave: 'copaRelampago', label: 'Copa Relâmpago' },
            { chave: 'propostas', label: 'Propostas por jogadores' },
            { chave: 'amigos', label: 'Pedidos de amizade' },
            { chave: 'jogadorCritico', label: 'Jogador em estado crítico' },
            { chave: 'eventosVestiario', label: 'Eventos de vestiário (briga, fofoca, etc)' },
          ].map((item, i, arr) => (
            <div
              key={item.chave}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < arr.length - 1 ? '1px solid #F5F5F5' : 'none',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#1C1C1C', flex: 1, paddingRight: '12px' }}>
                {item.label}
              </span>
              <Toggle ativo={notificacoes[item.chave]} onClick={() => toggleNotificacao(item.chave)} />
            </div>
          ))}
        </div>

        {/* BOTÃO SAIR */}
        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%', padding: '14px',
            background: '#fff', color: '#EF4444',
            border: '1.5px solid #EF4444', borderRadius: '12px',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '8px',
          }}
        >
          <img src={iconLogout} style={{ width: 18, height: 18 }} alt="sair" />
          Sair da conta
        </button>

      </div>

    </div>
  )
}