import React from 'react'
import ReactDOM from 'react-dom/client'
import '@reown/appkit-wallet-button/react'
import 'antd/dist/reset.css'
import { App } from './app/App'
import './styles/globals.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
