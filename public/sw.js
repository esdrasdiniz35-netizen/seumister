import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registra o Service Worker (necessário no iOS pra manter a sessão de
// login firme quando o app é salvo na tela de início). `'serviceWorker'
// in navigator` garante que isso não quebra em nenhum navegador que não
// suporte — simplesmente não registra nada e segue o jogo normalmente.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((erro) => {
      console.error('Falha ao registrar o Service Worker:', erro)
    })
  })
}