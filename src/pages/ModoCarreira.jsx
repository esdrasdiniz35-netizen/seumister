// src/pages/ModoCarreira.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

import iconPlanejamento from '../assets/icons/planejamento.png'
import iconAlvo from '../assets/icons/alvo.png'
import iconSacoMoedas from '../assets/icons/sacodemoedas.png'
import iconSubstituicao from '../assets/icons/subistituicao.png'
import { PREMIO_CAMPEAO } from '../lib/modoCarreiraConstants'

// ─── ÍCONES SVG INLINE ───────────────────────────────────────────────────────

const IconVoltar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M15 6L9 12L15 18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconTrofeu = ({ cor = '#6B7280' }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M6 3h12v9a6 6 0 01-12 0V3z" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 7H3a3 3 0 003 3" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 7h3a3 3 0 01-3 3" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18v3M8 21h8" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconEstrela = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#F97316">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const IconMoeda = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M12 6v12M9 9h4.5a1.5 1.5 0 010 3H9m0 0h4.5a1.5 1.5 0 010 3H9" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IconAviso = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function ModoCarreira() {
  const navigate = useNavigate()

  const [verificando, setVerificando]               = useState(true)
  const [entrando, setEntrando]                     = useState(null)  // 'normal' | 'avancado' | null
  const [erro, setErro]                             = useState(null)
  const [confirmandoAvancado, setConfirmandoAvancado] = useState(false)

  // ─── AO MONTAR: checa torneio ativo e redireciona se houver ─────────────
  useEffect(() => {
    const verificar = async () => {
      try {
        const dados = await apiFetch('/api/competicao/atual')
        if (dados.competicao) {
          navigate('/torneio-carreira', { replace: true })
          return
        }
      } catch (e) {
        console.error('Erro ao verificar torneio ativo:', e)
      } finally {
        setVerificando(false)
      }
    }
    verificar()
  }, [navigate])

  // ─── ENTRAR NO TORNEIO ────────────────────────────────────────────────────
  const handleEntrar = async (modo) => {
    if (modo === 'avancado' && !confirmandoAvancado) {
      setConfirmandoAvancado(true)
      return
    }

    setErro(null)
    setEntrando(modo)
    setConfirmandoAvancado(false)

    try {
      await apiFetch('/api/competicao/entrar', {
        method: 'POST',
        body: { modo },
      })
      navigate('/torneio-carreira')
    } catch (e) {
      setErro(e.message || 'Não foi possível entrar no torneio. Tente novamente.')
      setEntrando(null)
    }
  }

  const handleCancelarAvancado = () => {
    setConfirmandoAvancado(false)
    setErro(null)
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      background: '#F5F5F5',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 16px',
        background: '#1C1C1C',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/jogar')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '4px', lineHeight: 1, display: 'flex', alignItems: 'center',
          }}
        >
          <IconVoltar />
        </button>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', lineHeight: 1 }}>
            Modo Carreira
          </div>
          <div style={{ fontSize: '12px', fontWeight: '400', color: '#9CA3AF', marginTop: '2px' }}>
            32 times. 8 grupos. Um campeão.
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO PRINCIPAL ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* VERIFICANDO */}
        {verificando && (
          <div style={{
            background: '#fff', borderRadius: '14px', padding: '32px 16px',
            textAlign: 'center', border: '1.5px solid #E5E7EB', flexShrink: 0,
          }}>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>Verificando torneios...</div>
          </div>
        )}

        {/* ERRO */}
        {erro && (
          <div style={{
            background: '#FEF2F2', border: '1.5px solid #FECACA',
            borderRadius: '10px', padding: '10px 12px', flexShrink: 0,
          }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#EF4444' }}>{erro}</span>
          </div>
        )}

        {/* CARDS DOS MODOS (só aparece depois de confirmar que não há torneio ativo) */}
        {!verificando && (
          <>

            {/* ── CARD NORMAL — corpo + rodapé encostado, cada um com flexShrink:0 ── */}
            <div style={{ flexShrink: 0 }}>
              <div style={{
                background: '#fff', borderRadius: '14px 14px 0 0',
                border: '1.5px solid #E5E7EB', borderBottom: 'none',
                padding: '12px 12px 10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <IconTrofeu cor="#6B7280" />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C', lineHeight: 1 }}>
                      Normal
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>
                      37 clubes de médio e pequeno porte
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '11.5px', color: '#6B7280', margin: '0 0 8px', lineHeight: '1.5' }}>
                  8 grupos de 4 times. Os 2 melhores de cada grupo avançam para o mata-mata — ida e volta até a final.
                </p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', color: '#6B7280',
                    background: '#F5F5F5', padding: '3px 8px', borderRadius: '99px',
                  }}>
                    32 times
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', color: '#6B7280',
                    background: '#F5F5F5', padding: '3px 8px', borderRadius: '99px',
                  }}>
                    Fase de grupos + Mata-mata
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: '700', color: '#10B981',
                    background: '#ECFDF5', padding: '3px 8px', borderRadius: '99px',
                  }}>
                    🏆 +{PREMIO_CAMPEAO.normal} moedas ao campeão
                  </span>
                </div>
              </div>

              {/* Rodapé — visualmente encostado no card, mas fora do overflow:hidden dele */}
              <div style={{
                background: '#fff', borderRadius: '0 0 14px 14px',
                border: '1.5px solid #E5E7EB', borderTop: '1px solid #F5F5F5',
                padding: '10px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IconMoeda />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#F59E0B' }}>10 moedas</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>para entrar</span>
                </div>
                <button
                  onClick={() => handleEntrar('normal')}
                  disabled={!!entrando}
                  style={{
                    background: entrando === 'normal' ? '#D1D5DB' : '#10B981',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    padding: '8px 16px', fontSize: '13px', fontWeight: '700',
                    cursor: entrando ? 'default' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {entrando === 'normal' ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </div>

            {/* ── CARD AVANÇADO — mesma estrutura de corpo + rodapé encostado ── */}
            <div style={{ flexShrink: 0 }}>
              <div style={{
                borderRadius: '14px 14px 0 0',
                border: confirmandoAvancado ? '2px solid #F97316' : '1.5px solid #E5E7EB',
                borderBottom: 'none',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #F97316 0%, #EA580C 100%)',
                  padding: '5px 12px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <IconEstrela />
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>
                    LIGA DOS MELHORES
                  </span>
                </div>

                <div style={{ background: '#fff', padding: '12px 12px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <IconTrofeu cor="#F97316" />
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C', lineHeight: 1 }}>
                        Avançado
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>
                        Os gigantes do futebol mundial
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#6B7280', margin: '0 0 8px', lineHeight: '1.5' }}>
                    Real Madrid, Barcelona, City, PSG, Bayern — mais os grandes do Brasil e da Europa. Mesmo formato, adversários muito mais fortes.
                  </p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '600', color: '#F97316',
                      background: '#FFF7ED', padding: '3px 8px', borderRadius: '99px',
                    }}>
                      32 times de elite
                    </span>
                    <span style={{
                      fontSize: '11px', fontWeight: '600', color: '#F97316',
                      background: '#FFF7ED', padding: '3px 8px', borderRadius: '99px',
                    }}>
                      Bônus de porte ativo
                    </span>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', color: '#10B981',
                      background: '#ECFDF5', padding: '3px 8px', borderRadius: '99px',
                    }}>
                      🏆 +{PREMIO_CAMPEAO.avancado} moedas ao campeão
                    </span>
                  </div>
                </div>

                {confirmandoAvancado && (
                  <div style={{
                    margin: '0 12px 10px',
                    background: '#FFFBEB', borderRadius: '10px',
                    border: '1px solid #FDE68A',
                    padding: '9px 11px',
                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                  }}>
                    <div style={{ flexShrink: 0, marginTop: '1px' }}>
                      <IconAviso />
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#92400E', margin: 0, lineHeight: '1.5' }}>
                      <strong>Aqui jogam os melhores.</strong> Sem um elenco forte, você vai passar vergonha na frente de todo mundo. Tem certeza que quer entrar?
                    </p>
                  </div>
                )}
              </div>

              {/* Rodapé — encostado no card, fora do overflow:hidden */}
              <div style={{
                background: '#fff', borderRadius: '0 0 14px 14px',
                border: confirmandoAvancado ? '2px solid #F97316' : '1.5px solid #E5E7EB',
                borderTop: '1px solid #F5F5F5',
                padding: '10px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                  <IconMoeda />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#F59E0B' }}>50 moedas</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>para entrar</span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {confirmandoAvancado && (
                    <button
                      onClick={handleCancelarAvancado}
                      style={{
                        background: '#F5F5F5', color: '#6B7280',
                        border: 'none', borderRadius: '10px',
                        padding: '8px 12px', fontSize: '12px', fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={() => handleEntrar('avancado')}
                    disabled={!!entrando}
                    style={{
                      background: entrando === 'avancado'
                        ? '#D1D5DB'
                        : confirmandoAvancado
                          ? '#F97316'
                          : '#10B981',
                      color: '#fff', border: 'none', borderRadius: '10px',
                      padding: '8px 16px', fontSize: '13px', fontWeight: '700',
                      cursor: entrando ? 'default' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    {entrando === 'avancado'
                      ? 'Entrando...'
                      : confirmandoAvancado
                        ? 'Sim, quero entrar'
                        : 'Entrar'}
                  </button>
                </div>
              </div>
            </div>

            {/* ── COMO FUNCIONA ──────────────────────────────────────────────── */}
            <div style={{
              background: '#fff', borderRadius: '14px',
              border: '1.5px solid #E5E7EB', padding: '12px',
              flexShrink: 0,
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1C1C1C', marginBottom: '8px' }}>
                Como funciona
              </div>
              {[
                [iconPlanejamento, 'Fase de grupos', '8 grupos de 4 times. Os 2 primeiros de cada grupo avançam.'],
                [iconAlvo, 'Mata-mata', 'Oitavas, quartas, semi e final — tudo em ida e volta. Empate no agregado vai para pênaltis.'],
                [iconSacoMoedas, 'Recompensas', 'Você ganha moedas em cada partida, ganhe ou perca. Quem vencer a final leva o prêmio extra.'],
                [iconSubstituicao, 'Re-entrada livre', 'Pode entrar em quantos torneios quiser no mês. Só não dá para ter dois ativos ao mesmo tempo.'],
              ].map(([icone, titulo, desc]) => (
                <div key={titulo} style={{
                  display: 'flex', gap: '9px', alignItems: 'flex-start',
                  marginBottom: '8px',
                }}>
                  <img src={icone} alt="" style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '1px', objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#1C1C1C' }}>{titulo}</div>
                    <div style={{ fontSize: '10.5px', color: '#6B7280', lineHeight: '1.4', marginTop: '2px' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

          </>
        )}

      </div>
    </div>
  )
}