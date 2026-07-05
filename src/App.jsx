// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Landing from './pages/Landing'
import Cadastro from './pages/Cadastro'
import Login from './pages/Login'
import RecuperarSenha from './pages/RecuperarSenha'
import EmailEnviado from './pages/EmailEnviado'
import ConfirmeSeuEmail from './pages/ConfirmeSeuEmail'
import NovaSenha from './pages/NovaSenha'
import SenhaAlterada from './pages/SenhaAlterada'
import Onboarding1 from './pages/Onboarding1'
import Onboarding2 from './pages/Onboarding2'
import Onboarding3 from './pages/Onboarding3'
import Draft from './pages/Draft'
import Painel from './pages/Painel'
import Jogar from './pages/Jogar'
import Elenco from './pages/Elenco'
import Mercado from './pages/Mercado'
import Partida from './pages/Partida'
import Intervalo from './pages/Intervalo'
import LigaPrivada from './pages/LigaPrivada'
import Perfil from './pages/Perfil'

// Novas — fluxo de partida online
import BuscandoPartida from './pages/BuscandoPartida'
import PrePartida from './pages/PrePartida'
import ResultadoPartida from './pages/ResultadoPartida'

// Novas — busca apostada
import BuscaApostada from './pages/BuscaApostada'

// Modo carreira
import ModoCarreira from './pages/ModoCarreira'
import TorneioCarreira from './pages/TorneioCarreira'
import TabelaCompeticao from './pages/TabelaCompeticao'

// Copa relâmpago
import CopaRelampago from './pages/CopaRelampago'
import ChaveamentoCopa from './pages/ChaveamentoCopa'
import PremiacaoCopa from './pages/PremiacaoCopa'

// Social
import Amigos from './pages/Amigos'
import PerfilAmigo from './pages/PerfilAmigo'

// Vestiário
import Vestiario from './pages/Vestiario'

// Time oficial
import PainelTimeOficial from './pages/PainelTimeOficial'

// Elenco expansão
import DetalheJogador from './pages/DetalheJogador'

// Perfil expansão
import Configuracoes from './pages/Configuracoes'
import HistoricoMoedas from './pages/HistoricoMoedas'
import ConquistasCompletas from './pages/ConquistasCompletas'

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/draft" element={<Draft />} />

        {/* Núcleo do jogo */}
        <Route path="/painel" element={<Painel />} />
        <Route path="/jogar" element={<Jogar />} />
        <Route path="/elenco" element={<Elenco />} />
        <Route path="/mercado" element={<Mercado />} />
        <Route path="/partida" element={<Partida />} />
        <Route path="/intervalo" element={<Intervalo />} />
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
    </BrowserRouter>
  )
}

export default App