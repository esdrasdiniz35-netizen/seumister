// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom'

import logo from '../assets/logo.png'
import mascoteConfiante from '../assets/confiante.png'
import iconCronometro from '../assets/cronometro.png'
import iconCamisa from '../assets/camisa.png'
import iconTime from '../assets/time.png'
import iconSemAnuncio from '../assets/sem anuncio.png'
import iconEstrategia from '../assets/estrategia.png'
import iconAmigosPunho from '../assets/amigos.png'
import iconTaca from '../assets/taça.png'

// ─── DOODLES DECORATIVOS — SVG à mão, mesmo espírito sticker do resto
// da identidade (contorno grosso, laranja/preto), sem depender de
// nenhum asset novo pra isso.

const Estrela = ({ size = 14, color = '#F97316' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 0L14.5 8.5L23 12L14.5 15.5L12 24L9.5 15.5L1 12L9.5 8.5Z" />
  </svg>
)

const SetaCurva = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 12" fill="none">
    <path d="M1 6C7 1 13 1 19 6" stroke="#D1D5DB" strokeWidth="2" strokeDasharray="1 5" strokeLinecap="round" />
    <path d="M15 3L19 6L15 9" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ─── DADOS DAS SEÇÕES ────────────────────────────────────────────────────

const BENEFICIOS = [
  { icone: iconCronometro,  titulo: 'PARTIDAS EM TEMPO REAL', sub: 'Acompanhe tudo ao vivo, lance a lance.' },
  { icone: iconCamisa,      titulo: 'JOGADORES REAIS',        sub: 'Elenco atualizado direto da API oficial.' },
  { icone: iconTime,        titulo: 'LIGAS COM AMIGOS',       sub: 'Crie ligas privadas e desafie a galera.' },
  { icone: iconSemAnuncio,  titulo: 'SEM PROPAGANDA',         sub: 'Foco total no jogo. Sempre foi assim.' },
]

const PASSOS = [
  { numero: '1', icone: iconEstrategia,    titulo: 'CRIA SEU TIME',    sub: 'Dê nome, escudo e monte seu elenco.' },
  { numero: '2', icone: iconAmigosPunho,   titulo: 'DESAFIA AMIGOS',   sub: 'Partidas em tempo real, muita rivalidade.' },
  { numero: '3', icone: iconTaca,          titulo: 'SOBE NA LIGA',     sub: 'Conquiste títulos e entre pra história.' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', sans-serif", background: '#fff', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderBottom: '1px solid #F5F5F5',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="Seu Mister" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <span style={{ fontSize: '15px', fontWeight: '900', color: '#1C1C1C', letterSpacing: '0.2px' }}>
              SEU <span style={{ color: '#F97316' }}>MISTER</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent', border: '1.5px solid #E5E7EB', borderRadius: '9px',
                padding: '8px 14px', fontSize: '12px', fontWeight: '700', color: '#1C1C1C',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/cadastro')}
              style={{
                background: '#F97316', border: 'none', borderRadius: '9px',
                padding: '8px 14px', fontSize: '12px', fontWeight: '700', color: '#fff',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap',
              }}
            >
              Criar conta
            </button>
          </div>
        </div>

        {/* HERO */}
        <div style={{ padding: '24px 20px 20px' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                <Estrela size={11} /><Estrela size={15} /><Estrela size={11} />
              </div>

              <h1 style={{
                fontSize: '26px', fontWeight: '900', color: '#1C1C1C',
                lineHeight: '1.1', letterSpacing: '-0.5px', margin: 0,
              }}>
                O MANAGER DE<br />FUTEBOL FEITO<br />
                <span style={{ color: '#F97316' }}>PRA VOCÊ.</span>
              </h1>

              <p style={{ fontSize: '12.5px', color: '#6B7280', lineHeight: '18px', margin: '10px 0 0' }}>
                Monte seu time. Desafie amigos. Conquiste títulos. Seja o Seu Mister.
              </p>
            </div>

            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'flex-end', width: '155px' }}>
              <img
                src={mascoteConfiante}
                alt="Seu Mister"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={() => navigate('/cadastro')}
              style={{
                background: '#F97316', color: '#fff', border: 'none', borderRadius: '12px',
                padding: '14px 22px', fontSize: '14px', fontWeight: '800', letterSpacing: '0.3px',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                boxShadow: '0 6px 16px rgba(249,115,22,0.35)',
              }}
            >
              CRIAR CONTA GRÁTIS
            </button>
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>é rápido!</span>
          </div>
        </div>

        {/* POR QUE TODO MUNDO JOGA */}
        <div style={{ padding: '4px 20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '18px' }}>
            <Estrela size={13} />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#1C1C1C', letterSpacing: '0.8px' }}>
              POR QUE TODO MUNDO JOGA
            </span>
            <Estrela size={13} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {BENEFICIOS.map((b) => (
              <div key={b.titulo} style={{
                border: '1.5px solid #E5E7EB', borderRadius: '14px', padding: '14px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px',
              }}>
                <img src={b.icone} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#1C1C1C', lineHeight: '14px' }}>
                  {b.titulo}
                </div>
                <div style={{ fontSize: '10.5px', color: '#9CA3AF', lineHeight: '14px' }}>
                  {b.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <div style={{ background: '#F5F5F5', padding: '28px 20px' }}>
          <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: '800', color: '#1C1C1C', letterSpacing: '0.8px', marginBottom: '20px' }}>
            COMO FUNCIONA
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '76px 22px 76px 22px 76px',
            justifyContent: 'center',
            rowGap: '10px',
          }}>
            {PASSOS.map((p, i) => (
              <div
                key={p.numero}
                style={{
                  gridColumn: i * 2 + 1,
                  gridRow: 1,
                  justifySelf: 'center',
                  alignSelf: 'center',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%', background: '#fff',
                  border: '2px solid #1C1C1C', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={p.icone} alt="" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                </div>
                <div style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#F97316', color: '#fff', fontSize: '10px', fontWeight: '900',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #F5F5F5',
                }}>
                  {p.numero}
                </div>
              </div>
            ))}

            {[0, 1].map((i) => (
              <div
                key={`seta-${i}`}
                style={{ gridColumn: i * 2 + 2, gridRow: 1, justifySelf: 'center', alignSelf: 'center' }}
              >
                <SetaCurva size={22} />
              </div>
            ))}

            {PASSOS.map((p, i) => (
              <div key={`texto-${p.numero}`} style={{ gridColumn: i * 2 + 1, gridRow: 2, textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#1C1C1C', lineHeight: '13px' }}>
                  {p.titulo}
                </div>
                <div style={{ fontSize: '9.5px', color: '#9CA3AF', lineHeight: '12px', marginTop: '4px' }}>
                  {p.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA FINAL */}
        <div style={{ padding: '28px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: '900', color: '#1C1C1C', marginBottom: '6px' }}>
            Bora montar seu time?
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>
            Grátis, sem cartão, sem enrolação.
          </div>
          <button
            onClick={() => navigate('/cadastro')}
            style={{
              width: '100%', background: '#F97316', color: '#fff', border: 'none', borderRadius: '12px',
              padding: '15px', fontSize: '14px', fontWeight: '800', letterSpacing: '0.3px',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              boxShadow: '0 6px 16px rgba(249,115,22,0.3)',
            }}
          >
            CRIAR CONTA GRÁTIS
          </button>
        </div>

        {/* FOOTER */}
        <div style={{ background: '#1C1C1C', padding: '24px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <img src={logo} alt="Seu Mister" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
            <span style={{ fontSize: '13px', fontWeight: '900', color: '#fff' }}>
              SEU <span style={{ color: '#F97316' }}>MISTER</span>
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
            {['Recursos', 'Ligas', 'Suporte', 'Regras'].map((l) => (
              <span key={l} style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '500' }}>{l}</span>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #374151', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>seumister.com.br</span>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>Sem propaganda. Nunca.</span>
          </div>
        </div>

      </div>
    </div>
  )
}