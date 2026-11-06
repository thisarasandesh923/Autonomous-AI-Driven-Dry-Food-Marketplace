import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/dm-serif-display/latin-400.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-600.css'
import './styles/global.css'
import './styles/marketplace.css'
import { App } from './app/App'

const root = document.getElementById('root')
if (!root) throw new Error('Application root is missing.')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
