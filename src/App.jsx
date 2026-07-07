// src/App.jsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Landing = lazy(() => import('./pages/Landing'))
const Cadastro = lazy(() => import('./pages/Cadastro'))
const Login = lazy(() => import('./pages/Login'))
const RecuperarSenha = lazy(() => import('./pages/RecuperarSenha'))
const EmailEnviado = lazy(() => import('./pages/EmailEnviado'))
const ConfirmeSeuEmail = lazy(() => import('./pages/ConfirmeSeuEmail'))
const NovaSenha = lazy(() => import('./pages/NovaSenha'))
const SenhaAlterada = lazy(() => import('./pages/SenhaAlterada'))
const Onboarding1 = lazy(() => import('./pages/Onboarding1'))
const Onboarding2 = lazy(() => import('./pages/Onboarding2'))
const Onboarding3 = lazy(() => import('./pages/Onboarding3'))
const Painel = lazy(() => import('./pages/Painel'))
const Jogar = lazy(() => import('./pages/jogar'))
const Elenco = lazy(() => import('./pages/Elenco'))
const Mercado = lazy(() => import('./pages/Mercado'))
const Partida = lazy(() => import('./pages/Partida'))
const LigaPrivada = lazy(() => import('./pages/LigaPrivada'))
const Perfil = lazy(() => import('./pages/Perfil'))

// Novas — fluxo de partida online
const BuscandoPartida = lazy(() => import('./pages/BuscandoPartida'))
const PrePartida = lazy(() => import('./pages/PrePartida'))
const ResultadoPartida = lazy(() => import('./pages/ResultadoPartida'))

// Novas — busca apostada
const BuscaApostada = lazy(() => import('./pages/BuscaApostada'))

// Modo carreira
const ModoCarreira = lazy(() => import('./pages/ModoCarreira'))
const TorneioCarreira = lazy(() => import('./pages/TorneioCarreira'))
const TabelaCompeticao = lazy(() => import('./pages/TabelaCompeticao'))

// Copa relâmpago
const CopaRelampago = lazy(() => import('./pages/CopaRelampago'))
const ChaveamentoCopa = lazy(() => import('./pages/ChaveamentoCopa'))
const PremiacaoCopa = lazy(() => import('./pages/PremiacaoCopa'))

// Social
const Amigos = lazy(() => import('./pages/Amigos'))
const PerfilAmigo = lazy(() => import('./pages/PerfilAmigo'))

// Vestiário
const Vestiario = lazy(() => import('./pages/Vestiario'))

// Time oficial
const PainelTimeOficial = lazy(() => import('./pages/PainelTimeOficial'))

// Elenco expansão
const DetalheJogador = lazy(() => import('./pages/DetalheJogador'))

// Perfil expansão
const Configuracoes = lazy(() => import('./pages/Configuracoes'))
const HistoricoMoedas = lazy(() => import('./pages/HistoricoMoedas'))
const ConquistasCompletas = lazy(() => import('./pages/ConquistasCompletas'))

function CarregandoTela() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100vh', width: '100%', background: '#1C1C1C', gap: '16px',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        border: '4px solid rgba(249,115,22,0.25)', borderTopColor: '#F97316',
        animation: 'seumister-spin 0.8s linear infinite',
      }} />
      <style>{'@keyframes seumister-spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<CarregandoTela />}>
        <Routes>
          {/* Autenticação */}
          <Route path="/" element={<Landing />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/confirme-seu-email" element={<ConfirmeSeuEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/email-enviado" element={<EmailEnviado />} />
          <Route path="/nova-senha" element={<NovaSenha />} />
          <Route path="/senha-alterada" element={<SenhaAlterada />} />

          {/* Onboarding */}
          <Route path="/onboarding/1" element={<Onboarding1 />} />
          <Route path="/onboarding/2" element={<Onboarding2 />} />
          <Route path="/onboarding/3" element={<Onboarding3 />} />

          {/* Núcleo do jogo */}
          <Route path="/painel" element={<Painel />} />
          <Route path="/jogar" element={<Jogar />} />
          <Route path="/elenco" element={<Elenco />} />
          <Route path="/mercado" element={<Mercado />} />
          <Route path="/partida" element={<Partida />} />
          <Route path="/liga-privada" element={<LigaPrivada />} />
          <Route path="/perfil" element={<Perfil />} />

          {/* Fluxo de partida */}
          <Route path="/buscando-partida" element={<BuscandoPartida />} />
          <Route path="/pre-partida" element={<PrePartida />} />
          <Route path="/resultado-partida" element={<ResultadoPartida />} />

          {/* Busca apostada */}
          <Route path="/busca-apostada" element={<BuscaApostada />} />

          {/* Modo carreira */}
          <Route path="/modo-carreira" element={<ModoCarreira />} />
          <Route path="/torneio-carreira" element={<TorneioCarreira />} />
          <Route path="/competicao/:id" element={<TabelaCompeticao />} />

          {/* Copa Relâmpago */}
          <Route path="/copa-relampago" element={<CopaRelampago />} />
          <Route path="/copa-relampago/:id" element={<ChaveamentoCopa />} />
          <Route path="/copa-relampago/premiacao" element={<PremiacaoCopa />} />

          {/* Social */}
          <Route path="/amigos" element={<Amigos />} />
          <Route path="/amigos/:codigo" element={<PerfilAmigo />} />

          {/* Vestiário */}
          <Route path="/vestiario" element={<Vestiario />} />

          {/* Time oficial */}
          <Route path="/time-oficial" element={<PainelTimeOficial />} />

          {/* Elenco expansão */}
          <Route path="/jogador/:id" element={<DetalheJogador />} />

          {/* Perfil expansão */}
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/historico-moedas" element={<HistoricoMoedas />} />
          <Route path="/conquistas" element={<ConquistasCompletas />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
