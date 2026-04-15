import React from 'react'
import ReactDOM from 'react-dom/client'
import '@reown/appkit-wallet-button/react'
import 'antd/dist/reset.css'
import { App } from './app/App'
import './styles/globals.scss'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root was not found.')
}

const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootElement, app)
} else {
  ReactDOM.createRoot(rootElement).render(app)
}
