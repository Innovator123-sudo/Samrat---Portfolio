import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/fraunces/wght.css'
import '@fontsource-variable/fraunces/wght-italic.css'
import '@fontsource-variable/manrope/wght.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './index.css'
import App from './App'
import { useJourney } from './state/journeyStore'

const params = new URLSearchParams(window.location.search)
if (params.get('static') === '1' || params.get('read') === '1') {
  useJourney.setState({ staticMode: true })
}

const initialTheme = useJourney.getState().theme
document.documentElement.dataset.theme = initialTheme
document.documentElement.style.colorScheme = initialTheme

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
