import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import './i18n.js'
import App from './App.jsx'
import AutoTranslator from './components/AutoTranslator.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AutoTranslator>
      <App />
    </AutoTranslator>
  </StrictMode>,
)
